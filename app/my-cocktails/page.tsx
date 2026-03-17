'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { apiFetch, apiFetchList } from '../lib/api';
import { mapRawCocktail, type RawCocktail } from '../catalogue/catalogueFilters';

type CocktailStatus = 'draft' | 'pending' | 'approved' | 'rejected';

interface OwnedCocktail extends RawCocktail {
    status?: CocktailStatus;
}

export default function MyCocktailsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [cocktails, setCocktails] = useState<OwnedCocktail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            router.push('/login');
            return;
        }

        const loadCocktails = async () => {
            setError('');

            try {
                const data = await apiFetchList<OwnedCocktail>('/cocktails');
                setCocktails(
                    data.filter((cocktail) => String(cocktail.created_by_id ?? '') === user.id)
                );
            } catch {
                setError('Impossible de charger tes creations.');
            } finally {
                setLoading(false);
            }
        };

        void loadCocktails();
    }, [authLoading, router, user]);

    const sortedCocktails = useMemo(
        () => [...cocktails].sort((a, b) => {
            const order: Record<string, number> = {
                pending: 0,
                approved: 1,
                rejected: 2,
                draft: 3,
            };
            const aStatus = String(a.status ?? 'draft');
            const bStatus = String(b.status ?? 'draft');
            return (order[aStatus] ?? 99) - (order[bStatus] ?? 99);
        }),
        [cocktails]
    );

    const handleDelete = async (cocktailId: string) => {
        setActionId(cocktailId);
        setError('');

        try {
            await apiFetch(`/cocktails/${cocktailId}`, { method: 'DELETE' });
            setCocktails((current) => current.filter((cocktail) => String(cocktail.id) !== cocktailId));
        } catch {
            setError('Impossible de supprimer ce cocktail.');
        } finally {
            setActionId(null);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
                <div className="text-4xl font-display">Chargement...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#FFF9F0] py-12">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                    <div>
                        <h1 className="text-5xl font-display mb-3">Mes creations</h1>
                        <p className="text-lg text-gray-600">Retrouve tes cocktails et leur statut de validation.</p>
                    </div>
                    <Link href="/create">
                        <Button>Creer un cocktail</Button>
                    </Link>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        {error}
                    </div>
                )}

                {sortedCocktails.length === 0 ? (
                    <div className="card-skew bg-white p-16 text-center">
                        <div className="transform skewY(2deg)">
                            <h2 className="text-4xl font-display mb-4">Aucune creation pour le moment</h2>
                            <p className="text-xl text-gray-600 mb-8">Commence par publier ton premier cocktail.</p>
                            <Link href="/create">
                                <Button>Aller au formulaire</Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {sortedCocktails.map((cocktail) => {
                            const mapped = mapRawCocktail(cocktail);
                            const status = String(cocktail.status ?? 'draft') as CocktailStatus;
                            const canDelete = status === 'pending';

                            return (
                                <div key={String(cocktail.id)} className="card-skew bg-white p-6">
                                    <div className="transform skewY(2deg)">
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div>
                                                <h2 className="text-3xl font-display mb-2">{mapped.name}</h2>
                                                <p className="text-gray-600">{mapped.description || 'Aucune description'}</p>
                                            </div>
                                            <span className={`inline-block px-4 py-2 text-sm font-black uppercase border-2 ${
                                                status === 'approved'
                                                    ? 'bg-green-200 border-green-800 text-green-900'
                                                    : status === 'pending'
                                                        ? 'bg-yellow-200 border-yellow-700 text-yellow-900'
                                                        : status === 'rejected'
                                                            ? 'bg-red-200 border-red-700 text-red-900'
                                                            : 'bg-gray-200 border-gray-700 text-gray-800'
                                            }`}>
                                                {status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-6 text-sm font-bold text-gray-600">
                                            <div>Difficulte : {mapped.difficulty}</div>
                                            <div>Preparation : {mapped.duration}</div>
                                        </div>

                                        <div className="flex flex-wrap gap-4">
                                            <Link href={`/cocktail/${mapped.id}`}>
                                                <Button variant="outline">
                                                    <Eye className="w-4 h-4" /> Voir
                                                </Button>
                                            </Link>
                                            {canDelete && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => void handleDelete(mapped.id)}
                                                    disabled={actionId === mapped.id}
                                                >
                                                    <Trash2 className="w-4 h-4" /> {actionId === mapped.id ? 'Suppression...' : 'Supprimer'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
