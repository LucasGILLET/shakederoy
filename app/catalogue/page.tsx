'use client';

import { useState } from 'react';
import { CocktailCard } from '../components/CocktailCard';
import { Button } from '../components/Button';
import { Search, Sparkles } from 'lucide-react';
import { MOCK_COCKTAILS } from '../lib/data';
import Link from 'next/link';

export default function Catalogue() {
    const [filter, setFilter] = useState<'all' | 'alcohol' | 'no-alcohol'>('all');

    const filteredCocktails = MOCK_COCKTAILS.filter(c => {
        if (filter === 'alcohol') return c.alcohol;
        if (filter === 'no-alcohol') return !c.alcohol;
        return true;
    });

    return (
        <div className="min-h-screen bg-[#FFF9F0]">
            {/* Header with Marquee */}
            <div className="relative py-20 border-b-8 border-brand-dark bg-brand-tertiary overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-marquee"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-8xl md:text-[10rem] font-display leading-[0.8] text-brand-dark mb-6">
                        LA CARTE
                    </h1>
                    <div className="inline-block bg-white border-4 border-brand-dark px-6 py-2 shadow-hard-sm transform rotate-2">
                        <span className="font-bold text-xl uppercase tracking-widest">Version 2.0 • {filteredCocktails.length} Recettes</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {/* Search & Filter Bar */}
                <div className="flex flex-col lg:flex-row gap-8 mb-20 items-end">
                    <div className="flex-1 w-full">
                        <label className="font-bold text-xl uppercase mb-4 block ml-2">Rechercher un cocktail</label>
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-brand-dark pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Mojito, Spritz..."
                                className="w-full pl-20 pr-8 py-6 text-2xl font-bold border-4 border-brand-dark shadow-hard bg-white focus:outline-none focus:translate-x-[4px] focus:translate-y-[4px] focus:shadow-none transition-all placeholder:text-gray-300"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {[
                            { id: 'all', label: 'Tout' },
                            { id: 'alcohol', label: 'Avec Alcool' },
                            { id: 'no-alcohol', label: 'Sans Alcool' }
                        ].map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id as any)}
                                className={`
                                    px-8 py-6 text-lg font-black uppercase border-4 border-brand-dark transition-all
                                    ${filter === f.id
                                        ? 'bg-brand-dark text-white shadow-none translate-x-[4px] translate-y-[4px]'
                                        : 'bg-white text-brand-dark shadow-hard hover:-translate-y-1'
                                    }
                                `}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                    {filteredCocktails.map(cocktail => (
                        <CocktailCard key={cocktail.id} {...cocktail} />
                    ))}
                </div>

                {/* Empty State */}
                {filteredCocktails.length === 0 && (
                    <div className="text-center py-32 border-8 border-dashed border-gray-300 rounded-3xl">
                        <div className="text-9xl mb-8 animate-bounce">🤔</div>
                        <h3 className="text-4xl font-display mb-4">Rien trouvé...</h3>
                        <p className="text-xl text-gray-500 mb-8">C'est le moment d'inventer ta propre recette !</p>
                        <Link href="/create">
                            <Button size="lg" className="shadow-hard">Créer mon cocktail <Sparkles className="w-6 h-6 ml-2" /></Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
