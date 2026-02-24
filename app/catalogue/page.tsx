'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles } from 'lucide-react';
import { CocktailCard } from '../components/CocktailCard';
import { Button } from '../components/Button';
import { apiFetch } from '../lib/api';
import type { CocktailCardModel } from '../lib/types';

type AlcoholFilter = 'all' | 'with' | 'without';

export default function CataloguePage() {
  const [cocktails, setCocktails] = useState<CocktailCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AlcoholFilter>('all');

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams();
        if (search.trim()) {
          params.set('search', search.trim());
        }
        params.set('alcohol', filter);
        params.set('limit', '48');

        const list = await apiFetch<CocktailCardModel[]>(`/cocktails?${params.toString()}`, {
          signal: controller.signal,
        });

        if (active) {
          setCocktails(list);
        }
      } catch (fetchError: any) {
        if (active && fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'Impossible de charger les cocktails');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [search, filter]);

  const filterLabel = useMemo(() => {
    if (filter === 'with') return 'Avec alcool';
    if (filter === 'without') return 'Sans alcool';
    return 'Tous';
  }, [filter]);

  if (loading && cocktails.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <div className="text-4xl font-display animate-bounce">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      <div className="relative py-20 border-b-8 border-brand-dark bg-brand-tertiary overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-8xl md:text-[10rem] font-display leading-[0.8] text-brand-dark mb-6">
            LA CARTE
          </h1>
          <div className="inline-block bg-white border-4 border-brand-dark px-6 py-2 shadow-hard-sm transform rotate-2">
            <span className="font-bold text-xl uppercase tracking-widest">
              {cocktails.length} recettes - {filterLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {error && (
          <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">{error}</div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 mb-20 items-end">
          <div className="flex-1 w-full">
            <label className="font-bold text-xl uppercase mb-4 block ml-2">Rechercher un cocktail</label>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-brand-dark pointer-events-none" />
              <input
                type="text"
                placeholder="Mojito, Spritz..."
                className="w-full pl-20 pr-8 py-6 text-2xl font-bold border-4 border-brand-dark shadow-hard bg-white focus:outline-none focus:translate-x-[4px] focus:translate-y-[4px] focus:shadow-none transition-all placeholder:text-gray-300"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              { id: 'all' as const, label: 'Tout' },
              { id: 'with' as const, label: 'Avec alcool' },
              { id: 'without' as const, label: 'Sans alcool' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`px-8 py-6 text-lg font-black uppercase border-4 border-brand-dark transition-all ${
                  filter === item.id
                    ? 'bg-brand-dark text-white shadow-none translate-x-[4px] translate-y-[4px]'
                    : 'bg-white text-brand-dark shadow-hard hover:-translate-y-1'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {cocktails.map((cocktail) => (
            <CocktailCard key={cocktail.id} {...cocktail} />
          ))}
        </div>

        {!loading && cocktails.length === 0 && !error && (
          <div className="text-center py-32 border-8 border-dashed border-gray-300 rounded-3xl">
            <div className="text-9xl mb-8 animate-bounce">🤔</div>
            <h3 className="text-4xl font-display mb-4">Aucun cocktail</h3>
            <p className="text-xl text-gray-500 mb-8">Ajoute ta recette et enrichis la carte.</p>
            <Link href="/create">
              <Button size="lg" className="shadow-hard">
                Creer mon cocktail <Sparkles className="w-6 h-6 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
