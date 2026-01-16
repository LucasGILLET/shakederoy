'use client';

import { apiFetch } from '@/app/lib/api';
import { Button } from '@/app/components/Button';
import { Clock, Gauge, ArrowLeft, Heart, Share2, ChefHat, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState, use } from 'react';

interface Ingredient {
    name: string;
    amount: string;
}

interface Cocktail {
    id: string;
    name: string;
    description: string;
    difficulty: string;
    duration: string;
    alcohol: boolean;
    color: string;
    tags: string[];
    ingredients: Ingredient[];
    steps: string[];
    image?: string;
}

export default function CocktailDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [cocktail, setCocktail] = useState<Cocktail | null>(null);
    const [similarCocktails, setSimilarCocktails] = useState<Cocktail[]>([]);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        
        const fetchCocktailData = async () => {
             try {
                 const data = await apiFetch<any>(`/cocktails/${id}`);
                 
                 const allCocktails = await apiFetch<any[]>('/cocktails');
                 const others = allCocktails.filter((c: any) => c.id !== id).slice(0, 3);
                 
                 const parsedSimilar = others.map(c => ({
                     ...c,
                     color: c.color || '#EF4444',
                     difficulty: c.difficulty || 'Moyen',
                     duration: c.duration || '5 min',
                     tags: c.tags || [],
                     description: c.description || ''
                 }));
                 setSimilarCocktails(parsedSimilar);

                 let ingredients: Ingredient[] = [];
                 let steps: string[] = [];
                 
                 try {
                     ingredients = typeof data.ingredients === 'string' ? JSON.parse(data.ingredients) : data.ingredients;
                 } catch (e) { console.error('Error parsing ingredients', e); }

                 try {
                     steps = typeof data.instructions === 'string' ? JSON.parse(data.instructions) : (data.instructions ? [data.instructions] : []);
                 } catch (e) { 
                     steps = [data.instructions];
                 }

                 setCocktail({
                     id: data.id,
                     name: data.name,
                     description: data.description,
                     difficulty: data.difficulty || 'Moyen',
                     duration: data.duration || '5 min',
                     alcohol: data.alcohol !== undefined ? data.alcohol : true,
                     color: data.color || '#EF4444',
                     tags: data.tags || [],
                     ingredients,
                     steps,
                     image: data.image
                 });
             } catch (err) {
                 console.error('Failed to fetch cocktail', err);
             } finally {
                 setLoading(false);
             }
        };

        fetchCocktailData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
                <div className="text-4xl font-display animate-bounce">Chargement... 🍹</div>
            </div>
        );
    }

    if (!cocktail) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden">
            {/* Back Button - Fixed */}
            <div className="fixed top-24 left-8 z-50">
                <Link href="/catalogue">
                    <button className="p-4 bg-white border-4 border-brand-dark shadow-lg hover:scale-110 transition-all transform skewX(-5deg)">
                        <ArrowLeft className="w-6 h-6 transform skewX(5deg)" />
                    </button>
                </Link>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center min-h-[calc(100vh-200px)]">
                    {/* Left: Image - Slides in from left */}
                    <div className={`relative transition-all duration-1000 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
                        <div className="relative">
                            {/* Main Image Container */}
                            <div
                                className="relative w-full aspect-square border-8 border-brand-dark shadow-2xl transform -rotate-3 hover:rotate-0 transition-all duration-500"
                                style={{ backgroundColor: cocktail.color + '40' }}
                            >
                                {/* Placeholder Image */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-[20rem] font-display opacity-20 select-none">
                                        {cocktail.name.substring(0, 1)}
                                    </div>
                                </div>

                                {/* Floating badges */}
                                {!cocktail.alcohol && (
                                    <div className="absolute -top-6 -right-6 bg-green-400 text-brand-dark px-6 py-3 font-black text-xl border-4 border-brand-dark shadow-lg transform rotate-12 animate-wiggle">
                                        Sans Alcool
                                    </div>
                                )}

                                <div className="absolute -bottom-6 -left-6 bg-brand-tertiary text-brand-dark px-6 py-3 font-black text-xl border-4 border-brand-dark shadow-lg transform -rotate-12">
                                    {cocktail.difficulty}
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -z-10 top-8 left-8 w-full h-full border-8 border-brand-secondary opacity-30"></div>
                            <div className="absolute -z-20 top-16 left-16 w-full h-full border-8 border-brand-primary opacity-20"></div>
                        </div>
                    </div>

                    {/* Right: Specs - Fades in */}
                    <div className={`space-y-12 transition-all duration-1000 delay-300 ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
                        {/* Title */}
                        <div>
                            <div className="inline-block bg-brand-primary text-white px-4 py-2 font-bold text-sm mb-4 transform -rotate-2 border-2 border-brand-dark">
                                COCKTAIL #{cocktail.name}
                            </div>
                            <h1 className="text-7xl md:text-8xl font-display leading-none mb-6 hover-bounce">
                                {cocktail.name}
                            </h1>
                            <p className="text-2xl text-gray-600 italic leading-relaxed border-l-8 border-brand-primary pl-6">
                                "{cocktail.description}"
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="card-skew bg-white p-6 text-center">
                                <div className="transform skewY(2deg)">
                                    <Clock className="w-10 h-10 text-brand-primary mx-auto mb-2" />
                                    <div className="text-3xl font-display mb-1">{cocktail.duration}</div>
                                    <div className="text-sm font-bold text-gray-500 uppercase">Préparation</div>
                                </div>
                            </div>
                            <div className="card-skew bg-white p-6 text-center">
                                <div className="transform skewY(2deg)">
                                    <Gauge className="w-10 h-10 text-brand-secondary mx-auto mb-2" />
                                    <div className="text-3xl font-display mb-1">{cocktail.difficulty}</div>
                                    <div className="text-sm font-bold text-gray-500 uppercase">Difficulté</div>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-3">
                            {cocktail.tags.map((tag, idx) => (
                                <div
                                    key={tag}
                                    className="badge-skew !bg-gradient-to-r !from-purple-400 !to-pink-400 !text-white animate-bounce-in"
                                    style={{ animationDelay: `${idx * 0.1}s` }}
                                >
                                    <span>{tag}</span>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Button size="lg" className="flex-1">
                                <Heart className="w-5 h-5" /> Ajouter aux favoris
                            </Button>
                            <Button variant="outline" size="lg">
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Ingredients & Steps - Full Width Below */}
                <div className="mt-40 grid grid-cols-1 lg:grid-cols-2 gap-24">
                    {/* Ingredients */}
                    <div className={`card-skew bg-white p-10 ${mounted ? 'animate-slide-left' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
                        <div className="transform skewY(2deg)">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 border-4 border-brand-dark flex items-center justify-center transform -rotate-12">
                                    <ShoppingBag className="w-8 h-8 text-white transform rotate-12" />
                                </div>
                                <h2 className="text-5xl font-display">Ingrédients</h2>
                            </div>

                            {cocktail.ingredients && cocktail.ingredients.length > 0 ? (
                                <div className="space-y-4">
                                    {cocktail.ingredients.map((ing, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-50 to-red-50 border-l-8 border-brand-primary hover:scale-105 transition-transform"
                                        >
                                            <span className="font-bold text-2xl">{ing.name}</span>
                                            <span className="font-mono bg-white border-4 border-brand-dark px-4 py-2 text-xl font-black transform skewX(-5deg)">
                                                <span className="transform skewX(5deg) inline-block">{ing.amount}</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic text-xl">Ingrédients non listés pour ce cocktail.</p>
                            )}

                            <Button variant="outline" className="w-full mt-8" size="lg">
                                <ShoppingBag className="w-5 h-5" /> Ajouter à ma liste de courses
                            </Button>
                        </div>
                    </div>

                    {/* Steps */}
                    <div className={`card-skew bg-gradient-to-br from-white to-purple-50 p-10 ${mounted ? 'animate-slide-right' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
                        <div className="transform skewY(2deg)">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 border-4 border-brand-dark flex items-center justify-center transform rotate-12">
                                    <ChefHat className="w-8 h-8 text-white transform -rotate-12" />
                                </div>
                                <h2 className="text-5xl font-display">Préparation</h2>
                            </div>

                            {cocktail.steps && cocktail.steps.length > 0 ? (
                                <div className="space-y-6 relative">
                                    {/* Vertical line */}
                                    <div className="absolute left-[23px] top-8 bottom-8 w-1 bg-gradient-to-b from-purple-400 to-pink-500"></div>

                                    {cocktail.steps.map((step, idx) => (
                                        <div key={idx} className="flex gap-5 relative z-10">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 border-4 border-brand-dark text-white flex items-center justify-center font-black text-xl flex-shrink-0 transform hover:scale-125 hover:rotate-12 transition-all">
                                                {idx + 1}
                                            </div>
                                            <p className="pt-2 text-xl leading-relaxed text-gray-700 flex-1">
                                                {step}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic text-xl">Étapes non listées pour ce cocktail.</p>
                            )}

                            {cocktail.steps && cocktail.steps.length > 0 && (
                                <div className="mt-8 bg-green-50 border-4 border-green-300 p-6 text-center transform skewX(-2deg)">
                                    <div className="transform skewX(2deg)">
                                        <Sparkles className="w-10 h-10 text-green-600 mx-auto mb-2" />
                                        <p className="font-black text-2xl text-green-800">C'est prêt ! Santé 🥂</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Similar Cocktails */}
                <div className="mt-40">
                    <h2 className="text-5xl font-display text-center mb-12 hover-bounce">
                        Tu pourrais aussi <span className="text-brand-primary">aimer</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {similarCocktails.map((similar, idx) => (
                            <Link key={similar.id} href={`/cocktail/${similar.id}`}>
                                <div className={`card-skew bg-white p-6 hover:scale-105 transition-all cursor-pointer ${mounted ? 'animate-bounce-in' : 'opacity-0'}`} style={{ animationDelay: `${1 + idx * 0.1}s` }}>
                                    <div className="transform skewY(2deg)">
                                        <div
                                            className="w-full h-48 mb-4 flex items-center justify-center border-4 border-brand-dark"
                                            style={{ backgroundColor: (similar.color || '#EF4444') + '40' }}
                                        >
                                            <span className="font-display text-6xl opacity-20">{similar.name.substring(0, 1)}</span>
                                        </div>
                                        <h3 className="text-2xl font-display mb-2">{similar.name}</h3>
                                        <p className="text-gray-600 line-clamp-2">{similar.description}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
