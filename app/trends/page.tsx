'use client';

import { useEffect, useMemo, useState } from 'react';
import { Flame, Sparkles, Trophy } from 'lucide-react';
import { CocktailCard } from '../components/CocktailCard';
import { apiFetch } from '../lib/api';
import { mapRawCocktail, type RawCocktail } from '../catalogue/catalogueFilters';

type TrendFilter = 'hot' | 'new' | 'top';

interface VoteRow {
    id: string;
    vote_type: 'upvote' | 'downvote';
}

export default function Trends() {
    const [filter, setFilter] = useState<TrendFilter>('hot');
    const [hotCocktails, setHotCocktails] = useState<ReturnType<typeof mapRawCocktail>[]>([]);
    const [newCocktails, setNewCocktails] = useState<ReturnType<typeof mapRawCocktail>[]>([]);
    const [topCocktails, setTopCocktails] = useState<ReturnType<typeof mapRawCocktail>[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadTrends = async () => {
            setError('');

            try {
                const cocktails = await apiFetch<RawCocktail[]>('/cocktails');
                const approvedCocktails = cocktails
                    .filter((cocktail) => {
                        const status = typeof (cocktail as RawCocktail & { status?: unknown }).status === 'string'
                            ? String((cocktail as RawCocktail & { status?: unknown }).status)
                            : 'approved';
                        return status === 'approved';
                    })
                    .map(mapRawCocktail);

                const voteEntries = await Promise.all(
                    approvedCocktails.slice(0, 12).map(async (cocktail) => {
                        const votes = await apiFetch<VoteRow[]>(`/cocktails/${cocktail.id}/votes`).catch(() => []);
                        const score = votes.reduce((total, vote) => total + (vote.vote_type === 'upvote' ? 1 : -1), 0);
                        return { cocktail, score, totalVotes: votes.length };
                    })
                );

                setNewCocktails(approvedCocktails.slice(0, 6));
                setHotCocktails(
                    [...voteEntries]
                        .sort((a, b) => b.totalVotes - a.totalVotes)
                        .slice(0, 6)
                        .map((entry) => entry.cocktail)
                );
                setTopCocktails(
                    [...voteEntries]
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 3)
                        .map((entry) => entry.cocktail)
                );
            } catch {
                setError('Impossible de charger les tendances.');
            } finally {
                setLoading(false);
            }
        };

        void loadTrends();
    }, []);

    const displayedCocktails = useMemo(() => {
        if (filter === 'new') {
            return newCocktails;
        }

        if (filter === 'top') {
            return topCocktails;
        }

        return hotCocktails;
    }, [filter, hotCocktails, newCocktails, topCocktails]);

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
                    <p className="text-2xl text-gray-600">Les cocktails les plus visibles et les plus apprecies.</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        {error}
                    </div>
                )}

                <div className="flex justify-center gap-4 mb-12">
                    <button
                        type="button"
                        onClick={() => setFilter('hot')}
                        className={`px-8 py-4 font-bold text-lg border-4 transition-all transform skewX(-5deg) ${
                            filter === 'hot'
                                ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-brand-dark shadow-lg'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'
                        }`}
                    >
                        <span className="transform skewX(5deg) inline-flex items-center gap-2">
                            <Flame className="w-6 h-6" />
                            Hot
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('new')}
                        className={`px-8 py-4 font-bold text-lg border-4 transition-all transform skewX(-5deg) ${
                            filter === 'new'
                                ? 'bg-gradient-to-r from-teal-400 to-blue-500 text-white border-brand-dark shadow-lg'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
                        }`}
                    >
                        <span className="transform skewX(5deg) inline-flex items-center gap-2">
                            <Sparkles className="w-6 h-6" />
                            Nouveaux
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('top')}
                        className={`px-8 py-4 font-bold text-lg border-4 transition-all transform skewX(-5deg) ${
                            filter === 'top'
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-brand-dark shadow-lg'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-yellow-400'
                        }`}
                    >
                        <span className="transform skewX(5deg) inline-flex items-center gap-2">
                            <Trophy className="w-6 h-6" />
                            Top
                        </span>
                    </button>
                </div>

                <div className="mb-8">
                    <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
                        {filter === 'hot' && <><Flame className="w-8 h-8 text-orange-500" /> Les plus votes</>}
                        {filter === 'new' && <><Sparkles className="w-8 h-8 text-teal-500" /> Les derniers approuves</>}
                        {filter === 'top' && <><Trophy className="w-8 h-8 text-yellow-500" /> Les mieux notes</>}
                    </h2>

                    {displayedCocktails.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                            {displayedCocktails.map((cocktail, index) => (
                                <div key={cocktail.id} className="relative animate-slide-left" style={{ animationDelay: `${index * 0.05}s` }}>
                                    <CocktailCard {...cocktail} />
                                    {filter === 'top' && index < 3 && (
                                        <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-brand-dark text-white font-black text-xl flex items-center justify-center transform rotate-12 shadow-lg z-10">
                                            #{index + 1}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card-skew bg-white p-16 text-center">
                            <div className="transform skewY(2deg)">
                                <h2 className="text-4xl font-display mb-4">Aucune tendance disponible</h2>
                                <p className="text-xl text-gray-600">Les donnees de votes ne sont pas encore suffisantes.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
