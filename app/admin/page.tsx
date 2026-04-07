'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Filter, Shield, Trash2, Users, Wine, XCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { apiFetch, apiFetchList } from '../lib/api';

type Tab = 'cocktails' | 'users';
type CocktailStatus = 'draft' | 'pending' | 'approved' | 'rejected';
type UserRole = 'admin' | 'user';

type AdminCocktail = { id: string; name: string; description?: string | null; status: CocktailStatus };
type AdminUser = { id: string; username: string; email: string; role: UserRole; is_bar_owner: boolean };

export default function AdminPanel() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('cocktails');
    const [cocktails, setCocktails] = useState<AdminCocktail[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionId, setActionId] = useState<string | null>(null);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [cocktailSearch, setCocktailSearch] = useState('');
    const [cocktailStatus, setCocktailStatus] = useState<'all' | CocktailStatus>('all');
    const [userSearch, setUserSearch] = useState('');
    const [userRole, setUserRole] = useState<'all' | UserRole>('all');
    const [userBar, setUserBar] = useState<'all' | 'bar' | 'standard'>('all');
    const [selectedCocktails, setSelectedCocktails] = useState<Set<string>>(new Set());
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (authLoading) return;
        if (!user) return void router.push('/login');
        if (user.role !== 'admin') return void router.push('/catalogue');

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                if (activeTab === 'cocktails') setCocktails(await apiFetchList<AdminCocktail>('/cocktails'));
                else setUsers(await apiFetchList<AdminUser>('/users'));
            } catch {
                setError(`Impossible de charger les ${activeTab}.`);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [activeTab, authLoading, router, user]);

    const pendingCount = useMemo(() => cocktails.filter((c) => c.status === 'pending').length, [cocktails]);
    const filteredCocktails = useMemo(() => cocktails.filter((c) => {
        const q = cocktailSearch.trim().toLowerCase();
        return (cocktailStatus === 'all' || c.status === cocktailStatus)
            && (!q || c.name.toLowerCase().includes(q) || String(c.description || '').toLowerCase().includes(q));
    }), [cocktailSearch, cocktailStatus, cocktails]);
    const filteredUsers = useMemo(() => users.filter((u) => {
        const q = userSearch.trim().toLowerCase();
        const matchesBar = userBar === 'all' || (userBar === 'bar' ? u.is_bar_owner : !u.is_bar_owner);
        return (userRole === 'all' || u.role === userRole)
            && matchesBar
            && (!q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }), [userBar, userRole, userSearch, users]);
    const visibleCocktailIds = filteredCocktails.map((c) => c.id);
    const visibleUserIds = filteredUsers.filter((u) => u.id !== user?.id).map((u) => u.id);
    const allCocktailsSelected = visibleCocktailIds.length > 0 && visibleCocktailIds.every((id) => selectedCocktails.has(id));
    const allUsersSelected = visibleUserIds.length > 0 && visibleUserIds.every((id) => selectedUsers.has(id));

    const flash = (message: string) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 2500);
    };

    const toggleSetValue = (setter: Dispatch<SetStateAction<Set<string>>>, value: string) => {
        setter((current) => {
            const next = new Set(current);
            if (next.has(value)) next.delete(value); else next.add(value);
            return next;
        });
    };

    const toggleAll = (kind: 'cocktails' | 'users') => {
        if (kind === 'cocktails') {
            setSelectedCocktails((current) => allCocktailsSelected ? new Set([...current].filter((id) => !visibleCocktailIds.includes(id))) : new Set([...current, ...visibleCocktailIds]));
            return;
        }
        setSelectedUsers((current) => allUsersSelected ? new Set([...current].filter((id) => !visibleUserIds.includes(id))) : new Set([...current, ...visibleUserIds]));
    };

    const updateCocktailStatus = async (cocktailId: string, status: CocktailStatus) => {
        setActionId(cocktailId);
        setError('');
        try {
            const updated = await apiFetch<AdminCocktail>(`/cocktails/${cocktailId}`, { method: 'PUT', body: JSON.stringify({ status }) });
            setCocktails((current) => current.map((c) => c.id === cocktailId ? updated : c));
            flash(`Cocktail ${status}.`);
        } catch {
            setError('Impossible de mettre a jour ce cocktail.');
        } finally {
            setActionId(null);
        }
    };

    const deleteCocktail = async (cocktailId: string) => {
        if (!confirm('Supprimer ce cocktail ?')) return;
        setActionId(cocktailId);
        setError('');
        try {
            await apiFetch(`/cocktails/${cocktailId}`, { method: 'DELETE' });
            setCocktails((current) => current.filter((c) => c.id !== cocktailId));
            setSelectedCocktails((current) => new Set([...current].filter((id) => id !== cocktailId)));
            flash('Cocktail supprime.');
        } catch {
            setError('Impossible de supprimer ce cocktail.');
        } finally {
            setActionId(null);
        }
    };

    const updateUserPermissions = async (userId: string, payload: { role?: UserRole; isBarOwner?: boolean }, label: string) => {
        setActionId(userId);
        setError('');
        try {
            await apiFetch(`/users/update-role/${userId}`, { method: 'PUT', body: JSON.stringify(payload) });
            setUsers((current) => current.map((u) => u.id === userId ? { ...u, role: payload.role ?? u.role, is_bar_owner: payload.isBarOwner ?? u.is_bar_owner } : u));
            flash(label);
        } catch {
            setError('Impossible de mettre a jour ce compte.');
        } finally {
            setActionId(null);
        }
    };

    const deleteUser = async (userId: string) => {
        if (!confirm('Supprimer cet utilisateur ?')) return;
        setActionId(userId);
        setError('');
        try {
            await apiFetch(`/users/delete/${userId}`, { method: 'DELETE' });
            setUsers((current) => current.filter((u) => u.id !== userId));
            setSelectedUsers((current) => new Set([...current].filter((id) => id !== userId)));
            flash('Utilisateur supprime.');
        } catch {
            setError('Impossible de supprimer cet utilisateur.');
        } finally {
            setActionId(null);
        }
    };

    const bulkCocktails = async (action: 'approved' | 'rejected' | 'delete') => {
        const ids = Array.from(selectedCocktails);
        if (!ids.length) return;
        if (action === 'delete' && !confirm(`Supprimer ${ids.length} cocktail(s) ?`)) return;
        setBulkLoading(true);
        setError('');
        try {
            await Promise.all(ids.map((id) => action === 'delete'
                ? apiFetch(`/cocktails/${id}`, { method: 'DELETE' })
                : apiFetch(`/cocktails/${id}`, { method: 'PUT', body: JSON.stringify({ status: action }) })));
            if (action === 'delete') setCocktails((current) => current.filter((c) => !selectedCocktails.has(c.id)));
            else setCocktails((current) => current.map((c) => selectedCocktails.has(c.id) ? { ...c, status: action } : c));
            setSelectedCocktails(new Set());
            flash(`Action groupee appliquee sur ${ids.length} cocktail(s).`);
        } catch {
            setError('Impossible d executer cette action groupee.');
        } finally {
            setBulkLoading(false);
        }
    };

    const bulkUsers = async (action: 'delete' | 'make-admin' | 'make-user' | 'bar-on' | 'bar-off') => {
        const ids = Array.from(selectedUsers).filter((id) => id !== user?.id);
        if (!ids.length) return;
        if (action === 'delete' && !confirm(`Supprimer ${ids.length} utilisateur(s) ?`)) return;
        setBulkLoading(true);
        setError('');
        try {
            if (action === 'delete') {
                await Promise.all(ids.map((id) => apiFetch(`/users/delete/${id}`, { method: 'DELETE' })));
                setUsers((current) => current.filter((u) => !selectedUsers.has(u.id)));
            } else {
                await Promise.all(ids.map((id) => apiFetch(`/users/update-role/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        role: action === 'make-admin' ? 'admin' : action === 'make-user' ? 'user' : undefined,
                        isBarOwner: action === 'bar-on' ? true : action === 'bar-off' ? false : undefined,
                    }),
                })));
                setUsers((current) => current.map((u) => !selectedUsers.has(u.id) ? u : {
                    ...u,
                    role: action === 'make-admin' ? 'admin' : action === 'make-user' ? 'user' : u.role,
                    is_bar_owner: action === 'bar-on' ? true : action === 'bar-off' ? false : u.is_bar_owner,
                }));
            }
            setSelectedUsers(new Set());
            flash(`Action groupee appliquee sur ${ids.length} utilisateur(s).`);
        } catch {
            setError('Impossible d executer cette action groupee.');
        } finally {
            setBulkLoading(false);
        }
    };

    if (authLoading || (loading && cocktails.length === 0 && users.length === 0)) return <div className="min-h-screen bg-surface-bg p-8 flex items-center justify-center"><div className="text-4xl font-display">Chargement...</div></div>;
    if (!user || user.role !== 'admin') return null;

    return (
        <div className="min-h-screen bg-surface-bg p-4 py-12 md:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-display text-brand-dark flex items-center gap-4">
                            <span className="bg-brand-primary text-white p-4 border-4 border-brand-dark shadow-hard-sm transform -rotate-6"><Shield className="w-10 h-10 md:w-12 md:h-12" /></span>
                            PANEL ADMIN
                        </h1>
                        <p className="text-xl font-bold text-gray-600 mt-4">Filtres, actions groupees et gestion des roles.</p>
                    </div>
                </div>

                <div className="flex gap-4 mb-8 border-b-4 border-gray-200 pb-1">
                    <button onClick={() => setActiveTab('cocktails')} className={`pb-4 px-4 text-xl font-black uppercase tracking-wider flex items-center gap-2 ${activeTab === 'cocktails' ? 'text-brand-primary border-b-4 border-brand-primary -mb-[5px]' : 'text-gray-400 hover:text-gray-600'}`}><Wine className="w-6 h-6" />Cocktails{pendingCount > 0 ? <span className="ml-2 bg-brand-secondary text-white text-xs px-2 py-1 rounded-full">{pendingCount}</span> : null}</button>
                    <button onClick={() => setActiveTab('users')} className={`pb-4 px-4 text-xl font-black uppercase tracking-wider flex items-center gap-2 ${activeTab === 'users' ? 'text-brand-primary border-b-4 border-brand-primary -mb-[5px]' : 'text-gray-400 hover:text-gray-600'}`}><Users className="w-6 h-6" />Utilisateurs</button>
                </div>

                {error ? <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 font-bold">{error}</div> : null}
                {success ? <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 font-bold">{success}</div> : null}

                {activeTab === 'cocktails' ? (
                    <>
                        <div className="mb-6 border-4 border-brand-dark bg-white p-5 shadow-hard">
                            <div className="flex items-center gap-2 mb-4 font-black uppercase"><Filter className="w-5 h-5" />Filtres cocktails</div>
                            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                                <input value={cocktailSearch} onChange={(e) => setCocktailSearch(e.target.value)} placeholder="Nom ou description" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                                <select value={cocktailStatus} onChange={(e) => setCocktailStatus(e.target.value as 'all' | CocktailStatus)} className="border-4 border-brand-dark px-4 py-3 font-bold">
                                    <option value="all">Tous les statuts</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="draft">Draft</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-6 flex flex-wrap items-center gap-3">
                            <Button variant="outline" size="sm" onClick={() => toggleAll('cocktails')}>{allCocktailsSelected ? 'Tout deselectionner' : 'Tout selectionner'}</Button>
                            <Button variant="outline" size="sm" onClick={() => void bulkCocktails('approved')} disabled={!selectedCocktails.size || bulkLoading}><CheckCircle className="w-4 h-4" />Valider</Button>
                            <Button variant="outline" size="sm" onClick={() => void bulkCocktails('rejected')} disabled={!selectedCocktails.size || bulkLoading}><XCircle className="w-4 h-4" />Rejeter</Button>
                            <Button variant="outline" size="sm" onClick={() => void bulkCocktails('delete')} disabled={!selectedCocktails.size || bulkLoading}><Trash2 className="w-4 h-4" />Supprimer</Button>
                            <span className="text-sm font-bold text-gray-500">{selectedCocktails.size} selectionne(s)</span>
                        </div>

                        <div className="bg-white border-4 border-brand-dark shadow-hard overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[980px]">
                                <thead><tr className="bg-brand-dark text-white"><th className="p-5"><input type="checkbox" checked={allCocktailsSelected} onChange={() => toggleAll('cocktails')} className="h-5 w-5" /></th><th className="p-5 font-black uppercase text-lg">Nom</th><th className="p-5 font-black uppercase text-lg">Description</th><th className="p-5 font-black uppercase text-lg text-center">Statut</th><th className="p-5 font-black uppercase text-lg text-right">Actions</th></tr></thead>
                                <tbody>
                                    {filteredCocktails.map((c) => (
                                        <tr key={c.id} className="border-b-4 border-gray-100 hover:bg-[#FFF9F0] cursor-pointer" onClick={() => router.push(`/cocktail/${c.id}`)}>
                                            <td className="p-5" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedCocktails.has(c.id)} onChange={() => toggleSetValue(setSelectedCocktails, c.id)} className="h-5 w-5" /></td>
                                            <td className="p-5"><div className="font-bold text-2xl text-brand-dark">{c.name}</div><div className="text-sm text-gray-500">#{c.id}</div></td>
                                            <td className="p-5 text-gray-600 max-w-[420px]">{c.description || 'Aucune description'}</td>
                                            <td className="p-5 text-center"><span className={`inline-block px-4 py-2 text-sm font-black uppercase border-2 shadow-hard-sm ${c.status === 'approved' ? 'bg-green-300 border-green-800 text-green-900' : c.status === 'pending' ? 'bg-yellow-200 border-yellow-700 text-yellow-900' : c.status === 'rejected' ? 'bg-red-200 border-red-700 text-red-900' : 'bg-gray-200 border-gray-700 text-gray-800'}`}>{c.status}</span></td>
                                            <td className="p-5"><div className="flex justify-end gap-3">
                                                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); void updateCocktailStatus(c.id, 'approved'); }} disabled={actionId === c.id || c.status !== 'pending'}><CheckCircle className="w-4 h-4" />Valider</Button>
                                                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); void updateCocktailStatus(c.id, 'rejected'); }} disabled={actionId === c.id || c.status !== 'pending'}><XCircle className="w-4 h-4" />Rejeter</Button>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); void deleteCocktail(c.id); }} disabled={actionId === c.id} className="p-3 bg-red-100 hover:bg-red-400 hover:text-white text-red-600 border-2 border-brand-dark"><Trash2 className="w-5 h-5" /></button>
                                            </div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mb-6 border-4 border-brand-dark bg-white p-5 shadow-hard">
                            <div className="flex items-center gap-2 mb-4 font-black uppercase"><Filter className="w-5 h-5" />Filtres utilisateurs</div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Username ou email" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                                <select value={userRole} onChange={(e) => setUserRole(e.target.value as 'all' | UserRole)} className="border-4 border-brand-dark px-4 py-3 font-bold"><option value="all">Tous les roles</option><option value="admin">Admin</option><option value="user">User</option></select>
                                <select value={userBar} onChange={(e) => setUserBar(e.target.value as 'all' | 'bar' | 'standard')} className="border-4 border-brand-dark px-4 py-3 font-bold"><option value="all">Tous les comptes</option><option value="bar">Comptes bars</option><option value="standard">Comptes standards</option></select>
                            </div>
                        </div>

                        <div className="mb-6 flex flex-wrap items-center gap-3">
                            <Button variant="outline" size="sm" onClick={() => toggleAll('users')}>{allUsersSelected ? 'Tout deselectionner' : 'Tout selectionner'}</Button>
                            <Button variant="outline" size="sm" onClick={() => void bulkUsers('make-admin')} disabled={!selectedUsers.size || bulkLoading}>Passer admin</Button>
                            <Button variant="outline" size="sm" onClick={() => void bulkUsers('make-user')} disabled={!selectedUsers.size || bulkLoading}>Passer user</Button>
                            <Button variant="outline" size="sm" onClick={() => void bulkUsers('bar-on')} disabled={!selectedUsers.size || bulkLoading}>Activer bar</Button>
                            <Button variant="outline" size="sm" onClick={() => void bulkUsers('bar-off')} disabled={!selectedUsers.size || bulkLoading}>Retirer bar</Button>
                            <Button variant="outline" size="sm" onClick={() => void bulkUsers('delete')} disabled={!selectedUsers.size || bulkLoading}><Trash2 className="w-4 h-4" />Supprimer</Button>
                            <span className="text-sm font-bold text-gray-500">{selectedUsers.size} selectionne(s)</span>
                        </div>

                        <div className="bg-white border-4 border-brand-dark shadow-hard overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1120px]">
                                <thead><tr className="bg-brand-dark text-white"><th className="p-5"><input type="checkbox" checked={allUsersSelected} onChange={() => toggleAll('users')} className="h-5 w-5" /></th><th className="p-5 font-black uppercase text-lg">Utilisateur</th><th className="p-5 font-black uppercase text-lg">Email</th><th className="p-5 font-black uppercase text-lg text-center">Role</th><th className="p-5 font-black uppercase text-lg text-center">Compte bar</th><th className="p-5 font-black uppercase text-lg text-right">Actions</th></tr></thead>
                                <tbody>
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} className="border-b-4 border-gray-100 hover:bg-[#FFF9F0]">
                                            <td className="p-5">{u.id !== user.id ? <input type="checkbox" checked={selectedUsers.has(u.id)} onChange={() => toggleSetValue(setSelectedUsers, u.id)} className="h-5 w-5" /> : null}</td>
                                            <td className="p-5"><div className="font-bold text-2xl text-brand-dark">{u.username}</div><div className="text-sm text-gray-500">#{u.id}</div></td>
                                            <td className="p-5 text-gray-600 font-bold">{u.email}</td>
                                            <td className="p-5 text-center"><span className={`inline-block px-4 py-2 text-sm font-black uppercase border-2 shadow-hard-sm ${u.role === 'admin' ? 'bg-purple-200 border-purple-800 text-purple-900' : 'bg-blue-200 border-blue-700 text-blue-900'}`}>{u.role}</span></td>
                                            <td className="p-5 text-center"><span className={`inline-block px-4 py-2 text-sm font-black uppercase border-2 shadow-hard-sm ${u.is_bar_owner ? 'bg-brand-secondary/30 border-brand-dark text-brand-dark' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>{u.is_bar_owner ? 'Actif' : 'Non'}</span></td>
                                            <td className="p-5"><div className="flex flex-wrap justify-end gap-3">
                                                {u.id !== user.id ? <>
                                                    <Button variant="outline" size="sm" onClick={() => void updateUserPermissions(u.id, { role: u.role === 'admin' ? 'user' : 'admin' }, 'Role mis a jour.')} disabled={actionId === u.id}>{u.role === 'admin' ? 'Passer user' : 'Passer admin'}</Button>
                                                    <Button variant="outline" size="sm" onClick={() => void updateUserPermissions(u.id, { isBarOwner: !u.is_bar_owner }, 'Compte bar mis a jour.')} disabled={actionId === u.id}>{u.is_bar_owner ? 'Retirer bar' : 'Activer bar'}</Button>
                                                    <button type="button" onClick={() => void deleteUser(u.id)} disabled={actionId === u.id} className="p-3 bg-red-100 hover:bg-red-400 hover:text-white text-red-600 border-2 border-brand-dark"><Trash2 className="w-5 h-5" /></button>
                                                </> : <span className="text-sm font-bold text-gray-500">Compte courant</span>}
                                            </div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
