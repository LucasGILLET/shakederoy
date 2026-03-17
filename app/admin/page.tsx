'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Shield, Trash2, XCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { apiFetch, apiFetchList } from '../lib/api';

interface AdminCocktail {
    id: string;
    name: string;
    description?: string | null;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
}

export default function AdminPanel() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [cocktails, setCocktails] = useState<AdminCocktail[]>([]);
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

        if (user.role !== 'admin') {
            router.push('/catalogue');
            return;
        }

        const loadCocktails = async () => {
            setError('');

            try {
                const data = await apiFetchList<AdminCocktail>('/cocktails');
                setCocktails(data);
            } catch {
                setError('Impossible de charger les cocktails.');
            } finally {
                setLoading(false);
            }
        };

        void loadCocktails();
    }, [authLoading, router, user]);

    const pendingCount = useMemo(
        () => cocktails.filter((cocktail) => cocktail.status === 'pending').length,
        [cocktails]
    );

    const updateStatus = async (cocktailId: string, status: AdminCocktail['status']) => {
        setActionId(cocktailId);
        setError('');

        try {
            const updated = await apiFetch<AdminCocktail>(`/cocktails/${cocktailId}`, {
                method: 'PUT',
                body: JSON.stringify({ status }),
            });

            setCocktails((current) =>
                current.map((cocktail) => (cocktail.id === cocktailId ? updated : cocktail))
            );
        } catch {
            setError('Impossible de mettre a jour ce cocktail.');
        } finally {
            setActionId(null);
        }
    };

    const deleteCocktail = async (cocktailId: string) => {
        setActionId(cocktailId);
        setError('');

        try {
            await apiFetch(`/cocktails/${cocktailId}`, { method: 'DELETE' });
            setCocktails((current) => current.filter((cocktail) => cocktail.id !== cocktailId));
        } catch {
            setError('Impossible de supprimer ce cocktail.');
        } finally {
            setActionId(null);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-surface-bg p-8 flex items-center justify-center">
                <div className="text-4xl font-display">Chargement...</div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-surface-bg p-4 py-12 md:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-display text-brand-dark flex items-center gap-4">
                            <span className="bg-brand-primary text-white p-4 border-4 border-brand-dark shadow-hard-sm transform -rotate-6">
                                <Shield className="w-10 h-10 md:w-12 md:h-12" />
                            </span>
                            PANEL ADMIN
                        </h1>
                        <p className="text-xl font-bold text-gray-600 mt-4">
                            Validation et suppression des cocktails existants
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="bg-white border-4 border-brand-dark shadow-hard-sm p-5">
                            <div className="text-sm font-black uppercase text-gray-400">Cocktails</div>
                            <div className="text-4xl font-display text-brand-primary">{cocktails.length}</div>
                        </div>
                        <div className="bg-white border-4 border-brand-dark shadow-hard-sm p-5">
                            <div className="text-sm font-black uppercase text-gray-400">En attente</div>
                            <div className="text-4xl font-display text-brand-secondary">{pendingCount}</div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        {error}
                    </div>
                )}

                {cocktails.length === 0 ? (
                    <div className="card-skew bg-white p-16 text-center">
                        <div className="transform skewY(2deg)">
                            <h2 className="text-4xl font-display mb-4">Aucun cocktail a moderer</h2>
                            <p className="text-xl text-gray-600">Le catalogue est vide pour le moment.</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border-4 border-brand-dark shadow-hard overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-brand-dark text-white border-b-4 border-brand-dark">
                                    <th className="p-5 font-black uppercase tracking-widest text-lg">Nom</th>
                                    <th className="p-5 font-black uppercase tracking-widest text-lg">Description</th>
                                    <th className="p-5 font-black uppercase tracking-widest text-lg text-center">Statut</th>
                                    <th className="p-5 font-black uppercase tracking-widest text-lg text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cocktails.map((cocktail) => (
                                    <tr key={cocktail.id} className="border-b-4 border-gray-100 hover:bg-[#FFF9F0] transition-colors">
                                        <td className="p-5">
                                            <div className="font-bold text-2xl text-brand-dark">{cocktail.name}</div>
                                            <div className="text-sm text-gray-500">#{cocktail.id}</div>
                                        </td>
                                        <td className="p-5 text-gray-600 max-w-[420px]">
                                            {cocktail.description || 'Aucune description'}
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`inline-block px-4 py-2 text-sm font-black uppercase border-2 shadow-hard-sm ${
                                                cocktail.status === 'approved'
                                                    ? 'bg-green-300 border-green-800 text-green-900'
                                                    : cocktail.status === 'pending'
                                                        ? 'bg-yellow-200 border-yellow-700 text-yellow-900'
                                                        : cocktail.status === 'rejected'
                                                            ? 'bg-red-200 border-red-700 text-red-900'
                                                            : 'bg-gray-200 border-gray-700 text-gray-800'
                                            }`}>
                                                {cocktail.status}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-end gap-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => void updateStatus(cocktail.id, 'approved')}
                                                    disabled={actionId === cocktail.id}
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Valider
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => void updateStatus(cocktail.id, 'rejected')}
                                                    disabled={actionId === cocktail.id}
                                                >
                                                    <XCircle className="w-4 h-4" /> Rejeter
                                                </Button>
                                                <button
                                                    type="button"
                                                    onClick={() => void deleteCocktail(cocktail.id)}
                                                    disabled={actionId === cocktail.id}
                                                    className="p-3 bg-red-100 hover:bg-red-400 hover:text-white text-red-600 border-2 border-brand-dark transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                                    aria-label="Supprimer le cocktail"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
