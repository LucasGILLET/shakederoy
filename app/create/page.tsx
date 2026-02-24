'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { apiFetch } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import type { CocktailDetailsModel } from '@/app/lib/types';

interface IngredientInput {
  name: string;
  amount: string;
}

export default function CreateCocktailPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'Facile' | 'Moyen' | 'Difficile'>('Facile');
  const [prepTime, setPrepTime] = useState('5');
  const [styles, setStyles] = useState('Classique');
  const [ingredients, setIngredients] = useState<IngredientInput[]>([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const canSubmit = useMemo(() => {
    const hasIngredients = ingredients.some((item) => item.name.trim() && item.amount.trim());
    const hasSteps = steps.some((item) => item.trim());
    return name.trim().length >= 3 && description.trim().length >= 5 && hasIngredients && hasSteps;
  }, [name, description, ingredients, steps]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('difficulty', difficulty);
      formData.append('prepTime', prepTime);
      formData.append(
        'styles',
        JSON.stringify(
          styles
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean)
        )
      );
      formData.append(
        'ingredients',
        JSON.stringify(
          ingredients
            .map((item) => ({ name: item.name.trim(), amount: item.amount.trim() }))
            .filter((item) => item.name && item.amount)
        )
      );
      formData.append(
        'steps',
        JSON.stringify(
          steps
            .map((value) => ({ description: value.trim() }))
            .filter((item) => item.description)
        )
      );

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const created = await apiFetch<CocktailDetailsModel>('/cocktails/create', {
        method: 'POST',
        body: formData,
      });

      router.push(`/cocktail/${created.id}`);
      router.refresh();
    } catch (submitError: any) {
      setError(submitError.message || 'Erreur lors de la creation du cocktail');
      setSubmitting(false);
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
        <div className="text-center mb-10">
          <h1 className="text-6xl font-display mb-3">Creer un cocktail</h1>
          <p className="text-lg text-gray-600">Formulaire branche au backend (ingredients, etapes, image).</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">{error}</div>
        )}

        <form onSubmit={onSubmit} className="card-skew bg-white p-8 space-y-8">
          <div className="transform skewY(2deg) space-y-6">
            <Input
              label="Nom du cocktail"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-brand-dark">
                Description
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full px-5 py-4 border-4 border-gray-300 focus:border-brand-primary focus:outline-none transition-all bg-white text-lg font-medium shadow-md min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-brand-dark">
                  Difficulte
                </label>
                <select
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value as 'Facile' | 'Moyen' | 'Difficile')}
                  className="w-full px-4 py-3 border-4 border-gray-300 bg-white font-bold"
                >
                  <option value="Facile">Facile</option>
                  <option value="Moyen">Moyen</option>
                  <option value="Difficile">Difficile</option>
                </select>
              </div>

              <Input
                label="Temps (min)"
                value={prepTime}
                onChange={(event) => setPrepTime(event.target.value)}
              />

              <Input
                label="Styles (comma separated)"
                value={styles}
                onChange={(event) => setStyles(event.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-brand-dark">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                className="w-full px-4 py-3 border-4 border-gray-300 bg-white"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display">Ingredients</h2>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIngredients((prev) => [...prev, { name: '', amount: '' }])}
                >
                  Ajouter
                </Button>
              </div>
              {ingredients.map((ingredient, index) => (
                <div key={`ingredient-${index}`} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <input
                    value={ingredient.name}
                    onChange={(event) =>
                      setIngredients((prev) =>
                        prev.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, name: event.target.value } : item
                        )
                      )
                    }
                    placeholder="Ingredient"
                    className="md:col-span-3 px-4 py-3 border-2 border-gray-300"
                  />
                  <input
                    value={ingredient.amount}
                    onChange={(event) =>
                      setIngredients((prev) =>
                        prev.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, amount: event.target.value } : item
                        )
                      )
                    }
                    placeholder="4 cl"
                    className="md:col-span-1 px-4 py-3 border-2 border-gray-300"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setIngredients((prev) => (prev.length > 1 ? prev.filter((_, itemIndex) => itemIndex !== index) : prev))
                    }
                  >
                    Retirer
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display">Etapes</h2>
                <Button type="button" variant="outline" onClick={() => setSteps((prev) => [...prev, ''])}>
                  Ajouter
                </Button>
              </div>
              {steps.map((step, index) => (
                <div key={`step-${index}`} className="flex gap-3">
                  <textarea
                    value={step}
                    onChange={(event) =>
                      setSteps((prev) =>
                        prev.map((item, itemIndex) => (itemIndex === index ? event.target.value : item))
                      )
                    }
                    placeholder={`Etape ${index + 1}`}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 min-h-[80px]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSteps((prev) => (prev.length > 1 ? prev.filter((_, itemIndex) => itemIndex !== index) : prev))}
                  >
                    Retirer
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Link href="/catalogue">
                <Button variant="outline" type="button">Annuler</Button>
              </Link>
              <Button type="submit" disabled={!canSubmit || submitting}>
                {submitting ? 'Publication...' : 'Publier'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
