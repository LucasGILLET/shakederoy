'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Flame, Heart, LogOut, Search, Sparkles, User as UserIcon } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b-4 border-brand-primary shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 shadow-lg flex items-center justify-center text-white font-black text-2xl group-hover:scale-110 transition-transform transform skewX(-10deg) group-hover:skewX(-15deg)">
                            <span className="transform skewX(10deg)">S</span>
                        </div>
                        <span className="font-display text-3xl tracking-tight text-brand-dark hover-bounce">
                            Shake<span className="text-brand-primary">De</span>Roy
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/catalogue" className="font-bold text-brand-dark hover:text-brand-primary transition-colors text-lg hover-scale">
                            Cocktails
                        </Link>
                        <Link href="/trends" className="font-bold text-brand-dark hover:text-brand-primary transition-colors text-lg hover-scale flex items-center gap-1">
                            <Flame className="w-5 h-5" />
                            Tendances
                        </Link>
                        {user && (
                            <>
                                <Link href="/favorites" className="font-bold text-brand-dark hover:text-brand-primary transition-colors text-lg hover-scale flex items-center gap-1">
                                    <Heart className="w-5 h-5" />
                                    Favoris
                                </Link>
                                <Link href="/my-cocktails" className="font-bold text-brand-dark hover:text-brand-primary transition-colors text-lg hover-scale">
                                    Mes creations
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/catalogue" className="p-3 text-brand-dark hover:bg-pink-50 border-2 border-transparent hover:border-brand-primary transition-all transform skewX(-5deg) hover:skewX(-10deg) hover:scale-110">
                            <Search className="w-6 h-6 transform skewX(5deg)" />
                        </Link>

                        {user ? (
                            <div className="relative">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDropdownOpen((current) => !current)}
                                    className="gap-2"
                                >
                                    <UserIcon className="w-4 h-4" />
                                    {user.username || user.email}
                                </Button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-brand-dark shadow-hard rounded-md z-50 overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                            <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                            <p className="text-xs uppercase tracking-wide text-gray-500">{user.role}</p>
                                        </div>
                                        <Link
                                            href="/profile"
                                            onClick={() => setDropdownOpen(false)}
                                            className="w-full text-left px-4 py-2 text-sm text-brand-dark hover:bg-brand-primary/10 flex items-center gap-2 border-b border-gray-100 font-bold"
                                        >
                                            <UserIcon className="w-4 h-4 text-brand-primary" />
                                            Mon profil
                                        </Link>
                                        <Link
                                            href="/favorites"
                                            onClick={() => setDropdownOpen(false)}
                                            className="w-full text-left px-4 py-2 text-sm text-brand-dark hover:bg-brand-primary/10 flex items-center gap-2 border-b border-gray-100 font-bold"
                                        >
                                            <Heart className="w-4 h-4 text-brand-primary" />
                                            Mes favoris
                                        </Link>
                                        <Link
                                            href="/my-cocktails"
                                            onClick={() => setDropdownOpen(false)}
                                            className="w-full text-left px-4 py-2 text-sm text-brand-dark hover:bg-brand-primary/10 flex items-center gap-2 border-b border-gray-100 font-bold"
                                        >
                                            <Sparkles className="w-4 h-4 text-brand-primary" />
                                            Mes creations
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link
                                                href="/admin"
                                                onClick={() => setDropdownOpen(false)}
                                                className="w-full text-left px-4 py-2 text-sm text-brand-dark hover:bg-brand-primary/10 flex items-center gap-2 border-b border-gray-100 font-bold"
                                            >
                                                <Sparkles className="w-4 h-4 text-brand-primary" />
                                                Panel admin
                                            </Link>
                                        )}
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                await logout();
                                                setDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Deconnexion
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="hidden sm:block">
                                <Button variant="outline" size="sm">Connexion</Button>
                            </Link>
                        )}

                        <Link href="/create" className="hidden sm:block">
                            <Button variant="primary" size="sm">
                                Creer
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
