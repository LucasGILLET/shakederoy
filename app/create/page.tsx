'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { useAuth } from '@/app/context/AuthContext';
import { apiFetch } from '@/app/lib/api';

type Step = 1 | 2 | 3 | 4;

interface Ingredient {
    name: string;
    amount: string;
}

interface CocktailStep {
    description: string;
}

interface CocktailStyle {
    id: string;
    name: string;
}

const DIFFICULTY_TO_LEVEL: Record<'Facile' | 'Moyen' | 'Difficile', number> = {
    Facile: 1,
    Moyen: 3,
    Difficile: 5,
};

function slugify(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function CreateCocktail() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState<'Facile' | 'Moyen' | 'Difficile'>('Facile');
    const [duration, setDuration] = useState('');
    const [alcohol, setAlcohol] = useState(true);
    const [primaryAlcohol, setPrimaryAlcohol] = useState('');
    const [styleId, setStyleId] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '' }]);
    const [steps, setSteps] = useState<CocktailStep[]>([{ description: '' }]);
    const [styles, setStyles] = useState<CocktailStyle[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, router, user]);

    useEffect(() => {
        const loadStyles = async () => {
            try {
                const data = await apiFetch<CocktailStyle[]>('/cocktails/styles');
                setStyles(data);
            } catch {
                setStyles([]);
            }
        };

        void loadStyles();
    }, []);

    const previewIngredients = useMemo(() => {
        const normalizedPrimaryAlcohol = primaryAlcohol.trim();
        const hasPrimaryAlcohol = ingredients.some(
            (ingredient) => ingredient.name.trim().toLowerCase() === normalizedPrimaryAlcohol.toLowerCase()
        );

        if (alcohol && normalizedPrimaryAlcohol && !hasPrimaryAlcohol) {
            return [{ name: normalizedPrimaryAlcohol, amount: '' }, ...ingredients];
        }

        return ingredients;
    }, [alcohol, ingredients, primaryAlcohol]);

    const addIngredient = () => {
        setIngredients([...ingredients, { name: '', amount: '' }]);
    };

    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, currentIndex) => currentIndex !== index));
    };

    const addStep = () => {
        setSteps([...steps, { description: '' }]);
    };

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, currentIndex) => currentIndex !== index));
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep((currentStep + 1) as Step);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as Step);
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const trimmedName = name.trim();
            const trimmedDescription = description.trim();
            const trimmedImageUrl = imageUrl.trim();
            const trimmedPrimaryAlcohol = primaryAlcohol.trim();

            if (!trimmedName || !trimmedDescription) {
                throw new Error('Le nom et la description sont requis.');
            }

            if (alcohol && !trimmedPrimaryAlcohol) {
                throw new Error("Renseigne l'alcool principal.");
            }

            const validIngredients = ingredients
                .map((ingredient) => ({
                    name: ingredient.name.trim(),
                    amount: ingredient.amount.trim(),
                }))
                .filter((ingredient) => ingredient.name);

            if (
                alcohol &&
                trimmedPrimaryAlcohol &&
                !validIngredients.some(
                    (ingredient) => ingredient.name.toLowerCase() === trimmedPrimaryAlcohol.toLowerCase()
                )
            ) {
                validIngredients.unshift({ name: trimmedPrimaryAlcohol, amount: '' });
            }

            const validSteps = steps
                .map((step) => step.description.trim())
                .filter(Boolean);

            if (validIngredients.length === 0) {
                throw new Error('Ajoute au moins un ingredient.');
            }

            if (validSteps.length === 0) {
                throw new Error('Ajoute au moins une etape.');
            }

            const prepTimeValue = Number.parseInt(duration.replace(/[^\d]/g, ''), 10);
            const createdCocktail = await apiFetch<{ id: string }>('/cocktails/create', {
                method: 'POST',
                body: JSON.stringify({
                    name: trimmedName,
                    slug: slugify(trimmedName),
                    description: trimmedDescription,
                    difficulty: DIFFICULTY_TO_LEVEL[difficulty],
                    prepTime: Number.isFinite(prepTimeValue) ? prepTimeValue : undefined,
                    intensity: alcohol ? 3 : 1,
                }),
            });

            await Promise.all(
                validIngredients.map((ingredient) =>
                    apiFetch(`/cocktails/${createdCocktail.id}/ingredients`, {
                        method: 'POST',
                        body: JSON.stringify({
                            ingredientName: ingredient.name,
                            quantity: ingredient.amount || undefined,
                        }),
                    })
                )
            );

            await Promise.all(
                validSteps.map((instruction, index) =>
                    apiFetch(`/cocktails/${createdCocktail.id}/steps`, {
                        method: 'POST',
                        body: JSON.stringify({
                            stepNumber: index + 1,
                            instruction,
                        }),
                    })
                )
            );

            if (trimmedImageUrl) {
                await apiFetch(`/cocktails/${createdCocktail.id}/photos`, {
                    method: 'POST',
                    body: JSON.stringify({
                        url: trimmedImageUrl,
                        altText: trimmedName,
                        isPrimary: true,
                    }),
                });
            }

            if (styleId) {
                await apiFetch(`/cocktails/${createdCocktail.id}/style-links`, {
                    method: 'POST',
                    body: JSON.stringify({ styleId }),
                });
            }

            router.push(`/my-cocktails`);
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la creation.');
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
                <div className="text-4xl font-display animate-bounce">Chargement...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12 animate-bounce-in">
                    <div className="text-7xl mb-4">+</div>
                    <h1 className="text-6xl font-display mb-4 hover-bounce">
                        Cree ton <span className="text-brand-primary">cocktail</span>
                    </h1>
                    <p className="text-xl text-gray-600">Formulaire complet Sprint 2.</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        {error}
                    </div>
                )}

                <div className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex flex-col items-center flex-1">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all transform ${
                                    currentStep >= step
                                        ? 'bg-gradient-to-br from-pink-400 to-purple-500 text-white scale-110 shadow-lg'
                                        : 'bg-gray-200 text-gray-400'
                                }`}>
                                    {step}
                                </div>
                                <span className={`text-sm mt-2 font-bold ${currentStep >= step ? 'text-brand-primary' : 'text-gray-400'}`}>
                                    {step === 1 && 'Infos'}
                                    {step === 2 && 'Ingredients'}
                                    {step === 3 && 'Etapes'}
                                    {step === 4 && 'Apercu'}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-500"
                            style={{ width: `${(currentStep / 4) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="card-skew bg-white p-8 mb-16">
                    <div className="transform skewY(2deg)">
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-slide-left">
                                <h2 className="text-3xl font-display mb-6">Les bases</h2>

                                <Input
                                    label="Nom du cocktail"
                                    placeholder="Ex: Mojito Royal"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-brand-dark">
                                        Description
                                    </label>
                                    <textarea
                                        className="w-full px-5 py-4 border-4 border-gray-300 focus:border-brand-primary focus:outline-none transition-all bg-white text-lg font-medium shadow-md transform skewX(-2deg) focus:skewX(0deg) min-h-[120px]"
                                        placeholder="Raconte-nous ton cocktail..."
                                        value={description}
                                        onChange={(event) => setDescription(event.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-brand-dark">
                                            Difficulte
                                        </label>
                                        <div className="flex gap-2">
                                            {(['Facile', 'Moyen', 'Difficile'] as const).map((level) => (
                                                <button
                                                    key={level}
                                                    type="button"
                                                    onClick={() => setDifficulty(level)}
                                                    className={`flex-1 py-3 px-4 font-bold border-4 transition-all transform skewX(-5deg) ${
                                                        difficulty === level
                                                            ? 'bg-brand-primary text-white border-brand-dark'
                                                            : 'bg-white text-gray-600 border-gray-300 hover:border-brand-primary'
                                                    }`}
                                                >
                                                    <span className="transform skewX(5deg) inline-block">{level}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Input
                                        label="Temps de preparation"
                                        placeholder="Ex: 5 min"
                                        value={duration}
                                        onChange={(event) => setDuration(event.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-brand-dark">
                                            Type
                                        </label>
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setAlcohol(true)}
                                                className={`flex-1 py-4 px-6 font-bold border-4 transition-all transform skewX(-5deg) ${
                                                    alcohol
                                                        ? 'bg-brand-secondary text-white border-brand-dark'
                                                        : 'bg-white text-gray-600 border-gray-300 hover:border-brand-secondary'
                                                }`}
                                            >
                                                <span className="transform skewX(5deg) inline-block">Avec alcool</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAlcohol(false)}
                                                className={`flex-1 py-4 px-6 font-bold border-4 transition-all transform skewX(-5deg) ${
                                                    !alcohol
                                                        ? 'bg-green-400 text-brand-dark border-brand-dark'
                                                        : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                                                }`}
                                            >
                                                <span className="transform skewX(5deg) inline-block">Sans alcool</span>
                                            </button>
                                        </div>
                                    </div>

                                    {alcohol && (
                                        <Input
                                            label="Alcool principal"
                                            placeholder="Ex: Rhum blanc"
                                            value={primaryAlcohol}
                                            onChange={(event) => setPrimaryAlcohol(event.target.value)}
                                        />
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-brand-dark">
                                            Style
                                        </label>
                                        <select
                                            value={styleId}
                                            onChange={(event) => setStyleId(event.target.value)}
                                            className="w-full px-5 py-4 border-4 border-gray-300 focus:border-brand-primary focus:outline-none transition-all bg-white text-lg font-medium shadow-md"
                                        >
                                            <option value="">Aucun style</option>
                                            {styles.map((style) => (
                                                <option key={style.id} value={style.id}>
                                                    {style.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <Input
                                        label="Image URL optionnelle"
                                        placeholder="https://..."
                                        value={imageUrl}
                                        onChange={(event) => setImageUrl(event.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6 animate-slide-left">
                                <h2 className="text-3xl font-display mb-6">Les ingredients</h2>

                                {ingredients.map((ingredient, index) => (
                                    <div key={index} className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <Input
                                                label={`Ingredient ${index + 1}`}
                                                placeholder="Ex: Citron vert"
                                                value={ingredient.name}
                                                onChange={(event) => {
                                                    const nextIngredients = [...ingredients];
                                                    nextIngredients[index].name = event.target.value;
                                                    setIngredients(nextIngredients);
                                                }}
                                            />
                                        </div>
                                        <div className="w-32">
                                            <Input
                                                label="Quantite"
                                                placeholder="4 cl"
                                                value={ingredient.amount}
                                                onChange={(event) => {
                                                    const nextIngredients = [...ingredients];
                                                    nextIngredients[index].amount = event.target.value;
                                                    setIngredients(nextIngredients);
                                                }}
                                            />
                                        </div>
                                        {ingredients.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeIngredient(index)}
                                                className="p-3 text-red-500 hover:bg-red-50 border-2 border-red-300 hover:border-red-500 transition-all mb-2"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <Button type="button" variant="outline" onClick={addIngredient} className="w-full">
                                    <Plus className="w-5 h-5" /> Ajouter un ingredient
                                </Button>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6 animate-slide-left">
                                <h2 className="text-3xl font-display mb-6">La preparation</h2>

                                {steps.map((step, index) => (
                                    <div key={index} className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0 mt-8">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-brand-dark">
                                                Etape {index + 1}
                                            </label>
                                            <textarea
                                                className="w-full px-5 py-4 border-4 border-gray-300 focus:border-brand-primary focus:outline-none transition-all bg-white text-lg font-medium shadow-md transform skewX(-2deg) focus:skewX(0deg) min-h-[100px]"
                                                placeholder="Decris cette etape..."
                                                value={step.description}
                                                onChange={(event) => {
                                                    const nextSteps = [...steps];
                                                    nextSteps[index].description = event.target.value;
                                                    setSteps(nextSteps);
                                                }}
                                            />
                                        </div>
                                        {steps.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeStep(index)}
                                                className="p-3 text-red-500 hover:bg-red-50 border-2 border-red-300 hover:border-red-500 transition-all mt-8"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <Button type="button" variant="outline" onClick={addStep} className="w-full">
                                    <Plus className="w-5 h-5" /> Ajouter une etape
                                </Button>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-6 animate-bounce-in">
                                <h2 className="text-3xl font-display mb-6">Apercu final</h2>

                                <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-8 border-4 border-brand-primary">
                                    <div className="text-center mb-6">
                                        <div className="text-7xl mb-4">{name ? name[0].toUpperCase() : 'C'}</div>
                                        <h3 className="text-4xl font-display mb-2">{name || 'Nom du cocktail'}</h3>
                                        <p className="text-lg text-gray-600 italic">{description || 'Description...'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white p-4 text-center border-2 border-brand-dark">
                                            <div className="font-bold text-sm text-gray-500 mb-1">DIFFICULTE</div>
                                            <div className="text-xl font-display">{difficulty}</div>
                                        </div>
                                        <div className="bg-white p-4 text-center border-2 border-brand-dark">
                                            <div className="font-bold text-sm text-gray-500 mb-1">TEMPS</div>
                                            <div className="text-xl font-display">{duration || 'N/A'}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white p-4 border-2 border-brand-dark">
                                            <div className="font-bold text-sm text-gray-500 mb-1">STYLE</div>
                                            <div className="text-lg font-display">
                                                {styles.find((style) => style.id === styleId)?.name || 'Aucun style'}
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 border-2 border-brand-dark">
                                            <div className="font-bold text-sm text-gray-500 mb-1">ALCOOL PRINCIPAL</div>
                                            <div className="text-lg font-display">{primaryAlcohol || 'Sans alcool'}</div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 mb-4 border-2 border-brand-dark">
                                        <h4 className="font-display text-xl mb-4">Ingredients</h4>
                                        <ul className="space-y-2">
                                            {previewIngredients.map((ingredient, index) => (
                                                <li key={index} className="flex justify-between">
                                                    <span className="font-bold">{ingredient.name || '...'}</span>
                                                    <span className="text-gray-600">{ingredient.amount || '...'}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-white p-6 border-2 border-brand-dark">
                                        <h4 className="font-display text-xl mb-4">Preparation</h4>
                                        <ol className="space-y-3">
                                            {steps.map((step, index) => (
                                                <li key={index} className="flex gap-3">
                                                    <span className="font-bold text-brand-primary">{index + 1}.</span>
                                                    <span>{step.description || '...'}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border-4 border-yellow-300 p-6 text-center">
                                    <Sparkles className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                                    <p className="font-bold text-lg">Ton cocktail sera cree en pending puis visible apres validation admin.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    {currentStep > 1 ? (
                        <Button variant="outline" onClick={prevStep}>
                            <ArrowLeft className="w-5 h-5" /> Retour
                        </Button>
                    ) : (
                        <Link href="/catalogue">
                            <Button variant="outline">
                                <ArrowLeft className="w-5 h-5" /> Annuler
                            </Button>
                        </Link>
                    )}

                    {currentStep < 4 ? (
                        <Button onClick={nextStep}>
                            Suivant <ArrowRight className="w-5 h-5" />
                        </Button>
                    ) : (
                        <Button
                            className="!bg-gradient-to-r !from-green-400 !to-emerald-500"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span>Publication...</span>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" /> Publier
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
