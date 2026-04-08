'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Heart, MapPin, MessageSquare, Search, Star } from 'lucide-react';
import { apiFetch, apiFetchList } from '../lib/api';
import { extractFavoriteIds, mapRawCocktail, type RawCocktail } from '../catalogue/catalogueFilters';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { fetchFavoritesPage, toggleFavorite } from '../lib/favoritesApi';
import { InteractiveBarMap } from './InteractiveBarMap';

type BarListItem = {
    id: string;
    name: string;
    city?: string | null;
    country?: string | null;
    address?: string | null;
    style?: string | null;
    description?: string | null;
    owner_username?: string | null;
    photo_url?: string | null;
    likes_count?: number;
    average_rating?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    website?: string | null;
};

type BarReview = {
    id: string;
    user_id: string;
    rating: number;
    comment?: string | null;
    created_at?: string;
};

type BarDetail = BarListItem & {
    photos: Array<{ id: string; url: string; alt_text?: string | null; is_primary: boolean }>;
    signature_cocktails: Array<{ id: string; cocktail_id: string; cocktail_name?: string | null; price?: string | null; currency?: string | null; is_available: boolean }>;
    liked?: boolean | null;
};

type MappedCocktail = ReturnType<typeof mapRawCocktail> & { price?: string | null; currency?: string | null; isAvailable: boolean };

function locationLabel(bar: Pick<BarListItem, 'address' | 'city' | 'country'>) {
    return [bar.address, bar.city, bar.country].filter(Boolean).join(', ') || 'Adresse non renseignee';
}

export default function BarsPage() {
    const { user } = useAuth();
    const [bars, setBars] = useState<BarListItem[]>([]);
    const [selectedBarId, setSelectedBarId] = useState('');
    const [selectedBar, setSelectedBar] = useState<BarDetail | null>(null);
    const [signatureCocktails, setSignatureCocktails] = useState<MappedCocktail[]>([]);
    const [reviews, setReviews] = useState<BarReview[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [search, setSearch] = useState('');
    const [styleFilter, setStyleFilter] = useState('all');
    const [cityFilter, setCityFilter] = useState('all');
    const [minRating, setMinRating] = useState('all');
    const [reviewForm, setReviewForm] = useState({ rating: '5', comment: '' });

    const loadBars = async () => {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (styleFilter !== 'all') params.set('style', styleFilter);
        if (cityFilter !== 'all') params.set('city', cityFilter);

        const barsData = await apiFetchList<BarListItem>(`/bars${params.toString() ? `?${params.toString()}` : ''}`);
        setBars(barsData);
        setSelectedBarId((current) => current && barsData.some((bar) => bar.id === current) ? current : barsData[0]?.id || '');
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');

            try {
                await loadBars();
                const favorites = await fetchFavoritesPage().catch(() => []);
                const ids = new Set<string>();
                extractFavoriteIds(favorites).forEach((favoriteId) => ids.add(favoriteId));
                setFavoriteIds(ids);
            } catch {
                setError('Impossible de charger l annuaire des bars.');
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [search, styleFilter, cityFilter]);

    useEffect(() => {
        if (!selectedBarId) {
            setSelectedBar(null);
            setSignatureCocktails([]);
            setReviews([]);
            return;
        }

        const loadDetail = async () => {
            setDetailLoading(true);
            setError('');
            try {
                const detail = await apiFetch<BarDetail>(`/bars/${selectedBarId}`);
                setSelectedBar(detail);
                const [loadedCocktails, loadedReviews] = await Promise.all([
                    Promise.all(detail.signature_cocktails.map(async (signature) => {
                        try {
                            const cocktail = await apiFetch<RawCocktail>(`/cocktails/${signature.cocktail_id}`);
                            return { ...mapRawCocktail(cocktail), price: signature.price, currency: signature.currency, isAvailable: signature.is_available };
                        } catch {
                            return null;
                        }
                    })),
                    apiFetchList<BarReview>(`/bars/${detail.id}/reviews`).catch(() => []),
                ]);
                setSignatureCocktails(loadedCocktails.filter(Boolean) as MappedCocktail[]);
                setReviews(loadedReviews.slice(0, 5));
            } catch {
                setSelectedBar(null);
                setSignatureCocktails([]);
                setReviews([]);
                setError('Impossible de charger ce bar.');
            } finally {
                setDetailLoading(false);
            }
        };

        void loadDetail();
    }, [selectedBarId, user?.id]);

    const styles = useMemo(() => Array.from(new Set(bars.map((bar) => bar.style).filter(Boolean))) as string[], [bars]);
    const cities = useMemo(() => Array.from(new Set(bars.map((bar) => bar.city).filter(Boolean))) as string[], [bars]);
    const filteredBars = useMemo(() => bars.filter((bar) => {
        const rating = typeof bar.average_rating === 'number' ? bar.average_rating : 0;
        return minRating === 'all' || rating >= Number(minRating);
    }), [bars, minRating]);

    useEffect(() => {
        if (!filteredBars.some((bar) => bar.id === selectedBarId)) {
            setSelectedBarId(filteredBars[0]?.id || '');
        }
    }, [filteredBars, selectedBarId]);

    const toggleBarLike = async () => {
        if (!selectedBar) return;

        setError('');
        try {
            const result = await apiFetch<{ liked: boolean }>(`/bars/${selectedBar.id}/likes/toggle`, { method: 'POST' });
            setSelectedBar((current) => current ? { ...current, liked: result.liked, likes_count: Math.max(0, (current.likes_count ?? 0) + (result.liked ? 1 : -1)) } : current);
            setBars((current) => current.map((bar) => bar.id === selectedBar.id ? { ...bar, likes_count: Math.max(0, (bar.likes_count ?? 0) + (result.liked ? 1 : -1)) } : bar));
        } catch {
            setError('Connexion requise pour liker ce bar.');
        }
    };

    const submitReview = async () => {
        if (!selectedBar) return;

        setError('');
        setMessage('');
        try {
            await apiFetch(`/bars/${selectedBar.id}/reviews`, {
                method: 'POST',
                body: JSON.stringify({
                    rating: Number(reviewForm.rating),
                    comment: reviewForm.comment.trim() || undefined,
                }),
            });

            const [detail, loadedReviews] = await Promise.all([
                apiFetch<BarDetail>(`/bars/${selectedBar.id}`),
                apiFetchList<BarReview>(`/bars/${selectedBar.id}/reviews`).catch(() => []),
            ]);
            setSelectedBar(detail);
            setReviews(loadedReviews.slice(0, 5));
            setBars((current) => current.map((bar) => bar.id === selectedBar.id ? { ...bar, average_rating: detail.average_rating } : bar));
            setReviewForm({ rating: '5', comment: '' });
            setMessage('Avis ajoute.');
        } catch {
            setError('Impossible d ajouter cet avis.');
        }
    };

    const toggleCocktailFavorite = async (cocktailId: string) => {
        setError('');
        try {
            const result = await toggleFavorite(cocktailId);
            setFavoriteIds((current) => {
                const next = new Set(current);
                if (result.action === 'added') next.add(cocktailId);
                else next.delete(cocktailId);
                return next;
            });
        } catch {
            setError('Impossible de mettre a jour les favoris.');
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 py-12"><div className="max-w-7xl mx-auto px-4 text-center text-4xl font-display">Chargement...</div></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-10">
                    <div className="text-7xl mb-4 animate-wiggle">B</div>
                    <h1 className="text-6xl md:text-8xl font-display mb-4"><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-teal-500 to-green-500">Bars partenaires</span></h1>
                    <p className="text-2xl text-gray-600">Selectionne un bar, decouvre ses cocktails signature, sa carte et laisse une note.</p>
                </div>

                {error ? <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">{error}</div> : null}
                {message ? <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">{message}</div> : null}

                <div className="mb-10">
                    <InteractiveBarMap bars={filteredBars} selectedBarId={selectedBarId} onSelectBar={setSelectedBarId} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="space-y-5">
                        <div className="border-4 border-brand-dark bg-white p-5 shadow-hard">
                            <h2 className="text-2xl font-display mb-4">Explorer les bars</h2>
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un bar ou une adresse" className="w-full border-4 border-brand-dark pl-12 pr-4 py-3 font-bold" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <select value={styleFilter} onChange={(e) => setStyleFilter(e.target.value)} className="border-4 border-brand-dark px-4 py-3 font-bold">
                                        <option value="all">Tous les styles</option>
                                        {styles.map((style) => <option key={style} value={style}>{style}</option>)}
                                    </select>
                                    <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="border-4 border-brand-dark px-4 py-3 font-bold">
                                        <option value="all">Toutes les villes</option>
                                        {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                                    </select>
                                </div>
                                <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="border-4 border-brand-dark px-4 py-3 font-bold">
                                    <option value="all">Toutes les notes</option>
                                    <option value="3">3+ / 5</option>
                                    <option value="4">4+ / 5</option>
                                </select>
                            </div>
                        </div>

                        <h3 className="text-2xl font-display">{filteredBars.length} bars trouves</h3>
                        {filteredBars.length > 0 ? filteredBars.map((bar) => (
                            <button key={bar.id} type="button" onClick={() => setSelectedBarId(bar.id)} className={`card-skew p-4 text-left w-full ${selectedBarId === bar.id ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white' : 'bg-white'}`}>
                                <div className="font-display text-2xl mb-2">{bar.name}</div>
                                <p className={`text-sm mb-2 ${selectedBarId === bar.id ? 'text-white/80' : 'text-gray-600'}`}>{locationLabel(bar)}</p>
                                <div className="flex items-center justify-between text-sm font-bold">
                                    <span>{bar.style || 'Style non renseigne'}</span>
                                    <span>{typeof bar.average_rating === 'number' ? `${bar.average_rating.toFixed(1)} / 5` : 'Sans note'}</span>
                                </div>
                            </button>
                        )) : <div className="card-skew bg-white p-8 text-center"><p className="text-lg text-gray-600">Aucun bar ne correspond aux filtres.</p></div>}
                    </div>

                    <div className="lg:col-span-2">
                        {selectedBar ? (
                            <div className="card-skew bg-white p-8">
                                <div className="flex flex-col gap-8">
                                    <section>
                                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                            <div>
                                                <h2 className="text-4xl font-display mb-2">{selectedBar.name}</h2>
                                                <p className="text-gray-600 mb-2">{selectedBar.style || 'Style non renseigne'}</p>
                                                <div className="flex items-center gap-2 text-gray-600 mb-2"><MapPin className="w-5 h-5" />{locationLabel(selectedBar)}</div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-600">
                                                    <span className="inline-flex items-center gap-1"><Star className="w-4 h-4 fill-current text-yellow-500" />{typeof selectedBar.average_rating === 'number' ? selectedBar.average_rating.toFixed(1) : 'Sans note'}</span>
                                                    <span>{selectedBar.likes_count ?? 0} j aime</span>
                                                    {selectedBar.owner_username ? <span>Proprietaire: {selectedBar.owner_username}</span> : null}
                                                </div>
                                            </div>
                                            {selectedBar.photos.length > 0 ? <img src={selectedBar.photos.find((photo) => photo.is_primary)?.url || selectedBar.photos[0].url} alt={selectedBar.name} className="h-56 w-full max-w-sm object-cover border-4 border-brand-dark" /> : null}
                                        </div>
                                        <p className="mt-5 text-lg text-gray-700">{selectedBar.description || 'Aucune description disponible pour ce bar.'}</p>
                                    </section>

                                    <section className="border-t-4 border-gray-100 pt-6">
                                        <h3 className="text-2xl font-display mb-4">Actions utiles</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {selectedBar.latitude != null && selectedBar.longitude != null ? (
                                                <a href={`https://www.openstreetmap.org/?mlat=${selectedBar.latitude}&mlon=${selectedBar.longitude}#map=18/${selectedBar.latitude}/${selectedBar.longitude}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-4 border-brand-dark bg-white px-4 py-3 font-bold">
                                                    Ouvrir dans OpenStreetMap <ExternalLink className="w-4 h-4" />
                                                </a>
                                            ) : null}
                                            {selectedBar.website ? (
                                                <a href={selectedBar.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-4 border-brand-dark bg-white px-4 py-3 font-bold">
                                                    Ouvrir la carte PDF <ExternalLink className="w-4 h-4" />
                                                </a>
                                            ) : null}
                                            <button type="button" onClick={() => void toggleBarLike()} className={`inline-flex items-center gap-2 border-4 border-brand-dark px-4 py-3 font-bold ${selectedBar.liked ? 'bg-brand-primary text-white' : 'bg-white'}`}>
                                                <Heart className={`w-4 h-4 ${selectedBar.liked ? 'fill-current' : ''}`} />
                                                {selectedBar.liked ? 'Bar aime' : 'Liker ce bar'}
                                            </button>
                                        </div>
                                    </section>

                                    {(selectedBar.latitude != null && selectedBar.longitude != null) ? (
                                        <section className="border-t-4 border-gray-100 pt-6">
                                            <h3 className="text-2xl font-display mb-4">Localisation</h3>
                                            <div className="border-4 border-brand-dark bg-white overflow-hidden">
                                                <iframe
                                                    title={`Carte de ${selectedBar.name}`}
                                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedBar.longitude - 0.01}%2C${selectedBar.latitude - 0.01}%2C${selectedBar.longitude + 0.01}%2C${selectedBar.latitude + 0.01}&layer=mapnik&marker=${selectedBar.latitude}%2C${selectedBar.longitude}`}
                                                    className="h-72 w-full border-b-4 border-brand-dark"
                                                />
                                                <div className="p-5">
                                                    <p className="font-black uppercase text-sm text-gray-500 mb-2">Adresse</p>
                                                    <p className="font-bold mb-4">{locationLabel(selectedBar)}</p>
                                                    <p className="font-black uppercase text-sm text-gray-500 mb-2">Coordonnees</p>
                                                    <p className="font-mono text-sm">{selectedBar.latitude}, {selectedBar.longitude}</p>
                                                </div>
                                            </div>
                                        </section>
                                    ) : null}

                                    <section className="border-t-4 border-gray-100 pt-6">
                                        <h3 className="text-3xl font-display mb-4">{detailLoading ? 'Chargement...' : 'Cocktails signature'}</h3>
                                        {signatureCocktails.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {signatureCocktails.map((cocktail) => (
                                                    <div key={cocktail.id} className="border-4 border-brand-dark bg-gradient-to-br from-white to-blue-50 p-5">
                                                        <Link href={`/cocktail/${cocktail.id}`} className="block">
                                                            <div className="mb-4 h-40 overflow-hidden border-2 border-brand-dark bg-slate-100">
                                                                {cocktail.image ? <img src={cocktail.image} alt={cocktail.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-5xl font-display text-brand-dark/20">{cocktail.name.substring(0, 1)}</div>}
                                                            </div>
                                                            <h4 className="text-2xl font-display mb-2">{cocktail.name}</h4>
                                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{cocktail.description || 'Cocktail signature du bar.'}</p>
                                                        </Link>
                                                        <div className="flex flex-wrap gap-2 text-xs font-black uppercase mb-4">
                                                            <span className="border-2 border-brand-dark bg-white px-3 py-1">{cocktail.difficulty}</span>
                                                            {cocktail.price ? <span className="border-2 border-brand-dark bg-white px-3 py-1">{cocktail.price} {cocktail.currency || 'EUR'}</span> : null}
                                                            <span className="border-2 border-brand-dark bg-white px-3 py-1">{cocktail.isAvailable ? 'Disponible' : 'Indisponible'}</span>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <Link href={`/cocktail/${cocktail.id}`} className="inline-flex items-center gap-2 border-2 border-brand-dark bg-white px-3 py-2 font-bold">
                                                                Voir le cocktail
                                                            </Link>
                                                            <button type="button" onClick={() => void toggleCocktailFavorite(cocktail.id)} className={`inline-flex items-center gap-2 border-2 border-brand-dark px-3 py-2 font-bold ${favoriteIds.has(cocktail.id) ? 'bg-brand-primary text-white' : 'bg-white'}`}>
                                                                <Heart className={`w-4 h-4 ${favoriteIds.has(cocktail.id) ? 'fill-current' : ''}`} />
                                                                {favoriteIds.has(cocktail.id) ? 'Favori' : 'Ajouter'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <div className="border-4 border-dashed border-gray-300 p-8 text-center"><p className="text-lg text-gray-600">Aucun cocktail signature affiche pour ce bar.</p></div>}
                                    </section>

                                    <section className="border-t-4 border-gray-100 pt-6">
                                        <div className="flex items-center gap-3 mb-4"><MessageSquare className="w-5 h-5" /><h3 className="text-2xl font-display">Notes et avis</h3></div>
                                        {reviews.length > 0 ? <div className="space-y-3 mb-5">{reviews.map((review) => <div key={review.id} className="border-2 border-slate-200 bg-slate-50 px-4 py-3"><div className="flex items-center justify-between gap-4"><span className="font-bold">Note {review.rating} / 5</span><span className="text-xs text-gray-500">{review.created_at ? new Date(review.created_at).toLocaleDateString('fr-FR') : ''}</span></div><p className="mt-2 text-sm text-gray-700">{review.comment || 'Aucun commentaire.'}</p></div>)}</div> : <p className="text-gray-500 mb-5">Pas encore d avis publics pour ce bar.</p>}
                                        {user ? <div className="border-4 border-brand-dark bg-white p-5"><h4 className="font-display text-xl mb-3">Noter ce bar</h4><div className="grid gap-3 md:grid-cols-[140px_1fr_auto]"><select value={reviewForm.rating} onChange={(e) => setReviewForm((current) => ({ ...current, rating: e.target.value }))} className="border-4 border-brand-dark px-4 py-3 font-bold">{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={String(rating)}>{rating} / 5</option>)}</select><input value={reviewForm.comment} onChange={(e) => setReviewForm((current) => ({ ...current, comment: e.target.value }))} placeholder="Ton avis sur le bar" className="border-4 border-brand-dark px-4 py-3 font-bold" /><Button onClick={() => void submitReview()}>Publier</Button></div></div> : null}
                                    </section>
                                </div>
                            </div>
                        ) : <div className="card-skew bg-white p-16 text-center"><h2 className="text-4xl font-display mb-4">Aucun bar disponible</h2><p className="text-xl text-gray-600">Aucun bar ne peut etre affiche avec les filtres actuels.</p></div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
