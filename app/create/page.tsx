'use client';

import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { useState } from 'react';
import { Plus, Trash2, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

type Step = 1 | 2 | 3 | 4;

interface Ingredient {
    name: string;
    amount: string;
}

interface CocktailStep {
    description: string;
}

export default function CreateCocktail() {
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState<'Facile' | 'Moyen' | 'Difficile'>('Facile');
    const [duration, setDuration] = useState('');
    const [alcohol, setAlcohol] = useState(true);
    const [tags, setTags] = useState<string[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '' }]);
    const [steps, setSteps] = useState<CocktailStep[]>([{ description: '' }]);

    const addIngredient = () => {
        setIngredients([...ingredients, { name: '', amount: '' }]);
    };

    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const addStep = () => {
        setSteps([...steps, { description: '' }]);
    };

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep((currentStep + 1) as Step);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep((currentStep - 1) as Step);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12 animate-bounce-in">
                    <div className="text-7xl mb-4">🧪</div>
                    <h1 className="text-6xl font-display mb-4 hover-bounce">
                        Crée ton <span className="text-brand-primary">Cocktail</span>
                    </h1>
                    <p className="text-xl text-gray-600">Partage ta recette avec la communauté !</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex flex-col items-center flex-1">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all transform ${currentStep >= step
                                    ? 'bg-gradient-to-br from-pink-400 to-purple-500 text-white scale-110 shadow-lg'
                                    : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    {step}
                                </div>
                                <span className={`text-sm mt-2 font-bold ${currentStep >= step ? 'text-brand-primary' : 'text-gray-400'}`}>
                                    {step === 1 && 'Infos'}
                                    {step === 2 && 'Ingrédients'}
                                    {step === 3 && 'Étapes'}
                                    {step === 4 && 'Aperçu'}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-500"
                            style={{ width: `${(currentStep / 4) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Form Steps */}
                <div className="card-skew bg-white p-8 mb-16">
                    <div className="transform skewY(2deg)">
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-slide-left">
                                <h2 className="text-3xl font-display mb-6">Les bases 🎯</h2>

                                <Input
                                    label="Nom du cocktail"
                                    placeholder="Ex: Mojito Royal"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
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
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-brand-dark">
                                            Difficulté
                                        </label>
                                        <div className="flex gap-2">
                                            {(['Facile', 'Moyen', 'Difficile'] as const).map((level) => (
                                                <button
                                                    key={level}
                                                    type="button"
                                                    onClick={() => setDifficulty(level)}
                                                    className={`flex-1 py-3 px-4 font-bold border-4 transition-all transform skewX(-5deg) ${difficulty === level
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
                                        label="Temps de préparation"
                                        placeholder="Ex: 5 min"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-brand-dark">
                                        Type
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setAlcohol(true)}
                                            className={`flex-1 py-4 px-6 font-bold border-4 transition-all transform skewX(-5deg) ${alcohol
                                                ? 'bg-brand-secondary text-white border-brand-dark'
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-brand-secondary'
                                                }`}
                                        >
                                            <span className="transform skewX(5deg) inline-block">🍸 Avec alcool</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAlcohol(false)}
                                            className={`flex-1 py-4 px-6 font-bold border-4 transition-all transform skewX(-5deg) ${!alcohol
                                                ? 'bg-green-400 text-brand-dark border-brand-dark'
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                                                }`}
                                        >
                                            <span className="transform skewX(5deg) inline-block">🥤 Sans alcool</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Ingredients */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-slide-left">
                                <h2 className="text-3xl font-display mb-6">Les ingrédients 🥃</h2>

                                {ingredients.map((ingredient, index) => (
                                    <div key={index} className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <Input
                                                label={`Ingrédient ${index + 1}`}
                                                placeholder="Ex: Rhum blanc"
                                                value={ingredient.name}
                                                onChange={(e) => {
                                                    const newIngredients = [...ingredients];
                                                    newIngredients[index].name = e.target.value;
                                                    setIngredients(newIngredients);
                                                }}
                                            />
                                        </div>
                                        <div className="w-32">
                                            <Input
                                                label="Quantité"
                                                placeholder="4cl"
                                                value={ingredient.amount}
                                                onChange={(e) => {
                                                    const newIngredients = [...ingredients];
                                                    newIngredients[index].amount = e.target.value;
                                                    setIngredients(newIngredients);
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

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addIngredient}
                                    className="w-full"
                                >
                                    <Plus className="w-5 h-5" /> Ajouter un ingrédient
                                </Button>
                            </div>
                        )}

                        {/* Step 3: Steps */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-slide-left">
                                <h2 className="text-3xl font-display mb-6">La préparation 👨‍🍳</h2>

                                {steps.map((step, index) => (
                                    <div key={index} className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0 mt-8">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-brand-dark">
                                                Étape {index + 1}
                                            </label>
                                            <textarea
                                                className="w-full px-5 py-4 border-4 border-gray-300 focus:border-brand-primary focus:outline-none transition-all bg-white text-lg font-medium shadow-md transform skewX(-2deg) focus:skewX(0deg) min-h-[100px]"
                                                placeholder="Décris cette étape..."
                                                value={step.description}
                                                onChange={(e) => {
                                                    const newSteps = [...steps];
                                                    newSteps[index].description = e.target.value;
                                                    setSteps(newSteps);
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

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addStep}
                                    className="w-full"
                                >
                                    <Plus className="w-5 h-5" /> Ajouter une étape
                                </Button>
                            </div>
                        )}

                        {/* Step 4: Preview */}
                        {currentStep === 4 && (
                            <div className="space-y-6 animate-bounce-in">
                                <h2 className="text-3xl font-display mb-6">Aperçu final 🎉</h2>

                                <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-8 border-4 border-brand-primary">
                                    <div className="text-center mb-6">
                                        <div className="text-7xl mb-4">🍹</div>
                                        <h3 className="text-4xl font-display mb-2">{name || 'Nom du cocktail'}</h3>
                                        <p className="text-lg text-gray-600 italic">{description || 'Description...'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white p-4 text-center border-2 border-brand-dark">
                                            <div className="font-bold text-sm text-gray-500 mb-1">DIFFICULTÉ</div>
                                            <div className="text-xl font-display">{difficulty}</div>
                                        </div>
                                        <div className="bg-white p-4 text-center border-2 border-brand-dark">
                                            <div className="font-bold text-sm text-gray-500 mb-1">TEMPS</div>
                                            <div className="text-xl font-display">{duration || 'N/A'}</div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 mb-4 border-2 border-brand-dark">
                                        <h4 className="font-display text-xl mb-4">Ingrédients</h4>
                                        <ul className="space-y-2">
                                            {ingredients.map((ing, idx) => (
                                                <li key={idx} className="flex justify-between">
                                                    <span className="font-bold">{ing.name || '...'}</span>
                                                    <span className="text-gray-600">{ing.amount || '...'}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-white p-6 border-2 border-brand-dark">
                                        <h4 className="font-display text-xl mb-4">Préparation</h4>
                                        <ol className="space-y-3">
                                            {steps.map((step, idx) => (
                                                <li key={idx} className="flex gap-3">
                                                    <span className="font-bold text-brand-primary">{idx + 1}.</span>
                                                    <span>{step.description || '...'}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border-4 border-yellow-300 p-6 text-center">
                                    <Sparkles className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                                    <p className="font-bold text-lg">Ton cocktail est prêt à être partagé !</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Buttons */}
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
                        <Button className="!bg-gradient-to-r !from-green-400 !to-emerald-500">
                            <Check className="w-5 h-5" /> Publier !
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
