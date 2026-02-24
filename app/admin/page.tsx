'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, RefreshCcw, Pencil } from 'lucide-react';
import { apiFetch } from '@/app/lib/api';
import { Button } from '@/app/components/Button';
import { useAuth } from '@/app/context/AuthContext';
import type { CocktailCardModel } from '@/app/lib/types';

interface AdminCocktail extends CocktailCardModel {
  status?: string;
  createdById?: string | null;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [cocktails, setCocktails] = useState<AdminCocktail[]>([]);
  const [loadingCocktails, setLoadingCocktails] = useState(true);
  const [error, setError] = useState('');

  const loadCocktails = async () => {
    try {
      setLoadingCocktails(true);
      setError('');
      const list = await apiFetch<AdminCocktail[]>('/cocktails?limit=100');
      setCocktails(list);
    } catch (fetchError: any) {
      setError(fetchError.message || 'Impossible de charger les cocktails');
    } finally {
      setLoadingCocktails(false);
    }
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/catalogue');
      return;
    }

    if (user?.role === 'admin') {
      loadCocktails();
    }
  }, [loading, user, router]);

  const removeCocktail = async (cocktailId: string) => {
    await apiFetch(`/cocktails/${cocktailId}`, { method: 'DELETE' });
    setCocktails((prev) => prev.filter((cocktail) => cocktail.id !== cocktailId));
  };

  const renameCocktail = async (cocktailId: string, currentName: string) => {
    const nextName = window.prompt('Nouveau nom du cocktail', currentName)?.trim();
    if (!nextName || nextName === currentName) {
      return;
    }

    const updated = await apiFetch<AdminCocktail>(`/cocktails/${cocktailId}`, {
      method: 'POST',
      body: JSON.stringify({ name: nextName }),
    });

    setCocktails((prev) =>
      prev.map((cocktail) => (cocktail.id === cocktailId ? { ...cocktail, name: updated.name } : cocktail))
    );
  };

  if (loading || loadingCocktails) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <div className="text-4xl font-display animate-bounce">Chargement...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-5xl font-display">Admin Cocktails</h1>
            <p className="text-gray-600">CRUD minimal securise (admin only)</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={loadCocktails}>
              <RefreshCcw className="w-4 h-4" /> Recharger
            </Button>
            <Link href="/create">
              <Button>Nouveau cocktail</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">{error}</div>
        )}

        <div className="card-skew bg-white p-6">
          <div className="transform skewY(2deg)">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="py-3 px-2">Nom</th>
                    <th className="py-3 px-2">Difficulte</th>
                    <th className="py-3 px-2">Type</th>
                    <th className="py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cocktails.map((cocktail) => (
                    <tr key={cocktail.id} className="border-b border-gray-100">
                      <td className="py-3 px-2">
                        <Link href={`/cocktail/${cocktail.id}`} className="font-bold hover:text-brand-primary">
                          {cocktail.name}
                        </Link>
                      </td>
                      <td className="py-3 px-2">{cocktail.difficulty}</td>
                      <td className="py-3 px-2">{cocktail.alcohol ? 'Alcool' : 'Sans alcool'}</td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => renameCocktail(cocktail.id, cocktail.name)}>
                            <Pencil className="w-4 h-4" /> Renommer
                          </Button>
                          <Button variant="outline" onClick={() => removeCocktail(cocktail.id)}>
                            <Trash2 className="w-4 h-4" /> Supprimer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
