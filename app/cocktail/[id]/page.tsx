'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import { Button } from '@/app/components/Button';
import { apiFetch } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import type { CocktailDetailsModel, CocktailCardModel } from '@/app/lib/types';

export default function CocktailDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();

  const [cocktail, setCocktail] = useState<CocktailDetailsModel | null>(null);
  const [similarCocktails, setSimilarCocktails] = useState<CocktailCardModel[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const details = await apiFetch<CocktailDetailsModel>(`/cocktails/${id}`);
        const list = await apiFetch<CocktailCardModel[]>('/cocktails?limit=8');

        if (!active) {
          return;
        }

        setCocktail(details);
        setSimilarCocktails(
          list.filter((item) => item.id !== details.id).slice(0, 4)
        );
      } catch {
        if (active) {
          setCocktail(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!user) {
      setIsFavorite(false);
      return;
    }

    let active = true;
    (async () => {
      try {
        const status = await apiFetch<{ cocktailId: string; isFavorite: boolean }>(
          `/favorites/${id}/status`
        );
        if (active) {
          setIsFavorite(status.isFavorite);
        }
      } catch {
        if (active) {
          setIsFavorite(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!user || favoriteLoading) {
      return;
    }

    try {
      setFavoriteLoading(true);
      const response = await apiFetch<{ cocktailId: string; isFavorite: boolean }>(
        `/favorites/${id}/toggle`,
        { method: 'POST' }
      );
      setIsFavorite(response.isFavorite);
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <div className="text-4xl font-display animate-bounce">Chargement...</div>
      </div>
    );
  }

  if (!cocktail) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/catalogue">
            <Button variant="outline"><ArrowLeft className="w-4 h-4" /> Retour catalogue</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="card-skew bg-white p-8">
            <div className="transform skewY(2deg)">
              <div className="w-full h-96 bg-gray-100 border-4 border-brand-dark flex items-center justify-center overflow-hidden mb-6">
                {cocktail.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cocktail.image} alt={cocktail.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-7xl font-display opacity-30">{cocktail.name.slice(0, 1)}</span>
                )}
              </div>
              <h1 className="text-5xl font-display mb-2">{cocktail.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{cocktail.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {cocktail.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 border-2 border-brand-dark text-sm font-bold bg-white">
                    {tag}
                  </span>
                ))}
                {cocktail.styles.map((style) => (
                  <span key={`style-${style}`} className="px-3 py-1 border-2 border-brand-dark text-sm font-bold bg-yellow-100">
                    {style}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 border-2 border-gray-200 bg-gray-50 text-center">
                  <div className="text-xs uppercase text-gray-500">Difficulte</div>
                  <div className="text-xl font-display">{cocktail.difficulty}</div>
                </div>
                <div className="p-4 border-2 border-gray-200 bg-gray-50 text-center">
                  <div className="text-xs uppercase text-gray-500">Temps</div>
                  <div className="text-xl font-display">{cocktail.duration}</div>
                </div>
                <div className="p-4 border-2 border-gray-200 bg-gray-50 text-center">
                  <div className="text-xs uppercase text-gray-500">Type</div>
                  <div className="text-xl font-display">{cocktail.alcohol ? 'Alcool' : 'Sans alcool'}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={toggleFavorite} disabled={!user || favoriteLoading}>
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                </Button>
                <Button variant="outline"><Share2 className="w-4 h-4" /> Partager</Button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="card-skew bg-white p-8">
              <div className="transform skewY(2deg)">
                <h2 className="text-3xl font-display mb-4">Ingredients</h2>
                <ul className="space-y-3">
                  {cocktail.ingredients.map((ingredient) => (
                    <li key={ingredient.id || ingredient.name} className="flex justify-between p-3 border-2 border-gray-200">
                      <span className="font-bold">{ingredient.name}</span>
                      <span className="font-mono">{ingredient.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card-skew bg-white p-8">
              <div className="transform skewY(2deg)">
                <h2 className="text-3xl font-display mb-4">Preparation</h2>
                <ol className="space-y-4">
                  {cocktail.preparationSteps.map((step) => (
                    <li key={step.id} className="p-4 border-l-4 border-brand-primary bg-gray-50">
                      <p className="font-bold mb-1">Etape {step.stepNumber}</p>
                      <p>{step.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>

        {cocktail.variants.length > 0 && (
          <div className="mt-16">
            <h2 className="text-4xl font-display mb-6">Variantes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cocktail.variants.map((variant) => (
                <Link key={variant.id} href={`/cocktail/${variant.id}`} className="card-skew bg-white p-4 hover:scale-105 transition-transform">
                  <div className="transform skewY(2deg)">
                    <div className="w-full h-40 bg-gray-100 border-2 border-brand-dark mb-3 flex items-center justify-center overflow-hidden">
                      {variant.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={variant.image} alt={variant.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl font-display opacity-30">{variant.name.slice(0, 1)}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-display">{variant.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {similarCocktails.length > 0 && (
          <div className="mt-16">
            <h2 className="text-4xl font-display mb-6">Tu pourrais aussi aimer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarCocktails.map((item) => (
                <Link key={item.id} href={`/cocktail/${item.id}`} className="card-skew bg-white p-4 hover:scale-105 transition-transform">
                  <div className="transform skewY(2deg)">
                    <h3 className="text-xl font-display mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
