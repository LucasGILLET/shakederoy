'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { ArrowLeft, ChefHat, Clock, Gauge, Heart, Share2, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@/app/components/Button';
import { apiFetch } from '@/app/lib/api';
import { fetchFavoritesPage, toggleFavorite } from '@/app/lib/favoritesApi';
import { extractFavoriteIds, mapRawCocktail, type RawCocktail } from '@/app/catalogue/catalogueFilters';

interface CocktailIngredientRow {
    id: string;
    ingredient_id: string;
    ingredient_name?: string;
    quantity?: string | null;
    unit?: string | null;
}

interface PreparationStepRow {
    id: string;
    step_number: number;
    instruction: string;
}

interface CocktailPhotoRow {
    id: string;
    url: string;
    alt_text?: string | null;
    is_primary?: boolean;
}

export default function CocktailDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [cocktail, setCocktail] = useState<ReturnType<typeof mapRawCocktail> | null>(null);
    const [similarCocktails, setSimilarCocktails] = useState<ReturnType<typeof mapRawCocktail>[]>([]);
    const [photos, setPhotos] = useState<CocktailPhotoRow[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState('');
    const [shareMessage, setShareMessage] = useState('');
    const [favoriteError, setFavoriteError] = useState('');

    useEffect(() => {
        setMounted(true);

        const fetchCocktailData = async () => {
            setLoading(true);
            setError('');
            setFavoriteError('');

            try {
                const [rawCocktail, ingredientsData, stepsData, photosData, allCocktails, favoritesData] = await Promise.all([
                    apiFetch<RawCocktail>(`/cocktails/${id}`),
                    apiFetch<CocktailIngredientRow[]>(`/cocktails/${id}/ingredients`).catch(() => []),
                    apiFetch<PreparationStepRow[]>(`/cocktails/${id}/steps`).catch(() => []),
                    apiFetch<CocktailPhotoRow[]>(`/cocktails/${id}/photos`).catch(() => []),
                    apiFetch<RawCocktail[]>('/cocktails'),
                    fetchFavoritesPage().catch(() => []),
                ]);

                const mappedCocktail = mapRawCocktail({
                    ...rawCocktail,
                    ingredients: ingredientsData.map((ingredient) => ({
                        name: ingredient.ingredient_name || ingredient.ingredient_id,
                        amount: [ingredient.quantity, ingredient.unit].filter(Boolean).join(' ').trim(),
                    })),
                    instructions: stepsData
                        .sort((a, b) => a.step_number - b.step_number)
                        .map((step) => step.instruction),
                    image: photosData.find((photo) => photo.is_primary)?.url || photosData[0]?.url || '',
                });

                const approvedCocktails = allCocktails
                    .filter((entry) => {
                        const status = typeof (entry as RawCocktail & { status?: unknown }).status === 'string'
                            ? String((entry as RawCocktail & { status?: unknown }).status)
                            : 'approved';
                        return status === 'approved' && String(entry.id) !== id;
                    })
                    .slice(0, 3)
                    .map(mapRawCocktail);

                setCocktail(mappedCocktail);
                setSimilarCocktails(approvedCocktails);
                setPhotos(photosData);
                setFavoriteIds(extractFavoriteIds(favoritesData));
            } catch (fetchError: unknown) {
                const message = fetchError instanceof Error ? fetchError.message : 'Impossible de charger ce cocktail.';
                if (message.toLowerCase().includes('not found')) {
                    setNotFound(true);
                } else {
                    setError(message);
                }
            } finally {
                setLoading(false);
            }
        };

        void fetchCocktailData();
    }, [id]);

    const handleFavoriteToggle = async () => {
        if (!cocktail) {
            return;
        }

        setFavoriteError('');

        try {
            const result = await toggleFavorite(cocktail.id);
            setFavoriteIds((current) => {
                const next = new Set(current);
                if (result.action === 'added') {
                    next.add(cocktail.id);
                } else {
                    next.delete(cocktail.id);
                }
                return next;
            });
        } catch {
            setFavoriteError('Impossible de mettre a jour les favoris.');
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setShareMessage('Lien copie.');
        } catch {
            setShareMessage('Copie du lien indisponible sur ce navigateur.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
                <div className="text-4xl font-display animate-bounce">Chargement...</div>
            </div>
        );
    }

    if (!cocktail || notFound) {
        return (
            <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-5xl font-display mb-4">Cocktail introuvable</h1>
                    <p className="text-gray-600 text-lg mb-6">Le cocktail demande n'existe pas ou n'est plus disponible.</p>
                    <Link href="/catalogue">
                        <Button>Retour au catalogue</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const primaryPhoto = photos.find((photo) => photo.is_primary) || photos[0];
    const isFavorite = favoriteIds.has(cocktail.id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden">
            <div className="fixed top-24 left-8 z-50">
                <Link href="/catalogue">
                    <button className="p-4 bg-white border-4 border-brand-dark shadow-lg hover:scale-110 transition-all transform skewX(-5deg)">
                        <ArrowLeft className="w-6 h-6 transform skewX(5deg)" />
                    </button>
                </Link>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 py-12">
                {error && (
                    <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        {error}
                    </div>
                )}

                {favoriteError && (
                    <div className="mb-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800">
                        {favoriteError}
                    </div>
                )}

                {shareMessage && (
                    <div className="mb-8 p-4 bg-green-100 border-l-4 border-green-500 text-green-800">
                        {shareMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center min-h-[calc(100vh-200px)]">
                    <div className={`relative transition-all duration-1000 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
                        <div className="relative">
                            <div
                                className="relative w-full aspect-square border-8 border-brand-dark shadow-2xl transform -rotate-3 hover:rotate-0 transition-all duration-500 overflow-hidden"
                                style={{ backgroundColor: `${cocktail.color}40` }}
                            >
                                {primaryPhoto ? (
                                    <img
                                        src={primaryPhoto.url}
                                        alt={primaryPhoto.alt_text || cocktail.name}
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-[20rem] font-display opacity-20 select-none">
                                            {cocktail.name.substring(0, 1)}
                                        </div>
                                    </div>
                                )}

                                {!cocktail.alcohol && (
                                    <div className="absolute -top-6 -right-6 bg-green-400 text-brand-dark px-6 py-3 font-black text-xl border-4 border-brand-dark shadow-lg transform rotate-12 animate-wiggle">
                                        Sans alcool
                                    </div>
                                )}

                                <div className="absolute -bottom-6 -left-6 bg-brand-tertiary text-brand-dark px-6 py-3 font-black text-xl border-4 border-brand-dark shadow-lg transform -rotate-12">
                                    {cocktail.difficulty}
                                </div>
                            </div>

                            <div className="absolute -z-10 top-8 left-8 w-full h-full border-8 border-brand-secondary opacity-30" />
                            <div className="absolute -z-20 top-16 left-16 w-full h-full border-8 border-brand-primary opacity-20" />
                        </div>
                    </div>

                    <div className={`space-y-12 transition-all duration-1000 delay-300 ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
                        <div>
                            <div className="inline-block bg-brand-primary text-white px-4 py-2 font-bold text-sm mb-4 transform -rotate-2 border-2 border-brand-dark">
                                COCKTAIL
                            </div>
                            <h1 className="text-7xl md:text-8xl font-display leading-none mb-6 hover-bounce">
                                {cocktail.name}
                            </h1>
                            <p className="text-2xl text-gray-600 italic leading-relaxed border-l-8 border-brand-primary pl-6">
                                "{cocktail.description || 'Aucune description pour ce cocktail.'}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="card-skew bg-white p-6 text-center">
                                <div className="transform skewY(2deg)">
                                    <Clock className="w-10 h-10 text-brand-primary mx-auto mb-2" />
                                    <div className="text-3xl font-display mb-1">{cocktail.duration}</div>
                                    <div className="text-sm font-bold text-gray-500 uppercase">Preparation</div>
                                </div>
                            </div>
                            <div className="card-skew bg-white p-6 text-center">
                                <div className="transform skewY(2deg)">
                                    <Gauge className="w-10 h-10 text-brand-secondary mx-auto mb-2" />
                                    <div className="text-3xl font-display mb-1">{cocktail.difficulty}</div>
                                    <div className="text-sm font-bold text-gray-500 uppercase">Difficulte</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {cocktail.tags.length > 0 ? (
                                cocktail.tags.map((tag, index) => (
                                    <div
                                        key={tag}
                                        className="badge-skew !bg-gradient-to-r !from-purple-400 !to-pink-400 !text-white animate-bounce-in"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <span>{tag}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="badge-skew !bg-white !text-brand-dark">
                                    <span>Aucun tag renseigne</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <Button size="lg" className="flex-1" onClick={() => void handleFavoriteToggle()}>
                                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                                {isFavorite ? ' Retirer des favoris' : ' Ajouter aux favoris'}
                            </Button>
                            <Button variant="outline" size="lg" onClick={() => void handleShare()}>
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-40 grid grid-cols-1 lg:grid-cols-2 gap-24">
                    <div className={`card-skew bg-white p-10 ${mounted ? 'animate-slide-left' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
                        <div className="transform skewY(2deg)">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 border-4 border-brand-dark flex items-center justify-center transform -rotate-12">
                                    <ShoppingBag className="w-8 h-8 text-white transform rotate-12" />
                                </div>
                                <h2 className="text-5xl font-display">Ingredients</h2>
                            </div>

                            {cocktail.ingredients.length > 0 ? (
                                <div className="space-y-4">
                                    {cocktail.ingredients.map((ingredient, index) => (
                                        <div
                                            key={`${ingredient.name}-${index}`}
                                            className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-50 to-red-50 border-l-8 border-brand-primary hover:scale-105 transition-transform"
                                        >
                                            <span className="font-bold text-2xl">{ingredient.name}</span>
                                            <span className="font-mono bg-white border-4 border-brand-dark px-4 py-2 text-xl font-black transform skewX(-5deg)">
                                                <span className="transform skewX(5deg) inline-block">{ingredient.amount || 'QS'}</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic text-xl">Ingredients non listes pour ce cocktail.</p>
                            )}
                        </div>
                    </div>

                    <div className={`card-skew bg-gradient-to-br from-white to-purple-50 p-10 ${mounted ? 'animate-slide-right' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
                        <div className="transform skewY(2deg)">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 border-4 border-brand-dark flex items-center justify-center transform rotate-12">
                                    <ChefHat className="w-8 h-8 text-white transform -rotate-12" />
                                </div>
                                <h2 className="text-5xl font-display">Preparation</h2>
                            </div>

                            {cocktail.steps.length > 0 ? (
                                <div className="space-y-6 relative">
                                    <div className="absolute left-[23px] top-8 bottom-8 w-1 bg-gradient-to-b from-purple-400 to-pink-500" />

                                    {cocktail.steps.map((step, index) => (
                                        <div key={index} className="flex gap-5 relative z-10">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 border-4 border-brand-dark text-white flex items-center justify-center font-black text-xl flex-shrink-0 transform hover:scale-125 hover:rotate-12 transition-all">
                                                {index + 1}
                                            </div>
                                            <p className="pt-2 text-xl leading-relaxed text-gray-700 flex-1">
                                                {step}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic text-xl">Etapes non listees pour ce cocktail.</p>
                            )}

                            {cocktail.steps.length > 0 && (
                                <div className="mt-8 bg-green-50 border-4 border-green-300 p-6 text-center transform skewX(-2deg)">
                                    <div className="transform skewX(2deg)">
                                        <Sparkles className="w-10 h-10 text-green-600 mx-auto mb-2" />
                                        <p className="font-black text-2xl text-green-800">C'est pret. Sante.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-40">
                    <h2 className="text-5xl font-display text-center mb-12 hover-bounce">
                        Tu pourrais aussi <span className="text-brand-primary">aimer</span>
                    </h2>
                    {similarCocktails.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {similarCocktails.map((similar, index) => (
                                <Link key={similar.id} href={`/cocktail/${similar.id}`}>
                                    <div className={`card-skew bg-white p-6 hover:scale-105 transition-all cursor-pointer ${mounted ? 'animate-bounce-in' : 'opacity-0'}`} style={{ animationDelay: `${1 + index * 0.1}s` }}>
                                        <div className="transform skewY(2deg)">
                                            <div
                                                className="w-full h-48 mb-4 flex items-center justify-center border-4 border-brand-dark overflow-hidden"
                                                style={{ backgroundColor: `${similar.color || '#EF4444'}40` }}
                                            >
                                                {similar.image ? (
                                                    <img src={similar.image} alt={similar.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="font-display text-6xl opacity-20">{similar.name.substring(0, 1)}</span>
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-display mb-2">{similar.name}</h3>
                                            <p className="text-gray-600 line-clamp-2">{similar.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="card-skew bg-white p-10 text-center">
                            <div className="transform skewY(2deg)">
                                <p className="text-xl text-gray-600">Aucune suggestion disponible pour le moment.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
