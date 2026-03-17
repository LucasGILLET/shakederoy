'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPin, Star } from 'lucide-react';
import { CocktailCard } from '../components/CocktailCard';
import { apiFetch, apiFetchList } from '../lib/api';
import { mapRawCocktail, type RawCocktail } from '../catalogue/catalogueFilters';

interface Bar {
    id: string;
    name: string;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    style?: string | null;
    description?: string | null;
}

interface BarSignatureCocktailRow {
    id: string;
    cocktail_id: string;
}

export default function BarsPage() {
    const [bars, setBars] = useState<Bar[]>([]);
    const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
    const [signatureCocktails, setSignatureCocktails] = useState<ReturnType<typeof mapRawCocktail>[]>([]);
    const [allCocktails, setAllCocktails] = useState<ReturnType<typeof mapRawCocktail>[]>([]);
    const [filterType, setFilterType] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadBars = async () => {
            setError('');

            try {
                const [barsData, cocktailsData] = await Promise.all([
                    apiFetch<Bar[]>('/bars'),
                    apiFetchList<RawCocktail>('/cocktails'),
                ]);

                const mappedCocktails = cocktailsData
                    .filter((cocktail) => {
                        const status = typeof (cocktail as RawCocktail & { status?: unknown }).status === 'string'
                            ? String((cocktail as RawCocktail & { status?: unknown }).status)
                            : 'approved';
                        return status === 'approved';
                    })
                    .map(mapRawCocktail);

                setBars(barsData);
                setSelectedBar(barsData[0] ?? null);
                setAllCocktails(mappedCocktails);
            } catch {
                setError('Impossible de charger les bars partenaires.');
            } finally {
                setLoading(false);
            }
        };

        void loadBars();
    }, []);

    useEffect(() => {
        if (!selectedBar) {
            setSignatureCocktails([]);
            return;
        }

        const loadSignatureCocktails = async () => {
            try {
                const rows = await apiFetch<BarSignatureCocktailRow[]>(`/bars/${selectedBar.id}/signature-cocktails`);
                const ids = new Set(rows.map((row) => row.cocktail_id));
                setSignatureCocktails(allCocktails.filter((cocktail) => ids.has(cocktail.id)).slice(0, 4));
            } catch {
                setSignatureCocktails([]);
            }
        };

        void loadSignatureCocktails();
    }, [allCocktails, selectedBar]);

    const availableStyles = useMemo(
        () => Array.from(new Set(bars.map((bar) => bar.style).filter(Boolean))) as string[],
        [bars]
    );

    const filteredBars = useMemo(() => {
        if (filterType === 'all') {
            return bars;
        }
        return bars.filter((bar) => bar.style === filterType);
    }, [bars, filterType]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center text-4xl font-display">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12 animate-bounce-in">
                    <div className="text-7xl mb-4 animate-wiggle">B</div>
                    <h1 className="text-6xl md:text-8xl font-display mb-4 hover-bounce">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-teal-500 to-green-500">
                            Bars partenaires
                        </span>
                    </h1>
                    <p className="text-2xl text-gray-600">Annuaire simple des bars et de leurs cocktails signature.</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        {error}
                    </div>
                )}

                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    <button
                        type="button"
                        onClick={() => setFilterType('all')}
                        className={`px-6 py-3 font-bold border-4 transition-all transform skewX(-5deg) ${
                            filterType === 'all'
                                ? 'bg-brand-primary text-white border-brand-dark'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-brand-primary'
                        }`}
                    >
                        <span className="transform skewX(5deg) inline-block">Tous</span>
                    </button>
                    {availableStyles.map((style) => (
                        <button
                            key={style}
                            type="button"
                            onClick={() => setFilterType(style)}
                            className={`px-6 py-3 font-bold border-4 transition-all transform skewX(-5deg) ${
                                filterType === style
                                    ? 'bg-brand-secondary text-white border-brand-dark'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-brand-secondary'
                            }`}
                        >
                            <span className="transform skewX(5deg) inline-block">{style}</span>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-1 space-y-8">
                        <h2 className="text-2xl font-display">{filteredBars.length} bars trouves</h2>

                        {filteredBars.length > 0 ? (
                            filteredBars.map((bar, index) => (
                                <button
                                    key={bar.id}
                                    type="button"
                                    onClick={() => setSelectedBar(bar)}
                                    className={`card-skew p-4 cursor-pointer transition-all hover:scale-105 text-left w-full ${
                                        selectedBar?.id === bar.id
                                            ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white'
                                            : 'bg-white'
                                    } animate-slide-left`}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <div className="transform skewY(2deg)">
                                        <h3 className="font-display text-2xl mb-2">{bar.name}</h3>
                                        <p className={`text-sm mb-2 ${selectedBar?.id === bar.id ? 'text-white/80' : 'text-gray-600'}`}>
                                            {[bar.address, bar.city, bar.country].filter(Boolean).join(', ') || 'Adresse non renseignee'}
                                        </p>
                                        <div className="flex items-center gap-3 text-sm font-bold">
                                            <span>{bar.style || 'Style non renseigne'}</span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="card-skew bg-white p-8 text-center">
                                <div className="transform skewY(2deg)">
                                    <p className="text-lg text-gray-600">Aucun bar ne correspond a ce filtre.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        {selectedBar ? (
                            <div className="card-skew bg-white p-8">
                                <div className="transform skewY(2deg)">
                                    <div className="flex items-start justify-between mb-8 gap-4">
                                        <div>
                                            <h2 className="text-4xl font-display mb-2">{selectedBar.name}</h2>
                                            <p className="text-gray-600 text-lg mb-3">{selectedBar.style || 'Style non renseigne'}</p>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="w-5 h-5" />
                                                {[selectedBar.address, selectedBar.city, selectedBar.country].filter(Boolean).join(', ') || 'Adresse non renseignee'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 font-bold text-yellow-600">
                                            <Star className="w-5 h-5 fill-current" />
                                            Annuaire
                                        </div>
                                    </div>

                                    <p className="text-lg text-gray-700 mb-10">
                                        {selectedBar.description || 'Aucune description disponible pour ce bar.'}
                                    </p>

                                    <h3 className="text-3xl font-display mb-6">Cocktails signature</h3>
                                    {signatureCocktails.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                                            {signatureCocktails.map((cocktail) => (
                                                <CocktailCard key={cocktail.id} {...cocktail} />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Aucun cocktail signature affiche pour ce bar.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="card-skew bg-white p-16 text-center">
                                <div className="transform skewY(2deg)">
                                    <h2 className="text-4xl font-display mb-4">Aucun bar disponible</h2>
                                    <p className="text-xl text-gray-600">Le catalogue de bars est vide pour le moment.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
