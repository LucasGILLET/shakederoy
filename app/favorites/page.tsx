'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '../lib/api';
import { CocktailCard } from '../components/CocktailCard';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import type { CocktailCardModel } from '../lib/types';

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [favorites, setFavorites] = useState<CocktailCardModel[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) {
      setLoadingFavorites(false);
      return;
    }

    let active = true;
    (async () => {
      try {
        setLoadingFavorites(true);
        const list = await apiFetch<CocktailCardModel[]>('/favorites');
        if (active) {
          setFavorites(list);
        }
      } catch (fetchError: any) {
        if (active) {
          setError(fetchError.message || 'Impossible de charger les favoris');
        }
      } finally {
        if (active) {
          setLoadingFavorites(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [user]);

  const removeFavorite = async (cocktailId: string) => {
    await apiFetch(`/favorites/${cocktailId}`, { method: 'DELETE' });
    setFavorites((prev) => prev.filter((item) => item.id !== cocktailId));
  };

  const clearFavorites = async () => {
    const ids = favorites.map((favorite) => favorite.id);
    for (const id of ids) {
      // Sequential to keep UI simple and deterministic.
      // eslint-disable-next-line no-await-in-loop
      await apiFetch(`/favorites/${id}`, { method: 'DELETE' });
    }
    setFavorites([]);
  };

  if (loading || loadingFavorites) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <div className="text-4xl font-display animate-bounce">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="text-7xl mb-4">💖</div>
          <h1 className="text-6xl font-display mb-4">Mes favoris</h1>
          <p className="text-xl text-gray-600">Ta selection personnelle, branchee au backend.</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">{error}</div>
        )}

        {favorites.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <p className="text-lg font-bold text-gray-600">
                {favorites.length} cocktail{favorites.length > 1 ? 's' : ''} en favori
              </p>
              <Button variant="outline" size="sm" onClick={clearFavorites}>
                <Trash2 className="w-4 h-4" /> Tout supprimer
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {favorites.map((cocktail) => (
                <div key={cocktail.id} className="relative">
                  <CocktailCard {...cocktail} />
                  <button
                    onClick={() => removeFavorite(cocktail.id)}
                    className="absolute top-4 right-4 p-2 bg-white border-2 border-red-400 text-red-500 hover:bg-red-50 transition-all transform skewX(-5deg) hover:scale-110 shadow-lg z-10"
                    title="Retirer des favoris"
                  >
                    <Heart className="w-5 h-5 fill-current transform skewX(5deg)" />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="card-skew bg-white p-16 text-center">
            <div className="transform skewY(2deg)">
              <div className="text-8xl mb-6">✨</div>
              <h2 className="text-4xl font-display mb-4">Aucun favori pour le moment</h2>
              <p className="text-xl text-gray-600 mb-8">Parcours le catalogue et ajoute tes coups de coeur.</p>
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
