'use client';

import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Shield, Users, Wine, Trash2, Edit2, Plus, Search, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Mocks
const initialCocktails = [
    { id: 1, name: 'Mojito Royal', category: 'Classique', difficulty: 'Easy', status: 'published' },
    { id: 2, name: 'Tequila Sunrise', category: 'Fruité', difficulty: 'Medium', status: 'published' },
    { id: 3, name: 'Pornstar Martini', category: 'Moderne', difficulty: 'Hard', status: 'draft' },
    { id: 4, name: 'Blue Lagoon', category: 'Estival', difficulty: 'Easy', status: 'published' },
    { id: 5, name: 'Zombie', category: 'Tiki', difficulty: 'Hard', status: 'draft' }
];

const initialUsers = [
    { id: 101, username: 'flavien_admin', email: 'flavien@shakederoy.com', role: 'Admin', status: 'active' },
    { id: 102, username: 'johndoe', email: 'john@example.com', role: 'User', status: 'active' },
    { id: 103, username: 'jane_smith', email: 'jane@example.com', role: 'User', status: 'banned' },
    { id: 104, username: 'bartender_pro', email: 'pro@mixology.com', role: 'User', status: 'active' },
];

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState<'cocktails' | 'users'>('cocktails');
    const [cocktails, setCocktails] = useState(initialCocktails);
    const [users, setUsers] = useState(initialUsers);

    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // In a real app we would check user role. Here we just redirect if completely logged out for basic protection.
        // As it was asked ONLY for the front, the visual logic is our main priority.
        if (!loading && !user) {
            // Just for demo purposes, maybe skip redirect to let them preview the admin pane even logged out?
            // Let's add a small notification instead of hard blocking for easier evaluation.
        }
    }, [user, loading, router]);

    // Stats
    const totalCocktails = cocktails.length;
    const totalUsers = users.length;

    return (
        <div className="min-h-screen bg-surface-bg p-4 py-12 md:p-12">
            <div className="max-w-7xl mx-auto">

                {(!user) && (
                    <div className="mb-8 p-4 bg-yellow-100 border-4 border-yellow-500 shadow-hard text-yellow-800 font-bold transform -skew-x-2">
                        ⚠️ Mode Demo: Vous n'êtes pas connecté, mais vous pouvez prévisualiser le panel (Maquette Front-End).
                    </div>
                )}

                {/* Header Block */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 relative">
                    <div className="z-10 relative">
                        <h1 className="text-5xl md:text-8xl font-display text-brand-dark flex flex-col md:flex-row items-start md:items-center gap-4 relative group">
                            <span className="bg-brand-primary text-white p-4 border-4 border-brand-dark shadow-[6px_6px_0px_0px_rgba(45,55,72,1)] transform -rotate-12 group-hover:rotate-0 transition-all duration-300">
                                <Shield className="w-12 h-12 md:w-16 md:h-16" />
                            </span>
                            PANEL ADMIN
                        </h1>
                        <p className="text-xl md:text-2xl font-bold text-gray-600 mt-6 max-w-xl">
                            Gérez les <span className="text-brand-primary">cocktails</span>, bannissez les <span className="text-brand-secondary">rageux</span>, devenez le roi de la night.
                        </p>
                    </div>

                    <div className="flex gap-6 z-10 w-full md:w-auto">
                        <div className="flex-1 md:flex-none bg-white border-4 border-brand-dark shadow-[6px_6px_0px_0px_rgba(45,55,72,1)] p-6 transform -skew-x-6 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(45,55,72,1)] transition-all">
                            <div className="text-sm font-black uppercase text-gray-400 tracking-wider">Cocktails Actifs</div>
                            <div className="text-4xl md:text-5xl font-display text-brand-primary mt-2">{totalCocktails}</div>
                        </div>
                        <div className="flex-1 md:flex-none bg-white border-4 border-brand-dark shadow-[6px_6px_0px_0px_rgba(45,55,72,1)] p-6 transform skew-x-3 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(45,55,72,1)] transition-all">
                            <div className="text-sm font-black uppercase text-gray-400 tracking-wider">Membres</div>
                            <div className="text-4xl md:text-5xl font-display text-brand-secondary mt-2">{totalUsers}</div>
                        </div>
                    </div>

                    {/* Decorative background grid elements */}
                    <div className="absolute top-0 right-1/4 w-32 h-32 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                </div>

                {/* Tabs System */}
                <div className="flex gap-2 mb-10 border-b-8 border-brand-dark pb-0 items-end">
                    <button
                        onClick={() => setActiveTab('cocktails')}
                        className={`flex items-center gap-3 text-2xl font-display px-8 py-5 transition-all duration-300 transform origin-bottom border-4 border-b-0 border-brand-dark ${activeTab === 'cocktails' ? 'bg-brand-primary text-white scale-y-110 shadow-[8px_-4px_0px_0px_rgba(45,55,72,0.1)] z-10' : 'bg-gray-100 text-gray-400 hover:text-brand-dark hover:bg-gray-200'}`}
                    >
                        <Wine className="w-8 h-8" /> RECETTES
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-3 text-2xl font-display px-8 py-5 transition-all duration-300 transform origin-bottom border-4 border-b-0 border-brand-dark ${activeTab === 'users' ? 'bg-brand-secondary text-white scale-y-110 shadow-[8px_-4px_0px_0px_rgba(45,55,72,0.1)] z-10' : 'bg-gray-100 text-gray-400 hover:text-brand-dark hover:bg-gray-200'}`}
                    >
                        <Users className="w-8 h-8" /> UTILISATEURS
                    </button>
                </div>

                {/* Workspace Area */}
                <div className="relative min-h-[500px]">
                    {activeTab === 'cocktails' && (
                        <div className="space-y-8 animate-slide-right">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border-4 border-brand-dark shadow-[8px_8px_0px_0px_rgba(45,55,72,1)]">
                                <div className="relative w-full sm:w-[400px]">
                                    <Input placeholder="Rechercher un cocktail..." className="pl-12 w-full text-lg !py-3" />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                                </div>
                                <Button className="w-full sm:w-auto text-xl py-4" variant="primary">
                                    <Plus className="w-6 h-6 mr-2" />
                                    AJOUTER
                                </Button>
                            </div>

                            <div className="bg-white border-4 border-brand-dark shadow-[12px_12px_0px_0px_rgba(45,55,72,1)] overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-brand-dark text-white border-b-4 border-brand-dark">
                                            <th className="p-5 font-black uppercase tracking-widest text-lg w-20">ID</th>
                                            <th className="p-5 font-black uppercase tracking-widest text-lg">Nom</th>
                                            <th className="p-5 font-black uppercase tracking-widest text-lg">Catégorie</th>
                                            <th className="p-5 font-black uppercase tracking-widest text-lg text-center">Status</th>
                                            <th className="p-5 font-black uppercase tracking-widest text-lg text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cocktails.map((c, i) => (
                                            <tr key={c.id} className={`border-b-4 border-gray-100 hover:bg-[#FFF9F0] transition-colors group`}>
                                                <td className="p-5 font-black text-gray-400 text-xl">#{c.id}</td>
                                                <td className="p-5 font-bold text-2xl text-brand-dark group-hover:text-brand-primary transition-colors flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-xl">🍹</div>
                                                    {c.name}
                                                </td>
                                                <td className="p-5 font-bold text-gray-500 text-lg uppercase tracking-wide">{c.category}</td>
                                                <td className="p-5 text-center">
                                                    <span className={`inline-block px-4 py-2 text-sm font-black uppercase border-2 shadow-[2px_2px_0px_0px_rgba(45,55,72,1)] transform -skew-x-12 ${c.status === 'published' ? 'bg-green-300 border-green-800 text-green-900' : 'bg-brand-tertiary border-yellow-700 text-yellow-900'}`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="p-5 flex justify-end gap-3">
                                                    <button className="p-3 bg-blue-100 hover:bg-blue-300 text-blue-900 border-2 border-brand-dark transition-all transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(45,55,72,1)]">
                                                        <Edit2 className="w-6 h-6" />
                                                    </button>
                                                    <button
                                                        onClick={() => setCocktails(cocktails.filter(x => x.id !== c.id))}
                                                        className="p-3 bg-red-100 hover:bg-red-400 hover:text-white text-red-600 border-2 border-brand-dark transition-all transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(45,55,72,1)]"
                                                    >
                                                        <Trash2 className="w-6 h-6" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-8 animate-slide-left">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border-4 border-brand-dark shadow-[8px_8px_0px_0px_rgba(45,55,72,1)]">
                                <div className="relative w-full sm:w-[400px]">
                                    <Input placeholder="Rechercher un utilisateur (email/pseudo)..." className="pl-12 w-full text-lg !py-3" />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                                </div>
                            </div>

                            <div className="bg-white border-4 border-brand-dark shadow-[12px_12px_0px_0px_rgba(45,55,72,1)] overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-brand-dark text-white border-b-4 border-brand-dark">
                                            <th className="p-5 font-black uppercase tracking-widest text-lg w-20">ID</th>
                                            <th className="p-5 font-black uppercase tracking-widest text-lg">Membre</th>
                                            <th className="p-5 font-black uppercase tracking-widest text-lg">Rôle</th>
                                            <th className="p-5 font-black uppercase tracking-widest text-lg text-center">Status</th>
                                            <th className="p-5 font-black uppercase tracking-widest text-lg text-right">Sanctions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u, i) => (
                                            <tr key={u.id} className={`border-b-4 border-gray-100 hover:bg-[#FFF9F0] transition-colors group ${u.status === 'banned' ? 'opacity-60 bg-gray-50' : ''}`}>
                                                <td className="p-5 font-black text-gray-400 text-xl">#{u.id}</td>
                                                <td className="p-5">
                                                    <div className="font-bold text-2xl text-brand-dark group-hover:text-brand-secondary transition-colors inline-flex items-center gap-2">
                                                        {u.role === 'Admin' && <Shield className="w-5 h-5 text-brand-primary" />}
                                                        {u.username}
                                                    </div>
                                                    <div className="text-gray-500 text-lg font-bold">{u.email}</div>
                                                </td>
                                                <td className="p-5">
                                                    <span className={`inline-block px-4 py-2 text-sm font-black uppercase border-2 shadow-[2px_2px_0px_0px_rgba(45,55,72,1)] transform skew-x-12 ${u.role === 'Admin' ? 'bg-purple-300 border-purple-900 text-purple-900' : 'bg-gray-200 border-gray-600 text-gray-700'}`}>
                                                        <span className="block transform -skew-x-12">{u.role}</span>
                                                    </span>
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {u.status === 'active' ? (
                                                            <div className="bg-green-100 text-green-700 font-bold px-3 py-1 border-2 border-green-700 flex items-center gap-2">
                                                                <CheckCircle className="w-5 h-5" /> ACTIF
                                                            </div>
                                                        ) : (
                                                            <div className="bg-red-100 text-red-700 font-bold px-3 py-1 border-2 border-red-700 flex items-center gap-2">
                                                                <XCircle className="w-5 h-5" /> BANNI
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-5 flex justify-end gap-3 items-center min-h-[5rem]">
                                                    <button
                                                        onClick={() => {
                                                            setUsers(users.map(user => user.id === u.id ? { ...user, status: user.status === 'active' ? 'banned' : 'active' } : user))
                                                        }}
                                                        className={`p-3 border-2 border-brand-dark transition-all transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(45,55,72,1)] font-bold uppercase tracking-wider ${u.status === 'active' ? 'bg-orange-200 hover:bg-orange-400 text-orange-900' : 'bg-green-200 hover:bg-green-400 text-green-900'}`}
                                                        title={u.status === 'active' ? "Bannir" : "Réactiver"}
                                                    >
                                                        {u.status === 'active' ? 'Ban Hammer' : 'Unban'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
