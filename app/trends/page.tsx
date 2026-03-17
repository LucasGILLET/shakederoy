'use client';

import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Flame, Sparkles, Trophy } from 'lucide-react';
import { CocktailCard } from '../components/CocktailCard';
import { apiFetch, apiFetchList } from '../lib/api';
import { mapRawCocktail, type RawCocktail } from '../catalogue/catalogueFilters';

type MappedCocktail = ReturnType<typeof mapRawCocktail>;
type TrendCocktail = MappedCocktail & { scoreValue: string };

type TrendSection = {
    id: string;
    title: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    iconClassName: string;
    cocktails: TrendCocktail[];
};

interface CocktailOfMonthRow {
    id: string;
    cocktail_id: string;
    rank: number;
    year: number;
    month: number;
}

interface VoteSummary {
    cocktail_id: string;
    upvotes: number;
    downvotes: number;
    score: number;
    total: number;
}

function isApprovedCocktail(cocktail: RawCocktail) {
    const status = typeof (cocktail as RawCocktail & { status?: unknown }).status === 'string'
        ? String((cocktail as RawCocktail & { status?: unknown }).status)
        : 'approved';

    return status === 'approved';
}

export default function Trends() {
    const [sections, setSections] = useState<TrendSection[]>([]);
    const [cocktailOfMonth, setCocktailOfMonth] = useState<MappedCocktail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadTrends = async () => {
            setLoading(true);
            setError('');

            try {
                const currentDate = new Date();

                const sectionRequests = [
                    {
                        id: 'top-voted',
                        title: 'Top votes',
                        description: 'Les cocktails les mieux notes par la communaute.',
                        icon: Trophy,
                        iconClassName: 'text-yellow-500',
                        endpoint: '/cocktails?sort_by=best_rated&status=approved',
                    },
                    {
                        id: 'most-viewed',
                        title: 'Plus consultes',
                        description: 'Les recettes les plus consultees du moment.',
                        icon: Eye,
                        iconClassName: 'text-sky-500',
                        endpoint: '/cocktails?sort_by=most_viewed&status=approved',
                    },
                    {
                        id: 'newest',
                        title: 'Nouveautes',
                        description: 'Les derniers cocktails publies et approuves.',
                        icon: Sparkles,
                        iconClassName: 'text-teal-500',
                        endpoint: '/cocktails?sort_by=newest&status=approved',
                    },
                ] as const;

                const [loadedSections, ofMonthEntries] = await Promise.all([
                    Promise.all(
                        sectionRequests.map(async (section) => {
                            const cocktails = await apiFetchList<RawCocktail>(section.endpoint);
                            const mappedCocktails = cocktails
                                .filter(isApprovedCocktail)
                                .map(mapRawCocktail)
                                .slice(0, 6);

                            const voteSummaries = await Promise.all(
                                mappedCocktails.map(async (cocktail) => {
                                    const summary = await apiFetch<VoteSummary>(`/cocktails/${cocktail.id}/votes/summary`).catch(() => null);
                                    return [cocktail.id, summary] as const;
                                })
                            );

                            const voteSummaryMap = new Map(voteSummaries);

                            return {
                                id: section.id,
                                title: section.title,
                                description: section.description,
                                icon: section.icon,
                                iconClassName: section.iconClassName,
                                cocktails: mappedCocktails.map((cocktail) => ({
                                    ...cocktail,
                                    scoreValue: String(voteSummaryMap.get(cocktail.id)?.score ?? 0),
                                })),
                            };
                        })
                    ),
                    apiFetchList<CocktailOfMonthRow>(
                        `/cocktails/of-month?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`
                    ).catch(() => []),
                ]);

                setSections(loadedSections);

                const featuredEntry = [...ofMonthEntries].sort((a, b) => a.rank - b.rank)[0];

                if (featuredEntry?.cocktail_id) {
                    const featuredCocktail = await apiFetch<RawCocktail>(`/cocktails/${featuredEntry.cocktail_id}`).catch(() => null);

                    if (featuredCocktail && isApprovedCocktail(featuredCocktail)) {
                        setCocktailOfMonth(mapRawCocktail(featuredCocktail));
                    } else {
                        setCocktailOfMonth(null);
                    }
                } else {
                    setCocktailOfMonth(null);
                }
            } catch {
                setError('Impossible de charger les tendances.');
                setSections([]);
                setCocktailOfMonth(null);
            } finally {
                setLoading(false);
            }
        };

        void loadTrends();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center text-4xl font-display">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 animate-bounce-in">
                    <div className="text-7xl mb-4 animate-wiggle">T</div>
                    <h1 className="text-6xl md:text-8xl font-display mb-4 hover-bounce">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
                            Tendances
                        </span>
                    </h1>
                    <p className="text-2xl text-gray-600">Les cocktails qui font bouger ShakeDeRoy en ce moment.</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        {error}
                    </div>
                )}

                {cocktailOfMonth && (
                    <div className="card-skew bg-white p-8 mb-12 shadow-lg">
                        <div className="transform skewY(2deg)">
                            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 mb-3 bg-gradient-to-r from-yellow-400 to-orange-500 border-4 border-brand-dark px-4 py-2 font-black text-white transform -rotate-2">
                                        <Flame className="w-5 h-5" />
                                        Cocktail du mois
                                    </div>
                                    <h2 className="text-4xl font-display mb-2">{cocktailOfMonth.name}</h2>
                                    <p className="text-lg text-gray-600 max-w-2xl">
                                        {cocktailOfMonth.description || 'La selection mise en avant ce mois-ci.'}
                                    </p>
                                </div>
                                <Link
                                    href={`/cocktail/${cocktailOfMonth.id}`}
                                    className="inline-flex items-center justify-center border-4 border-brand-dark bg-brand-primary px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
                                >
                                    Voir le cocktail
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {sections.length > 0 ? (
                    <div className="space-y-14">
                        {sections.map((section) => {
                            const Icon = section.icon;

                            return (
                                <section key={section.id}>
                                    <div className="mb-6 flex items-center gap-3">
                                        <Icon className={`w-8 h-8 ${section.iconClassName}`} />
                                        <div>
                                            <h2 className="text-3xl font-display">{section.title}</h2>
                                            <p className="text-gray-600">{section.description}</p>
                                        </div>
                                    </div>

                                    {section.cocktails.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                                            {section.cocktails.map((cocktail, index) => (
                                                <div
                                                    key={`${section.id}-${cocktail.id}`}
                                                    className="relative animate-slide-left"
                                                    style={{ animationDelay: `${index * 0.05}s` }}
                                                >
                                                    <CocktailCard
                                                        {...cocktail}
                                                        metaLabel="score"
                                                        metaValue={cocktail.scoreValue}
                                                    />
                                                    {section.id === 'top-voted' && index < 3 && (
                                                        <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-brand-dark text-white font-black text-xl flex items-center justify-center transform rotate-12 shadow-lg z-10">
                                                            #{index + 1}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="card-skew bg-white p-10 text-center">
                                            <div className="transform skewY(2deg)">
                                                <h3 className="text-3xl font-display mb-3">Aucune donnee disponible</h3>
                                                <p className="text-lg text-gray-600">
                                                    Cette section n&apos;a pas encore assez de donnees pour afficher des cocktails.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                ) : (
                    <div className="card-skew bg-white p-16 text-center">
                        <div className="transform skewY(2deg)">
                            <h2 className="text-4xl font-display mb-4">Aucune tendance disponible</h2>
                            <p className="text-xl text-gray-600">Le back ne renvoie encore aucun cocktail exploitable pour cette page.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
