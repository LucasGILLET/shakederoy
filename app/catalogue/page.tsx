'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { Button } from '../components/Button';
import { CocktailCard } from '../components/CocktailCard';
import { apiFetchList } from '../lib/api';
import { fetchFavoritesPage, toggleFavorite } from '../lib/favoritesApi';
import type { Cocktail } from '../lib/data';
import {
    ALCOHOL_FILTERS,
    DEFAULT_SORT,
    DIFFICULTY_FILTERS,
    SORT_OPTIONS,
    applyCatalogueFilters,
    extractFavoriteIds,
    getActiveFilterLabels,
    getNextFavoritesPage,
    hasActiveFilters,
    mapRawCocktail,
    type AlcoholFilter,
    type DifficultyFilter,
    type RawCocktail,
    type SortOption,
} from './catalogueFilters';

export default function Catalogue() {
    const [cocktails, setCocktails] = useState<Cocktail[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [favoriteError, setFavoriteError] = useState('');
    const [search, setSearch] = useState('');
    const [alcoholFilter, setAlcoholFilter] = useState<AlcoholFilter>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
    const [sortBy, setSortBy] = useState<SortOption>(DEFAULT_SORT);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const MAX_FAVORITES_PAGES = 25;

        const fetchAllFavoriteIds = async (): Promise<Set<string>> => {
            const allFavoriteIds = new Set<string>();
            let currentPage = 1;

            for (let requestCount = 0; requestCount < MAX_FAVORITES_PAGES; requestCount += 1) {
                const pageData = await fetchFavoritesPage({ page: currentPage });
                extractFavoriteIds(pageData).forEach((id) => allFavoriteIds.add(id));

                const nextPage = getNextFavoritesPage(pageData, currentPage);
                if (nextPage === null || nextPage <= currentPage) {
                    break;
                }

                currentPage = nextPage;
            }

            return allFavoriteIds;
        };

        const fetchCocktails = async () => {
            setLoading(true);
            setError('');
            setFavoriteError('');

            try {
                const favoritesPromise = fetchAllFavoriteIds().catch(() => {
                    setFavoriteError('Connexion requise pour voir les favoris.');
                    return new Set<string>();
                });

                const [cocktailData, favoritesData] = await Promise.all([
                    apiFetchList<RawCocktail>('/cocktails'),
                    favoritesPromise,
                ]);

                const visibleCocktails = cocktailData.filter((cocktail) => {
                    const status = typeof (cocktail as RawCocktail & { status?: unknown }).status === 'string'
                        ? String((cocktail as RawCocktail & { status?: unknown }).status)
                        : 'approved';
                    return status === 'approved';
                });

                setCocktails(visibleCocktails.map(mapRawCocktail));
                setFavoriteIds(favoritesData);
            } catch {
                setError('Impossible de charger les cocktails. Veuillez reessayer plus tard.');
            } finally {
                setLoading(false);
            }
        };

        void fetchCocktails();
    }, []);

    const filterState = useMemo(
        () => ({ search, alcoholFilter, difficultyFilter, sortBy }),
        [alcoholFilter, difficultyFilter, search, sortBy]
    );

    const filteredCocktails = useMemo(
        () => applyCatalogueFilters(cocktails, filterState, { favoriteIds }),
        [cocktails, favoriteIds, filterState]
    );

    const activeFilterLabels = useMemo(() => getActiveFilterLabels(filterState), [filterState]);
    const hasAnyActiveFilters = hasActiveFilters(filterState);
    const activeFiltersCount = activeFilterLabels.length;

    const resetFilters = () => {
        setSearch('');
        setAlcoholFilter('all');
        setDifficultyFilter('all');
        setSortBy(DEFAULT_SORT);
    };

    const handleFavoriteToggle = async (cocktailId: string) => {
        setFavoriteError('');

        try {
            const result = await toggleFavorite(cocktailId);
            setFavoriteIds((current) => {
                const next = new Set(current);
                if (result.action === 'added') {
                    next.add(cocktailId);
                } else {
                    next.delete(cocktailId);
                }
                return next;
            });
        } catch {
            setFavoriteError('Impossible de mettre a jour les favoris pour le moment.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
                <div className="text-4xl font-display animate-bounce">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF9F0]">
            <div className="relative py-20 border-b-8 border-brand-dark bg-brand-tertiary overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-marquee" />

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-8xl md:text-[10rem] font-display leading-[0.8] text-brand-dark mb-6">
                        LA CARTE
                    </h1>
                    <div className="inline-block bg-white border-4 border-brand-dark px-6 py-2 shadow-hard-sm transform rotate-2">
                        <span className="font-bold text-xl uppercase tracking-widest">
                            Version 2.0 - {filteredCocktails.length} recettes
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {error && (
                    <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        <p>{error}</p>
                    </div>
                )}

                {!error && favoriteError && (
                    <div className="mb-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800">
                        <p>{favoriteError}</p>
                    </div>
                )}

                <div className="mb-20">
                    <div className="flex flex-col xl:flex-row gap-6 xl:items-end">
                        <div className="flex-1 w-full">
                            <label htmlFor="catalogue-search" className="font-bold text-xl uppercase mb-4 block ml-2">
                                Rechercher un cocktail
                            </label>
                            <div className="relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-brand-dark pointer-events-none" />
                                <input
                                    id="catalogue-search"
                                    type="text"
                                    placeholder="Mojito, menthe, citron..."
                                    className="w-full pl-20 pr-16 py-6 text-2xl font-bold border-4 border-brand-dark shadow-hard bg-white focus:outline-none focus:translate-x-[4px] focus:translate-y-[4px] focus:shadow-none transition-all placeholder:text-gray-300"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 border-2 border-brand-dark bg-white hover:bg-brand-dark hover:text-white transition-colors"
                                        aria-label="Effacer la recherche"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex w-full xl:w-auto gap-3">
                            <button
                                type="button"
                                onClick={() => setShowFilters((current) => !current)}
                                aria-expanded={showFilters}
                                aria-controls="catalogue-filters-panel"
                                className={`flex-1 xl:flex-none px-6 py-5 text-sm font-black uppercase border-4 border-brand-dark transition-all flex items-center justify-center gap-2 ${
                                    showFilters
                                        ? 'bg-brand-dark text-white shadow-none translate-x-[2px] translate-y-[2px]'
                                        : 'bg-white text-brand-dark shadow-hard hover:-translate-y-1'
                                }`}
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                                {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
                                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            <button
                                type="button"
                                onClick={resetFilters}
                                disabled={!hasAnyActiveFilters}
                                className={`flex-1 xl:flex-none px-6 py-5 text-sm font-black uppercase border-4 transition-all flex items-center justify-center gap-2 ${
                                    hasAnyActiveFilters
                                        ? 'border-brand-dark bg-white text-brand-dark shadow-hard hover:-translate-y-1'
                                        : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <RotateCcw className="w-5 h-5" />
                                Reinitialiser
                            </button>
                        </div>
                    </div>

                    {!showFilters && hasAnyActiveFilters && (
                        <div className="mt-4 inline-flex px-4 py-2 border-2 border-brand-dark bg-white font-bold text-sm uppercase">
                            {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
                        </div>
                    )}

                    {showFilters && (
                        <div id="catalogue-filters-panel" className="mt-8 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                <div className="border-4 border-brand-dark bg-white p-5 shadow-hard">
                                    <p className="font-black uppercase text-sm mb-4">Type de cocktail</p>
                                    <div className="space-y-2">
                                        {ALCOHOL_FILTERS.map((option) => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setAlcoholFilter(option.id)}
                                                className={`w-full py-3 px-4 font-black uppercase border-4 border-brand-dark transition-all ${
                                                    alcoholFilter === option.id
                                                        ? 'bg-brand-dark text-white translate-x-[2px] translate-y-[2px] shadow-none'
                                                        : 'bg-white text-brand-dark shadow-hard-sm hover:-translate-y-0.5'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-4 border-brand-dark bg-white p-5 shadow-hard">
                                    <p className="font-black uppercase text-sm mb-4">Difficulte</p>
                                    <div className="space-y-2">
                                        {DIFFICULTY_FILTERS.map((option) => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setDifficultyFilter(option.id)}
                                                className={`w-full py-3 px-4 font-black uppercase border-4 border-brand-dark transition-all ${
                                                    difficultyFilter === option.id
                                                        ? 'bg-brand-dark text-white translate-x-[2px] translate-y-[2px] shadow-none'
                                                        : 'bg-white text-brand-dark shadow-hard-sm hover:-translate-y-0.5'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-4 border-brand-dark bg-white p-5 shadow-hard">
                                    <label htmlFor="sort-filter" className="font-black uppercase text-sm mb-4 block">
                                        Trier par
                                    </label>
                                    <select
                                        id="sort-filter"
                                        value={sortBy}
                                        onChange={(event) => setSortBy(event.target.value as SortOption)}
                                        className="w-full py-4 px-4 font-bold border-4 border-brand-dark bg-white focus:outline-none"
                                    >
                                        {SORT_OPTIONS.map((option) => (
                                            <option key={option.id} value={option.id}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {hasAnyActiveFilters && (
                                <div className="flex flex-wrap gap-2">
                                    {activeFilterLabels.map((label) => (
                                        <span key={label} className="px-4 py-2 border-2 border-brand-dark bg-white font-bold text-sm">
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                    {filteredCocktails.map((cocktail) => (
                        <div key={cocktail.id} className="relative">
                            <CocktailCard {...cocktail} />
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    void handleFavoriteToggle(cocktail.id);
                                }}
                                className={`absolute top-4 right-4 z-10 px-3 py-2 border-2 border-brand-dark font-black text-sm transition-colors ${
                                    favoriteIds.has(cocktail.id)
                                        ? 'bg-brand-primary text-white'
                                        : 'bg-white text-brand-dark'
                                }`}
                                aria-label={favoriteIds.has(cocktail.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                            >
                                {favoriteIds.has(cocktail.id) ? '♥' : '♡'}
                            </button>
                        </div>
                    ))}
                </div>

                {!loading && filteredCocktails.length === 0 && !error && (
                    <div className="text-center py-32 border-8 border-dashed border-gray-300 rounded-3xl">
                        <div className="text-9xl mb-8 animate-bounce">?</div>
                        <h3 className="text-4xl font-display mb-4">Rien trouve</h3>
                        <p className="text-xl text-gray-500 mb-8">
                            Essaie d'elargir les filtres ou cree ta propre recette.
                        </p>
                        {hasAnyActiveFilters && (
                            <Button type="button" variant="outline" size="lg" onClick={resetFilters}>
                                <RotateCcw className="w-5 h-5 mr-2" />
                                Reinitialiser les filtres
                            </Button>
                        )}
                        <div className="mt-6">
                            <Link href="/create">
                                <Button size="lg" className="shadow-hard">
                                    Creer mon cocktail <Sparkles className="w-6 h-6 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
