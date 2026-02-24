'use client';

import { useState } from 'react';
import { CocktailCard } from '../components/CocktailCard';
import { MOCK_COCKTAILS } from '../lib/mock-data';
import { MapPin, Navigation, Filter, Star } from 'lucide-react';

interface Bar {
    id: string;
    name: string;
    address: string;
    type: string;
    rating: number;
    distance: string;
    emoji: string;
    signatureCocktails: number;
}

const MOCK_BARS: Bar[] = [
    { id: '1', name: 'Le Shaker Parisien', address: '15 Rue de la Soif, Paris', type: 'Cocktail Bar', rating: 4.8, distance: '0.5 km', emoji: '🍸', signatureCocktails: 12 },
    { id: '2', name: 'Tiki Paradise', address: '8 Avenue Tropicale, Paris', type: 'Tiki Bar', rating: 4.6, distance: '1.2 km', emoji: '🌴', signatureCocktails: 8 },
    { id: '3', name: 'Rooftop 360', address: '42 Rue du Ciel, Paris', type: 'Rooftop Bar', rating: 4.9, distance: '2.1 km', emoji: '🌆', signatureCocktails: 15 },
    { id: '4', name: 'Speakeasy Secret', address: '3 Impasse Cachée, Paris', type: 'Speakeasy', rating: 4.7, distance: '0.8 km', emoji: '🕵️', signatureCocktails: 10 },
];

export default function BarsMap() {
    const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
    const [filterType, setFilterType] = useState<string>('all');

    const filteredBars = filterType === 'all' ? MOCK_BARS : MOCK_BARS.filter(b => b.type === filterType);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 py-12">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12 animate-bounce-in">
                    <div className="text-7xl mb-4 animate-wiggle">📍</div>
                    <h1 className="text-6xl md:text-8xl font-display mb-4 hover-bounce">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-teal-500 to-green-500">
                            Map des Bars
                        </span>
                    </h1>
                    <p className="text-2xl text-gray-600">Découvre les meilleurs spots autour de toi</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-6 py-3 font-bold border-4 transition-all transform skewX(-5deg) ${filterType === 'all'
                            ? 'bg-brand-primary text-white border-brand-dark'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-brand-primary'
                            }`}
                    >
                        <span className="transform skewX(5deg) inline-block">Tous</span>
                    </button>
                    {['Cocktail Bar', 'Tiki Bar', 'Rooftop Bar', 'Speakeasy'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-6 py-3 font-bold border-4 transition-all transform skewX(-5deg) ${filterType === type
                                ? 'bg-brand-secondary text-white border-brand-dark'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-brand-secondary'
                                }`}
                        >
                            <span className="transform skewX(5deg) inline-block">{type}</span>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Map Placeholder */}
                    <div className="lg:col-span-2">
                        <div className="card-skew bg-white p-0 h-[600px] overflow-hidden">
                            <div className="transform skewY(2deg) h-full">
                                <div className="relative h-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                                    <div className="text-center">
                                        <MapPin className="w-24 h-24 text-brand-secondary mx-auto mb-4 animate-float" />
                                        <h3 className="text-3xl font-display mb-2">Carte Interactive</h3>
                                        <p className="text-gray-600 text-lg">Intégration Google Maps ici</p>
                                    </div>

                                    {/* Mock pins */}
                                    {filteredBars.map((bar, idx) => (
                                        <button
                                            key={bar.id}
                                            onClick={() => setSelectedBar(bar)}
                                            className="absolute w-12 h-12 bg-brand-primary border-4 border-white text-2xl flex items-center justify-center shadow-lg hover:scale-125 transition-transform cursor-pointer"
                                            style={{
                                                top: `${20 + idx * 15}%`,
                                                left: `${30 + idx * 10}%`,
                                            }}
                                            title={bar.name}
                                        >
                                            {bar.emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bars List */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-display">{filteredBars.length} bars trouvés</h2>
                            <button className="p-2 border-2 border-gray-300 hover:border-brand-primary transition-all">
                                <Navigation className="w-5 h-5" />
                            </button>
                        </div>

                        {filteredBars.map((bar, idx) => (
                            <div
                                key={bar.id}
                                onClick={() => setSelectedBar(bar)}
                                className={`card-skew p-4 cursor-pointer transition-all hover:scale-105 ${selectedBar?.id === bar.id ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white' : 'bg-white'
                                    } animate-slide-left`}
                                style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                                <div className="transform skewY(2deg)">
                                    <div className="flex items-start gap-3">
                                        <div className="text-4xl">{bar.emoji}</div>
                                        <div className="flex-1">
                                            <h3 className="font-display text-xl mb-1">{bar.name}</h3>
                                            <p className={`text-sm mb-2 ${selectedBar?.id === bar.id ? 'text-white/80' : 'text-gray-600'}`}>
                                                {bar.address}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm font-bold">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                                                    {bar.rating}
                                                </div>
                                                <div>{bar.distance}</div>
                                                <div>{bar.signatureCocktails} cocktails</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Bar Details */}
                {selectedBar && (
                    <div className="mt-12 animate-bounce-in">
                        <div className="card-skew bg-white p-8">
                            <div className="transform skewY(2deg)">
                                <div className="flex items-start justify-between mb-8">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="text-6xl">{selectedBar.emoji}</div>
                                            <div>
                                                <h2 className="text-4xl font-display">{selectedBar.name}</h2>
                                                <p className="text-gray-600 text-lg">{selectedBar.type}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-lg font-bold text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-5 h-5 fill-current text-yellow-400" />
                                                {selectedBar.rating}/5
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-5 h-5" />
                                                {selectedBar.distance}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="px-6 py-3 bg-brand-primary text-white font-bold border-4 border-brand-dark transform skewX(-5deg) hover:scale-105 transition-all">
                                        <span className="transform skewX(5deg) inline-block">Ouvrir dans Maps</span>
                                    </button>
                                </div>

                                <h3 className="text-3xl font-display mb-6">Cocktails Signature</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                                    {MOCK_COCKTAILS.slice(0, 4).map((cocktail) => (
                                        <CocktailCard key={cocktail.id} {...cocktail} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
