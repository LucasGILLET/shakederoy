'use client';

import { Button } from '@/app/components/Button';
import { useAuth } from '@/app/context/AuthContext';
import {
  addParticipantStyle,
  generatePartyRecommendations,
  getPartyBarmanView,
  getPartyIngredients,
  getPartySessionById,
  joinPartySession,
  listCocktailStyles,
  listParticipantStyles,
  listPartyParticipants,
  listPartySelections,
  PartyParticipant,
  PartyParticipantStyle,
  removeParticipantStyle,
  updatePartyParticipant,
  type AggregatedIngredient,
  type BarmanView,
  type CocktailStyle,
  type PartySession,
  type ScoredCocktail,
} from '@/app/lib/partyApi';
import { ChefHat, Copy, RefreshCw, ShoppingCart, Sparkles, Users } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type StylesMap = Record<string, PartyParticipantStyle[]>;
type DraftsMap = Record<
  string,
  { guestName: string; alcohol: 'unset' | 'yes' | 'no'; maxIntensity: string; styleIds: string[] }
>;

const getParticipantName = (participant: PartyParticipant, userId?: string) =>
  participant.guest_name?.trim() ||
  (participant.user_id === userId ? 'Toi' : `Participant ${participant.id.slice(0, 8)}`);

const getDifficultyLabel = (difficulty: string | null) =>
  difficulty === 'easy' ? 'Facile' : difficulty === 'medium' ? 'Intermediaire' : difficulty === 'hard' ? 'Technique' : 'Non renseignee';

const formatQuantity = (quantity: string | null, unit: string | null) =>
  [quantity, unit].filter(Boolean).join(' ') || 'Quantite non renseignee';

export default function PartySessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [session, setSession] = useState<PartySession | null>(null);
  const [participants, setParticipants] = useState<PartyParticipant[]>([]);
  const [participantStyles, setParticipantStyles] = useState<StylesMap>({});
  const [styles, setStyles] = useState<CocktailStyle[]>([]);
  const [drafts, setDrafts] = useState<DraftsMap>({});
  const [ingredients, setIngredients] = useState<AggregatedIngredient[]>([]);
  const [barmanView, setBarmanView] = useState<BarmanView>({ cocktails: [], shopping_list: [] });
  const [generated, setGenerated] = useState<ScoredCocktail[]>([]);
  const [selectionsCount, setSelectionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [copied, setCopied] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const currentParticipant = participants.find((participant) => participant.user_id === user?.id);
  const hasGeneratedData = useMemo(
    () => generated.length > 0 || barmanView.cocktails.length > 0,
    [barmanView.cocktails.length, generated.length]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadParty() {
      setLoading(true);
      setError('');

      try {
        const [loadedSession, loadedParticipants, loadedStyles, loadedSelections] = await Promise.all([
          getPartySessionById(sessionId),
          listPartyParticipants(sessionId),
          listCocktailStyles(),
          listPartySelections(sessionId),
        ]);

        const styleEntries = await Promise.all(
          loadedParticipants.map(async (participant) => [participant.id, await listParticipantStyles(participant.id)] as const)
        );

        let loadedIngredients: AggregatedIngredient[] = [];
        let loadedBarmanView: BarmanView = { cocktails: [], shopping_list: [] };

        try {
          [loadedIngredients, loadedBarmanView] = await Promise.all([
            getPartyIngredients(sessionId),
            getPartyBarmanView(sessionId),
          ]);
        } catch {
          loadedIngredients = [];
          loadedBarmanView = { cocktails: [], shopping_list: [] };
        }

        if (cancelled) return;

        const nextStyles = Object.fromEntries(styleEntries);
        const nextDrafts = Object.fromEntries(
          loadedParticipants.map((participant) => [
            participant.id,
            {
              guestName: participant.guest_name ?? '',
              alcohol:
                participant.prefers_alcoholic === true
                  ? 'yes'
                  : participant.prefers_alcoholic === false
                    ? 'no'
                    : 'unset',
              maxIntensity: participant.max_intensity?.toString() ?? '',
              styleIds: (nextStyles[participant.id] ?? []).map((style) => style.style_id),
            },
          ])
        ) as DraftsMap;

        setSession(loadedSession);
        setParticipants(loadedParticipants);
        setParticipantStyles(nextStyles);
        setStyles(loadedStyles);
        setDrafts(nextDrafts);
        setSelectionsCount(loadedSelections.length);
        setIngredients(loadedIngredients);
        setBarmanView(loadedBarmanView);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Chargement impossible.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadParty();
    return () => {
      cancelled = true;
    };
  }, [refreshToken, sessionId]);

  function refresh() {
    setRefreshToken((value) => value + 1);
  }

  function updateDraft(participantId: string, patch: Partial<DraftsMap[string]>) {
    setDrafts((current) => ({ ...current, [participantId]: { ...current[participantId], ...patch } }));
  }

  async function saveParticipant(participant: PartyParticipant) {
    if (!user) return;
    const draft = drafts[participant.id];
    if (!draft) return;

    setSavingId(participant.id);
    setActionError('');

    try {
      await updatePartyParticipant(participant.id, {
        guestName: draft.guestName.trim() || undefined,
        prefersAlcoholic: draft.alcohol === 'unset' ? undefined : draft.alcohol === 'yes',
        maxIntensity:
          draft.alcohol === 'no'
            ? undefined
            : draft.maxIntensity
              ? Number(draft.maxIntensity)
              : undefined,
      });

      const currentStyleIds = new Set((participantStyles[participant.id] ?? []).map((style) => style.style_id));
      const toAdd = draft.styleIds.filter((styleId) => !currentStyleIds.has(styleId));
      const toRemove = (participantStyles[participant.id] ?? []).filter((style) => !draft.styleIds.includes(style.style_id));

      await Promise.all(toAdd.map((styleId) => addParticipantStyle(participant.id, styleId)));
      await Promise.all(toRemove.map((style) => removeParticipantStyle(style.id)));

      refresh();
    } catch (saveError) {
      setActionError(saveError instanceof Error ? saveError.message : 'Sauvegarde impossible.');
    } finally {
      setSavingId('');
    }
  }

  async function handleJoin() {
    if (!user) return;
    setActionError('');
    try {
      await joinPartySession(sessionId, { userId: user.id, guestName: user.username });
      refresh();
    } catch (joinError) {
      setActionError(joinError instanceof Error ? joinError.message : 'Jonction impossible.');
    }
  }

  async function handleGenerate() {
    if (!user) return;
    setActionError('');
    try {
      setGenerated(
        await generatePartyRecommendations(sessionId, Math.max(participants.length, 1))
      );
      refresh();
    } catch (generationError) {
      setActionError(generationError instanceof Error ? generationError.message : 'Generation impossible.');
    }
  }

  async function copyCode() {
    if (!session) return;
    await navigator.clipboard.writeText(session.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  if (loading || authLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-12">Chargement de la soiree...</div>;
  }

  if (error || !session) {
    return <div className="mx-auto max-w-4xl px-4 py-12">{error || 'Session introuvable.'}</div>;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#fff7ed,_#ffffff_45%,_#eff6ff)] py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
        <section className="rounded-[2rem] border-4 border-brand-dark bg-white p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="font-display text-4xl text-brand-dark">{session.name || 'Soiree sans nom'}</h1>
              <p className="mt-2 text-slate-600">
                Code {session.code} · mode {session.mode} · {participants.length} participant(s)
              </p>
              {searchParams.get('created') === '1' ? <p className="mt-2 text-emerald-700">Session créée.</p> : null}
              {searchParams.get('joined') === '1' ? <p className="mt-2 text-sky-700">Session rejointe.</p> : null}
            </div>
            <Button className="justify-center" onClick={copyCode} type="button" variant="outline">
              {copied ? 'Copie' : 'Copier le code'} <Copy className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {!currentParticipant ? (
          <section className="rounded-[2rem] border-4 border-brand-dark bg-white p-6">
            <p className="mb-4 text-slate-700">Ton compte n'est pas encore dans la liste des participants.</p>
            <Button disabled={!user} onClick={handleJoin} type="button">
              Rejoindre cette session
            </Button>
          </section>
        ) : null}

        {actionError ? <p className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-red-700">{actionError}</p> : null}

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border-4 border-brand-dark bg-white p-8">
            <div className="mb-6 flex items-center gap-3">
              <Users className="h-6 w-6 text-brand-primary" />
              <h2 className="font-display text-3xl text-brand-dark">Participants et preferences</h2>
            </div>

            <div className="space-y-6">
              {participants.map((participant) => {
                const draft = drafts[participant.id];
                if (!draft) return null;
                const isNonAlcoholicOnly = draft.alcohol === 'no';

                return (
                  <article className="rounded-2xl border-2 border-slate-200 p-5" key={participant.id}>
                    <div className="mb-4">
                      <h3 className="font-display text-2xl text-brand-dark">
                        {getParticipantName(participant, user?.id)}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {participant.prefers_alcoholic === null ? 'Sans preference' : participant.prefers_alcoholic ? 'Avec alcool' : 'Sans alcool'}
                        {' · '}
                        intensite max {participant.max_intensity ?? 'non renseignee'}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        className="rounded-2xl border-2 border-slate-300 px-4 py-3"
                        value={draft.guestName}
                        onChange={(event) => updateDraft(participant.id, { guestName: event.target.value })}
                      />
                      <select
                        className="rounded-2xl border-2 border-slate-300 px-4 py-3"
                        value={draft.alcohol}
                        onChange={(event) => {
                          const alcohol = event.target.value as DraftsMap[string]['alcohol'];
                          updateDraft(participant.id, {
                            alcohol,
                            maxIntensity: alcohol === 'no' ? '' : draft.maxIntensity,
                          });
                        }}
                      >
                        <option value="unset">Aucune contrainte alcool</option>
                        <option value="yes">Avec alcool</option>
                        <option value="no">Sans alcool</option>
                      </select>
                      <select
                        className="rounded-2xl border-2 border-slate-300 px-4 py-3"
                        value={draft.maxIntensity}
                        disabled={isNonAlcoholicOnly}
                        onChange={(event) => updateDraft(participant.id, { maxIntensity: event.target.value })}
                      >
                        <option value="">Intensite non renseignee</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                      <Button disabled={!user || savingId === participant.id} onClick={() => void saveParticipant(participant)} type="button">
                        {savingId === participant.id ? 'Sauvegarde...' : 'Enregistrer'}
                      </Button>
                    </div>

                    {isNonAlcoholicOnly ? (
                      <p className="mt-3 text-sm text-slate-500">
                        Intensite desactivee: ce participant a choisi uniquement des cocktails sans alcool.
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {styles.map((style) => {
                        const selected = draft.styleIds.includes(style.id);
                        return (
                          <button
                            className={`rounded-full border-2 px-3 py-2 text-sm ${selected ? 'border-brand-primary bg-brand-primary text-white' : 'border-slate-300 bg-white text-slate-700'}`}
                            key={style.id}
                            onClick={() =>
                              updateDraft(participant.id, {
                                styleIds: selected
                                  ? draft.styleIds.filter((styleId) => styleId !== style.id)
                                  : [...draft.styleIds, style.id],
                              })
                            }
                            type="button"
                          >
                            {style.name}
                          </button>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="space-y-8">
            <section className="rounded-[2rem] border-4 border-brand-dark bg-white p-8">
              <div className="mb-4 flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-pink-600" />
                <h2 className="font-display text-3xl text-brand-dark">Generation</h2>
              </div>
              <p className="mb-4 text-sm text-slate-600">
                {participants.length} participants · {selectionsCount} selections stockees
              </p>
              <Button className="w-full justify-center" disabled={!user || participants.length === 0} onClick={handleGenerate} type="button">
                Generer les cocktails <RefreshCw className="h-4 w-4" />
              </Button>
            </section>

            <section className="rounded-[2rem] border-4 border-brand-dark bg-white p-8">
              <div className="mb-4 flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-lime-600" />
                <h2 className="font-display text-3xl text-brand-dark">Ingredients agreges</h2>
              </div>
              <div className="space-y-3">
                {ingredients.length === 0 ? (
                  <p className="text-slate-600">Aucune liste de courses disponible.</p>
                ) : (
                  ingredients.map((ingredient) => (
                    <article className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4" key={ingredient.ingredient_id}>
                      <div className="font-semibold text-brand-dark">{ingredient.name}</div>
                      <div className="text-sm text-slate-500">
                        {ingredient.category} · {ingredient.cocktail_count} cocktail(s)
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {ingredient.quantities.map((quantity) => (
                          <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700" key={`${ingredient.ingredient_id}-${quantity.cocktail}-${quantity.quantity}-${quantity.unit}`}>
                            {quantity.cocktail}: {formatQuantity(quantity.quantity, quantity.unit)}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </section>

        <section className="rounded-[2rem] border-4 border-brand-dark bg-white p-8">
          <div className="mb-4 flex items-center gap-3">
            <ChefHat className="h-6 w-6 text-sky-600" />
            <h2 className="font-display text-3xl text-brand-dark">Cocktails retenus</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {(generated.length > 0
              ? generated.map((cocktail) => ({
                  id: cocktail.cocktail_id,
                  name: cocktail.name,
                  description: cocktail.description,
                  difficulty: cocktail.difficulty,
                  prepTime: cocktail.prep_time,
                  score: cocktail.score,
                }))
              : barmanView.cocktails.map((cocktail) => ({
                  id: cocktail.id,
                  name: cocktail.name,
                  description: cocktail.description,
                  difficulty: cocktail.difficulty,
                  prepTime: cocktail.prep_time,
                  score: null,
                }))).map((cocktail) => (
              <article className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-5" key={cocktail.id}>
                <h3 className="font-display text-2xl text-brand-dark">{cocktail.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{cocktail.description || 'Aucune description fournie.'}</p>
                <p className="mt-3 text-sm text-slate-500">
                  {getDifficultyLabel(cocktail.difficulty)} · {cocktail.prepTime ? `${cocktail.prepTime} min` : 'Temps non renseigne'}
                  {cocktail.score !== null ? ` · score ${cocktail.score.toFixed(1)}` : ''}
                </p>
              </article>
            ))}
            {!hasGeneratedData ? <p className="text-slate-600">Aucun cocktail genere.</p> : null}
          </div>
        </section>

        <section className="rounded-[2rem] border-4 border-brand-dark bg-slate-900 p-8 text-white">
          <div className="mb-4 flex items-center gap-3">
            <ChefHat className="h-6 w-6" />
            <h2 className="font-display text-3xl">Mode barman</h2>
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-4">
              {barmanView.cocktails.length === 0 ? (
                <p className="text-white/70">Aucune preparation disponible.</p>
              ) : (
                barmanView.cocktails.map((cocktail) => (
                  <article className="rounded-2xl border border-white/10 bg-white/5 p-5" key={cocktail.id}>
                    <h3 className="font-display text-2xl">{cocktail.name}</h3>
                    <p className="mt-2 text-sm text-white/70">
                      {getDifficultyLabel(cocktail.difficulty)} · {cocktail.prep_time ? `${cocktail.prep_time} min` : 'Temps non renseigne'}
                    </p>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div>
                        <div className="mb-2 text-sm font-bold uppercase tracking-wide text-white/60">Ingredients</div>
                        {cocktail.ingredients.map((ingredient) => (
                          <div className="rounded-xl bg-white/10 px-3 py-2 text-sm" key={`${cocktail.id}-${ingredient.name}-${ingredient.quantity}`}>
                            {ingredient.name} · {formatQuantity(ingredient.quantity, ingredient.unit)}
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="mb-2 text-sm font-bold uppercase tracking-wide text-white/60">Etapes</div>
                        {cocktail.steps.length === 0 ? (
                          <div className="rounded-xl bg-white/10 px-3 py-2 text-sm">Aucune etape.</div>
                        ) : (
                          cocktail.steps.map((step) => (
                            <div className="rounded-xl bg-white/10 px-3 py-2 text-sm" key={`${cocktail.id}-${step.step_number}`}>
                              {step.step_number}. {step.instruction}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            <aside className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 text-sm font-bold uppercase tracking-wide text-white/60">Shopping list barman</div>
              <div className="space-y-3">
                {barmanView.shopping_list.map((item) => (
                  <div className="rounded-xl bg-white/10 px-3 py-2 text-sm" key={item.ingredient_id}>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-white/70">{item.category} · {item.cocktail_count} cocktail(s)</div>
                  </div>
                ))}
                {barmanView.shopping_list.length === 0 ? <p className="text-white/70">Aucune donnee barman.</p> : null}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
