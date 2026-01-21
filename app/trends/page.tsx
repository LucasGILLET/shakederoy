'use client';

import { useState } from 'react';
import { CocktailCard } from '../components/CocktailCard';
import { MOCK_COCKTAILS } from '../lib/data';
import { Flame, TrendingUp, Clock, Trophy, Sparkles } from 'lucide-react';

type TrendFilter = 'hot' | 'new' | 'top';

export default function Trends() {
    const [filter, setFilter] = useState<TrendFilter>('hot');

    // Mock trending data
    const trendingCocktails = MOCK_COCKTAILS.slice(0, 6);
    const newCocktails = MOCK_COCKTAILS.slice(2, 8);
    const topCocktails = MOCK_COCKTAILS.slice(0, 3);

    const displayedCocktails = filter === 'hot' ? trendingCocktails : filter === 'new' ? newCocktails : topCocktails;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12 animate-bounce-in">
                    <div className="text-7xl mb-4 animate-wiggle">🔥</div>
                    <h1 className="text-6xl md:text-8xl font-display mb-4 hover-bounce">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
                            Tendances
                        </span>
                    </h1>
                    <p className="text-2xl text-gray-600">Les cocktails qui font le buzz en ce moment</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex justify-center gap-4 mb-12">
                    <button
                        onClick={() => setFilter('hot')}
                        className={`px-8 py-4 font-bold text-lg border-4 transition-all transform skewX(-5deg) hover:scale-105 ${filter === 'hot'
                            ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-brand-dark shadow-lg'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'
                            }`}
                    >
                        <span className="transform skewX(5deg) inline-flex items-center gap-2">
                            <Flame className="w-6 h-6" />
                            Hot
                        </span>
                    </button>
                    <button
                        onClick={() => setFilter('new')}
                        className={`px-8 py-4 font-bold text-lg border-4 transition-all transform skewX(-5deg) hover:scale-105 ${filter === 'new'
                            ? 'bg-gradient-to-r from-teal-400 to-blue-500 text-white border-brand-dark shadow-lg'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
                            }`}
                    >
                        <span className="transform skewX(5deg) inline-flex items-center gap-2">
                            <Sparkles className="w-6 h-6" />
                            Nouveaux
                        </span>
                    </button>
                    <button
                        onClick={() => setFilter('top')}
                        className={`px-8 py-4 font-bold text-lg border-4 transition-all transform skewX(-5deg) hover:scale-105 ${filter === 'top'
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-brand-dark shadow-lg'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-yellow-400'
                            }`}
                    >
                        <span className="transform skewX(5deg) inline-flex items-center gap-2">
                            <Trophy className="w-6 h-6" />
                            Top
                        </span>
                    </button>
                </div>

                {/* Stats Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
                    <div className="card-skew bg-gradient-to-br from-orange-100 to-red-100 p-6 text-center animate-bounce-in">
                        <div className="transform skewY(2deg)">
                            <div className="text-5xl mb-2">🔥</div>
                            <div className="text-4xl font-display mb-1">2.4k</div>
                            <div className="text-gray-600 font-bold">Cocktails tendances</div>
                        </div>
                    </div>
                    <div className="card-skew bg-gradient-to-br from-teal-100 to-blue-100 p-6 text-center animate-bounce-in" style={{ animationDelay: '0.1s' }}>
                        <div className="transform skewY(2deg)">
                            <div className="text-5xl mb-2">✨</div>
                            <div className="text-4xl font-display mb-1">156</div>
                            <div className="text-gray-600 font-bold">Nouveaux cette semaine</div>
                        </div>
                    </div>
                    <div className="card-skew bg-gradient-to-br from-yellow-100 to-orange-100 p-6 text-center animate-bounce-in" style={{ animationDelay: '0.2s' }}>
                        <div className="transform skewY(2deg)">
                            <div className="text-5xl mb-2">👑</div>
                            <div className="text-4xl font-display mb-1">12.8k</div>
                            <div className="text-gray-600 font-bold">Votes ce mois-ci</div>
                        </div>
                    </div>
                </div>

                {/* Cocktails Grid */}
                <div className="mb-8">
                    <h2 className="text-3xl font-display mb-6 flex items-center gap-3">
                        {filter === 'hot' && <><Flame className="w-8 h-8 text-orange-500" /> Les plus chauds</>}
                        {filter === 'new' && <><Sparkles className="w-8 h-8 text-teal-500" /> Les nouveaux</>}
                        {filter === 'top' && <><Trophy className="w-8 h-8 text-yellow-500" /> Le top du mois</>}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {displayedCocktails.map((cocktail, idx) => (
                            <div key={cocktail.id} className="relative animate-slide-left" style={{ animationDelay: `${idx * 0.05}s` }}>
                                <CocktailCard {...cocktail} />
                                {/* Ranking badge for top */}
                                {filter === 'top' && idx < 3 && (
                                    <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-brand-dark text-white font-black text-xl flex items-center justify-center transform rotate-12 shadow-lg z-10">
                                        #{idx + 1}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cocktail of the Month */}
                <div className="mt-32">
                    <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-12 text-center overflow-hidden transform skewY(-2deg) shadow-2xl">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl animate-float"></div>

                        <div className="relative z-10 transform skewY(2deg)">
                            <div className="inline-flex items-center gap-3 mb-6">
                                <Trophy className="w-12 h-12 text-yellow-300 animate-wiggle" />
                                <h2 className="text-5xl font-display text-white">Cocktail du Mois</h2>
                                <Trophy className="w-12 h-12 text-yellow-300 animate-wiggle" style={{ animationDelay: '0.3s' }} />
                            </div>

                            <div className="max-w-2xl mx-auto">
                                <div className="text-8xl mb-6">🏆</div>
                                <h3 className="text-6xl font-display text-white mb-4">Mojito Royal</h3>
                                <p className="text-2xl text-white/90 mb-6">
                                    Le roi des cocktails d'été, revisité avec une touche de champagne
                                </p>
                                <div className="flex justify-center gap-8 text-white">
                                    <div>
                                        <div className="text-4xl font-display">2.4k</div>
                                        <div className="text-lg opacity-90">Votes</div>
                                    </div>
                                    <div>
                                        <div className="text-4xl font-display">856</div>
                                        <div className="text-lg opacity-90">Partages</div>
                                    </div>
                                    <div>
                                        <div className="text-4xl font-display">4.8</div>
                                        <div className="text-lg opacity-90">Note</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
