'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { CocktailCard } from '../components/CocktailCard';
import { useAuth } from '../context/AuthContext';
import { apiFetchList } from '../lib/api';
import { fetchFavoritesPage, removeFavorite } from '../lib/favoritesApi';
import { extractFavoriteIds, mapRawCocktail, type RawCocktail } from '../catalogue/catalogueFilters';

export default function Favorites() {
    const { user, loading: authLoading } = useAuth();
    const [favorites, setFavorites] = useState<ReturnType<typeof mapRawCocktail>[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isClearing, setIsClearing] = useState(false);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            setFavorites([]);
            setLoading(false);
            return;
        }

        const loadFavorites = async () => {
            setError('');

            try {
                const [favoritesData, cocktailsData] = await Promise.all([
                    fetchFavoritesPage(),
                    apiFetchList<RawCocktail>('/cocktails'),
                ]);

                const favoriteIds = extractFavoriteIds(favoritesData);
                const visibleCocktails = cocktailsData
                    .filter((cocktail) => favoriteIds.has(String(cocktail.id)))
                    .map(mapRawCocktail);

                setFavorites(visibleCocktails);
            } catch {
                setError('Impossible de charger les favoris.');
            } finally {
                setLoading(false);
            }
        };

        void loadFavorites();
    }, [authLoading, user]);

    const favoriteCountLabel = useMemo(
        () => `${favorites.length} cocktail${favorites.length > 1 ? 's' : ''} sauvegarde${favorites.length > 1 ? 's' : ''}`,
        [favorites.length]
    );

    const handleRemoveFavorite = async (cocktailId: string) => {
        setError('');

        try {
            await removeFavorite(cocktailId);
            setFavorites((current) => current.filter((cocktail) => cocktail.id !== cocktailId));
        } catch {
            setError('Impossible de retirer ce favori.');
        }
    };

    const handleClearFavorites = async () => {
        setIsClearing(true);
        setError('');

        try {
            await Promise.all(favorites.map((cocktail) => removeFavorite(cocktail.id)));
            setFavorites([]);
        } catch {
            setError('Impossible de vider les favoris.');
        } finally {
            setIsClearing(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-4xl font-display">
                    Chargement...
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="card-skew bg-white p-16 text-center">
                        <div className="transform skewY(2deg)">
                            <h1 className="text-4xl font-display mb-4">Connecte-toi pour voir tes favoris</h1>
                            <p className="text-gray-600 text-lg mb-6">Tes favoris sont lies a ton compte.</p>
                            <Link href="/login">
                                <Button size="lg">Connexion</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 animate-bounce-in">
                    <div className="text-7xl mb-4 animate-wiggle">♥</div>
                    <h1 className="text-6xl font-display mb-4 hover-bounce">
                        Mes <span className="text-brand-primary">favoris</span>
                    </h1>
                    <p className="text-xl text-gray-600">Tes cocktails preferes, tous au meme endroit.</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        {error}
                    </div>
                )}

                {favorites.length > 0 ? (
                    <>
                        <div className="flex justify-between items-center mb-8 gap-4">
                            <p className="text-lg font-bold text-gray-600">{favoriteCountLabel}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => void handleClearFavorites()}
                                disabled={isClearing}
                            >
                                <Trash2 className="w-4 h-4" /> {isClearing ? 'Suppression...' : 'Tout supprimer'}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                            {favorites.map((cocktail, index) => (
                                <div
                                    key={cocktail.id}
                                    className={`relative ${index === 0 ? 'animate-bounce-in' : ''}`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <CocktailCard {...cocktail} />
                                    <button
                                        type="button"
                                        onClick={() => void handleRemoveFavorite(cocktail.id)}
                                        className="favorite-badge favorite-badge-active absolute top-4 right-4 p-2 bg-white border-2 border-red-400 text-red-500 hover:bg-red-50 transition-all transform skewX(-5deg) hover:scale-110 shadow-lg z-10"
                                        title="Retirer des favoris"
                                        aria-label="Retirer des favoris"
                                    >
                                        <Heart className="w-5 h-5 fill-current transform skewX(5deg)" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="card-skew bg-white p-16 text-center animate-bounce-in">
                        <div className="transform skewY(2deg)">
                            <div className="text-8xl mb-6">♡</div>
                            <h2 className="text-4xl font-display mb-4">Aucun favori pour le moment</h2>
                            <p className="text-xl text-gray-600 mb-8">
                                Explore le catalogue et ajoute tes cocktails preferes.
                            </p>
                            <Link href="/catalogue">
                                <Button size="lg">Decouvrir des cocktails</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
