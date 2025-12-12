'use client';

import { Button } from '@/app/components/Button';
import { useState } from 'react';
import { Users, Copy, Check, Sparkles, ArrowRight, ShoppingCart, ChefHat } from 'lucide-react';

type PartyStep = 'setup' | 'lobby' | 'preferences' | 'results';

interface Guest {
    id: string;
    name: string;
    preferences: {
        alcohol: boolean;
        intensity: 'light' | 'medium' | 'strong';
        tastes: string[];
    };
}

export default function PartyMode() {
    const [step, setStep] = useState<PartyStep>('setup');
    const [partyName, setPartyName] = useState('');
    const [partyCode] = useState('SHAKE2024');
    const [copied, setCopied] = useState(false);
    const [guests, setGuests] = useState<Guest[]>([
        { id: '1', name: 'Toi', preferences: { alcohol: true, intensity: 'medium', tastes: [] } }
    ]);

    const copyCode = () => {
        navigator.clipboard.writeText(partyCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Mock recommended cocktails
    const recommendedCocktails = [
        { name: 'Mojito Royal', servings: 4, emoji: '🍹' },
        { name: 'Cosmopolitan', servings: 3, emoji: '🍸' },
        { name: 'Virgin Colada', servings: 2, emoji: '🥥' },
    ];

    const ingredients = [
        { name: 'Rhum Blanc', amount: '16cl', emoji: '🥃' },
        { name: 'Menthe Fraîche', amount: '32 feuilles', emoji: '🌿' },
        { name: 'Citron Vert', amount: '2', emoji: '🍋' },
        { name: 'Vodka', amount: '12cl', emoji: '🍾' },
        { name: 'Jus d\'Ananas', amount: '24cl', emoji: '🍍' },
        { name: 'Lait de Coco', amount: '8cl', emoji: '🥥' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 py-12">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12 animate-bounce-in">
                    <div className="text-8xl mb-4 animate-wiggle">🎊</div>
                    <h1 className="text-7xl font-display mb-4 hover-bounce">
                        Mode <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Soirée</span>
                    </h1>
                    <p className="text-2xl text-gray-600">Organise la soirée parfaite avec tes potes !</p>
                </div>

                {/* Setup Step */}
                {step === 'setup' && (
                    <div className="max-w-2xl mx-auto animate-slide-left">
                        <div className="card-skew bg-white p-10">
                            <div className="transform skewY(2deg)">
                                <h2 className="text-4xl font-display mb-8 text-center">C'est parti ! 🚀</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-brand-dark">
                                            Nom de ta soirée
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-4 border-4 border-gray-300 focus:border-brand-primary focus:outline-none transition-all bg-white text-lg font-medium shadow-md transform skewX(-2deg) focus:skewX(0deg)"
                                            placeholder="Ex: Soirée d'été 2024"
                                            value={partyName}
                                            onChange={(e) => setPartyName(e.target.value)}
                                        />
                                    </div>

                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-4 border-purple-200">
                                        <h3 className="font-display text-2xl mb-4">Comment ça marche ?</h3>
                                        <ol className="space-y-3 text-lg">
                                            <li className="flex gap-3">
                                                <span className="font-black text-brand-primary">1.</span>
                                                <span>Crée ta soirée et partage le code avec tes amis</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="font-black text-brand-primary">2.</span>
                                                <span>Chacun indique ses préférences (alcool, goûts...)</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="font-black text-brand-primary">3.</span>
                                                <span>L'app génère les cocktails parfaits + la liste de courses !</span>
                                            </li>
                                        </ol>
                                    </div>

                                    <Button
                                        className="w-full justify-center"
                                        size="lg"
                                        onClick={() => setStep('lobby')}
                                    >
                                        Créer la soirée <ArrowRight className="w-6 h-6" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lobby Step */}
                {step === 'lobby' && (
                    <div className="animate-bounce-in">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            {/* Left: Party Info */}
                            <div className="card-skew bg-white p-8">
                                <div className="transform skewY(2deg)">
                                    <h2 className="text-4xl font-display mb-6">{partyName || 'Ma Soirée'}</h2>

                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-center mb-6 transform skewX(-3deg)">
                                        <div className="transform skewX(3deg)">
                                            <p className="text-white/80 font-bold mb-2">Code de la soirée</p>
                                            <div className="text-6xl font-display text-white mb-4">{partyCode}</div>
                                            <button
                                                onClick={copyCode}
                                                className="inline-flex items-center gap-2 bg-white text-brand-primary px-6 py-3 font-bold border-4 border-white hover:bg-pink-50 transition-all"
                                            >
                                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                                {copied ? 'Copié !' : 'Copier le code'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-display text-2xl flex items-center gap-2">
                                            <Users className="w-6 h-6" />
                                            Participants ({guests.length})
                                        </h3>
                                        {guests.map((guest) => (
                                            <div key={guest.id} className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200">
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                                    {guest.name[0]}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-lg">{guest.name}</div>
                                                    <div className="text-sm text-gray-500">En attente de préférences...</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Preferences */}
                            <div className="card-skew bg-gradient-to-br from-white to-purple-50 p-8">
                                <div className="transform skewY(2deg)">
                                    <h2 className="text-3xl font-display mb-6">Tes préférences 🎯</h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold mb-3 uppercase tracking-wide text-brand-dark">
                                                Type de cocktails
                                            </label>
                                            <div className="flex gap-3">
                                                <button className="flex-1 py-4 px-4 font-bold border-4 bg-brand-secondary text-white border-brand-dark transform skewX(-5deg)">
                                                    <span className="transform skewX(5deg) inline-block">🍸 Avec alcool</span>
                                                </button>
                                                <button className="flex-1 py-4 px-4 font-bold border-4 bg-white text-gray-600 border-gray-300 hover:border-brand-secondary transform skewX(-5deg)">
                                                    <span className="transform skewX(5deg) inline-block">🥤 Sans alcool</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-3 uppercase tracking-wide text-brand-dark">
                                                Intensité
                                            </label>
                                            <div className="flex gap-2">
                                                {['Léger', 'Moyen', 'Fort'].map((level) => (
                                                    <button
                                                        key={level}
                                                        className={`flex-1 py-3 px-3 font-bold border-4 transition-all transform skewX(-5deg) ${level === 'Moyen'
                                                            ? 'bg-brand-primary text-white border-brand-dark'
                                                            : 'bg-white text-gray-600 border-gray-300 hover:border-brand-primary'
                                                            }`}
                                                    >
                                                        <span className="transform skewX(5deg) inline-block text-sm">{level}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-3 uppercase tracking-wide text-brand-dark">
                                                Goûts préférés
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Fruité', 'Frais', 'Acidulé', 'Sucré', 'Amer'].map((taste) => (
                                                    <button
                                                        key={taste}
                                                        className="px-4 py-2 font-bold border-3 border-gray-300 bg-white hover:border-brand-primary hover:bg-brand-primary hover:text-white transition-all transform skewX(-5deg)"
                                                    >
                                                        <span className="transform skewX(5deg) inline-block text-sm">{taste}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full justify-center"
                                            size="lg"
                                            onClick={() => setStep('results')}
                                        >
                                            Générer les cocktails ! <Sparkles className="w-6 h-6" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Step */}
                {step === 'results' && (
                    <div className="space-y-8 animate-slide-left">
                        {/* Success Banner */}
                        <div className="relative bg-gradient-to-r from-green-400 via-teal-400 to-blue-400 p-12 text-center overflow-hidden transform skewY(-2deg) shadow-2xl">
                            <div className="absolute inset-0 bg-white/10"></div>
                            <div className="relative z-10 transform skewY(2deg)">
                                <div className="text-7xl mb-4">🎉</div>
                                <h2 className="text-5xl font-display text-white mb-4">C'est prêt !</h2>
                                <p className="text-2xl text-white/90">Voici les cocktails parfaits pour ta soirée</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            {/* Recommended Cocktails */}
                            <div className="card-skew bg-white p-8">
                                <div className="transform skewY(2deg)">
                                    <h3 className="text-3xl font-display mb-6 flex items-center gap-2">
                                        <ChefHat className="w-8 h-8 text-brand-primary" />
                                        Menu de la soirée
                                    </h3>

                                    <div className="space-y-4">
                                        {recommendedCocktails.map((cocktail, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-brand-primary">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-4xl">{cocktail.emoji}</div>
                                                    <div>
                                                        <div className="font-display text-xl">{cocktail.name}</div>
                                                        <div className="text-sm text-gray-600">{cocktail.servings} personnes</div>
                                                    </div>
                                                </div>
                                                <div className="text-3xl font-display text-brand-primary">×{cocktail.servings}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 p-4 bg-yellow-50 border-4 border-yellow-300 text-center">
                                        <p className="font-bold text-lg">Total: {recommendedCocktails.reduce((acc, c) => acc + c.servings, 0)} cocktails</p>
                                    </div>
                                </div>
                            </div>

                            {/* Shopping List */}
                            <div className="card-skew bg-gradient-to-br from-white to-green-50 p-8">
                                <div className="transform skewY(2deg)">
                                    <h3 className="text-3xl font-display mb-6 flex items-center gap-2">
                                        <ShoppingCart className="w-8 h-8 text-green-600" />
                                        Liste de courses
                                    </h3>

                                    <div className="space-y-3">
                                        {ingredients.map((ing, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 hover:border-green-400 transition-all">
                                                <input type="checkbox" className="w-5 h-5 accent-green-500" />
                                                <div className="text-3xl">{ing.emoji}</div>
                                                <div className="flex-1">
                                                    <div className="font-bold">{ing.name}</div>
                                                </div>
                                                <div className="font-mono font-bold text-green-600">{ing.amount}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        <Button variant="outline" className="flex-1">
                                            📄 Export PDF
                                        </Button>
                                        <Button variant="secondary" className="flex-1">
                                            📱 Partager
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mode Barman */}
                        <div className="card-skew bg-gradient-to-br from-purple-500 to-pink-500 p-8 text-white">
                            <div className="transform skewY(2deg)">
                                <h3 className="text-4xl font-display mb-4 flex items-center gap-3">
                                    👨‍🍳 Mode Barman
                                </h3>
                                <p className="text-xl mb-6 opacity-90">
                                    Lance le mode pas-à-pas pour préparer tous les cocktails dans l'ordre optimal !
                                </p>
                                <Button variant="outline" size="lg" className="!bg-white !text-brand-primary !border-white">
                                    Lancer le mode barman <ArrowRight className="w-6 h-6" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
