'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Shield, Trash2, XCircle, Users, Wine } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { apiFetch, apiFetchList } from '../lib/api';

interface AdminCocktail {
    id: string;
    name: string;
    description?: string | null;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
}

interface AdminUser {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
}

type Tab = 'cocktails' | 'users';

export default function AdminPanel() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    
    // State for tabs
    const [activeTab, setActiveTab] = useState<Tab>('cocktails');

    // State for data
    const [cocktails, setCocktails] = useState<AdminCocktail[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    
    // UI state
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

        const loadData = async () => {
            setError('');
            setLoading(true);

            try {
                // Determine what to load based on active tab
                if (activeTab === 'cocktails') {
                    const data = await apiFetchList<AdminCocktail>('/cocktails');
                    setCocktails(data);
                } else if (activeTab === 'users') {
                    const data = await apiFetchList<AdminUser>('/users');
                    setUsers(data);
                }
            } catch (err) {
                console.error(err);
                setError(`Impossible de charger les ${activeTab}.`);
            } finally {
                setLoading(false);
            }
        };

        void loadData();
    }, [authLoading, router, user, activeTab]);

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
            setError('Impossible de mettre à jour ce cocktail.');
        } finally {
            setActionId(null);
        }
    };

    const deleteCocktail = async (cocktailId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce cocktail ?')) return;
        
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

    const deleteUser = async (userId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

        setActionId(userId);
        setError('');

        try {
            await apiFetch(`/users/${userId}`, { method: 'DELETE' });
            setUsers((current) => current.filter((u) => u.id !== userId));
        } catch {
            setError('Impossible de supprimer cet utilisateur.');
        } finally {
            setActionId(null);
        }
    };

    if (authLoading || (loading && cocktails.length === 0 && users.length === 0)) {
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-display text-brand-dark flex items-center gap-4">
                            <span className="bg-brand-primary text-white p-4 border-4 border-brand-dark shadow-hard-sm transform -rotate-6">
                                <Shield className="w-10 h-10 md:w-12 md:h-12" />
                            </span>
                            PANEL ADMIN
                        </h1>
                        <p className="text-xl font-bold text-gray-600 mt-4">
                            Gestion de la plateforme
                        </p>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-4 mb-8 border-b-4 border-gray-200 pb-1">
                    <button
                        onClick={() => setActiveTab('cocktails')}
                        className={`pb-4 px-4 text-xl font-black uppercase tracking-wider flex items-center gap-2 transition-colors ${
                            activeTab === 'cocktails' 
                                ? 'text-brand-primary border-b-4 border-brand-primary -mb-[5px]' 
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <Wine className="w-6 h-6" />
                        Cocktails
                        {pendingCount > 0 && (
                            <span className="ml-2 bg-brand-secondary text-white text-xs px-2 py-1 rounded-full">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-4 px-4 text-xl font-black uppercase tracking-wider flex items-center gap-2 transition-colors ${
                            activeTab === 'users' 
                                ? 'text-brand-primary border-b-4 border-brand-primary -mb-[5px]' 
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <Users className="w-6 h-6" />
                        Utilisateurs
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 font-bold">
                        {error}
                    </div>
                )}

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {activeTab === 'cocktails' ? (
                        /* Cocktails View */
                        <>
                            {cocktails.length === 0 ? (
                                <div className="card-skew bg-white p-16 text-center">
                                    <div className="transform skewY(2deg)">
                                        <h2 className="text-4xl font-display mb-4">Aucun cocktail à modérer</h2>
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
                                                <tr
                                                    key={cocktail.id}
                                                    className="border-b-4 border-gray-100 hover:bg-[#FFF9F0] transition-colors cursor-pointer"
                                                    onClick={() => router.push(`/cocktail/${cocktail.id}`)}
                                                >
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
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    void updateStatus(cocktail.id, 'approved');
                                                                }}
                                                                disabled={actionId === cocktail.id || cocktail.status !== 'pending'}
                                                                className={cocktail.status !== 'pending' 
                                                                    ? '!bg-gray-100 !border-gray-300 !text-gray-400 opacity-50 cursor-not-allowed pointer-events-none' 
                                                                    : ''}
                                                            >
                                                                <CheckCircle className="w-4 h-4" /> Valider
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    void updateStatus(cocktail.id, 'rejected');
                                                                }}
                                                                disabled={actionId === cocktail.id || cocktail.status !== 'pending'}
                                                                className={cocktail.status !== 'pending' 
                                                                    ? '!bg-gray-100 !border-gray-300 !text-gray-400 opacity-50 cursor-not-allowed pointer-events-none' 
                                                                    : ''}
                                                            >
                                                                <XCircle className="w-4 h-4" /> Rejeter
                                                            </Button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    void deleteCocktail(cocktail.id);
                                                                }}
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
                        </>
                    ) : (
                        /* Users View */
                        <>
                            {users.length === 0 ? (
                                <div className="card-skew bg-white p-16 text-center">
                                    <div className="transform skewY(2deg)">
                                        <h2 className="text-4xl font-display mb-4">Aucun utilisateur</h2>
                                        <p className="text-xl text-gray-600">Base de données vide.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white border-4 border-brand-dark shadow-hard overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[900px]">
                                        <thead>
                                            <tr className="bg-brand-dark text-white border-b-4 border-brand-dark">
                                                <th className="p-5 font-black uppercase tracking-widest text-lg">Utilisateur</th>
                                                <th className="p-5 font-black uppercase tracking-widest text-lg">Email</th>
                                                <th className="p-5 font-black uppercase tracking-widest text-lg text-center">Rôle</th>
                                                <th className="p-5 font-black uppercase tracking-widest text-lg text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u) => (
                                                <tr key={u.id} className="border-b-4 border-gray-100 hover:bg-[#FFF9F0] transition-colors">
                                                    <td className="p-5">
                                                        <div className="font-bold text-2xl text-brand-dark">{u.username}</div>
                                                        <div className="text-sm text-gray-500">#{u.id}</div>
                                                    </td>
                                                    <td className="p-5 text-gray-600 font-bold">
                                                        {u.email}
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        <span className={`inline-block px-4 py-2 text-sm font-black uppercase border-2 shadow-hard-sm ${
                                                            u.role === 'admin'
                                                                ? 'bg-purple-200 border-purple-800 text-purple-900'
                                                                : 'bg-blue-200 border-blue-700 text-blue-900'
                                                        }`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="flex justify-end gap-3">
                                                            {u.id !== user?.id && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => void deleteUser(u.id)}
                                                                    disabled={actionId === u.id}
                                                                    className="p-3 bg-red-100 hover:bg-red-400 hover:text-white text-red-600 border-2 border-brand-dark transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                                                    aria-label="Supprimer l'utilisateur"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
