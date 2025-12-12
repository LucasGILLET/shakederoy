'use client';

import { useState } from 'react';
import { CocktailCard } from '../components/CocktailCard';
import { MOCK_COCKTAILS } from '../lib/data';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import Link from 'next/link';

export default function Favorites() {
    // Mock: In real app, this would come from user's favorites in DB
    const [favorites, setFavorites] = useState(MOCK_COCKTAILS.slice(0, 4));

    const removeFavorite = (id: string) => {
        setFavorites(favorites.filter(c => c.id !== id));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12 animate-bounce-in">
                    <div className="text-7xl mb-4 animate-wiggle">💜</div>
                    <h1 className="text-6xl font-display mb-4 hover-bounce">
                        Mes <span className="text-brand-primary">Favoris</span>
                    </h1>
                    <p className="text-xl text-gray-600">Tes cocktails préférés, tous au même endroit</p>
                </div>

                {favorites.length > 0 ? (
                    <>
                        <div className="flex justify-between items-center mb-8">
                            <p className="text-lg font-bold text-gray-600">
                                {favorites.length} cocktail{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
                            </p>
                            <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" /> Tout supprimer
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                            {favorites.map((cocktail, idx) => (
                                <div key={cocktail.id} className={`relative ${idx === 0 ? 'animate-bounce-in' : ''}`} style={{ animationDelay: `${idx * 0.1}s` }}>
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
                    <div className="card-skew bg-white p-16 text-center animate-bounce-in">
                        <div className="transform skewY(2deg)">
                            <div className="text-8xl mb-6">😢</div>
                            <h2 className="text-4xl font-display mb-4">Aucun favori pour le moment</h2>
                            <p className="text-xl text-gray-600 mb-8">
                                Explore le catalogue et ajoute tes cocktails préférés !
                            </p>
                            <Link href="/catalogue">
                                <Button size="lg">
                                    Découvrir des cocktails
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Collections Section (Future feature) */}
                {favorites.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-4xl font-display mb-8 text-center hover-bounce">
                            Mes <span className="text-brand-secondary">Collections</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[
                                { name: 'Soirée d\'été', emoji: '☀️', count: 0 },
                                { name: 'Cocktails doux', emoji: '🍬', count: 0 },
                                { name: 'Shots', emoji: '🔥', count: 0 },
                            ].map((collection, idx) => (
                                <div key={idx} className="card-skew bg-gradient-to-br from-white to-gray-50 p-6 text-center cursor-pointer hover:scale-105 transition-transform">
                                    <div className="transform skewY(2deg)">
                                        <div className="text-5xl mb-3">{collection.emoji}</div>
                                        <h3 className="text-2xl font-display mb-2">{collection.name}</h3>
                                        <p className="text-gray-500 font-bold">{collection.count} cocktails</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
