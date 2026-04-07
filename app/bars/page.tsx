'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, MapPin, Plus, Star, Store } from 'lucide-react';
import { apiFetch, apiFetchList } from '../lib/api';
import { mapRawCocktail, type RawCocktail } from '../catalogue/catalogueFilters';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

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
    owner_id?: string;
};

type BarDetail = BarListItem & {
    photos: Array<{ id: string; url: string; alt_text?: string | null; is_primary: boolean }>;
    signature_cocktails: Array<{
        id: string;
        cocktail_id: string;
        cocktail_name?: string | null;
        price?: string | null;
        currency?: string | null;
        is_available: boolean;
    }>;
};

type MappedCocktail = ReturnType<typeof mapRawCocktail> & { price?: string | null; currency?: string | null; isAvailable: boolean };

const BAR_STYLES = ['classic', 'speakeasy', 'tiki', 'rooftop', 'dive', 'wine_bar', 'cocktail_lounge', 'sports_bar', 'brewpub', 'other'];

function slugify(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function locationLabel(bar: Pick<BarListItem, 'address' | 'city' | 'country'>) {
    return [bar.address, bar.city, bar.country].filter(Boolean).join(', ') || 'Adresse non renseignee';
}

export default function BarsPage() {
    const { user } = useAuth();
    const [bars, setBars] = useState<BarListItem[]>([]);
    const [selectedBarId, setSelectedBarId] = useState('');
    const [selectedBar, setSelectedBar] = useState<BarDetail | null>(null);
    const [signatureCocktails, setSignatureCocktails] = useState<MappedCocktail[]>([]);
    const [approvedCocktails, setApprovedCocktails] = useState<ReturnType<typeof mapRawCocktail>[]>([]);
    const [filterType, setFilterType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [ownedBar, setOwnedBar] = useState<BarDetail | null>(null);
    const [barForm, setBarForm] = useState({ name: '', description: '', address: '', city: '', country: 'France', style: 'cocktail_lounge', website: '', latitude: '', longitude: '', photoUrl: '' });
    const [signatureForm, setSignatureForm] = useState({ cocktailId: '', price: '', currency: 'EUR' });

    const isBarOwner = Boolean(user?.is_bar_owner);

    const hydrateBarDetail = async (detail: BarDetail) => {
        setSelectedBar(detail);
        const loaded = await Promise.all(detail.signature_cocktails.map(async (signature) => {
            try {
                const cocktail = await apiFetch<RawCocktail>(`/cocktails/${signature.cocktail_id}`);
                return { ...mapRawCocktail(cocktail), price: signature.price, currency: signature.currency, isAvailable: signature.is_available };
            } catch {
                return null;
            }
        }));
        setSignatureCocktails(loaded.filter(Boolean) as MappedCocktail[]);
    };

    const loadBars = async () => {
        const barsData = await apiFetchList<BarListItem>('/bars');
        setBars(barsData);
        setSelectedBarId((current) => current || barsData[0]?.id || '');
    };

    const loadOwnedBar = async () => {
        if (!user || !isBarOwner) {
            setOwnedBar(null);
            return;
        }

        const ownBars = await apiFetchList<BarListItem>(`/bars?owner_id=${user.id}`);
        if (!ownBars.length) {
            setOwnedBar(null);
            setBarForm((current) => ({ ...current, name: '', description: '', address: '', city: '', website: '', latitude: '', longitude: '', photoUrl: '' }));
            return;
        }

        const detail = await apiFetch<BarDetail>(`/bars/${ownBars[0].id}`);
        setOwnedBar(detail);
        setBarForm({
            name: detail.name || '',
            description: detail.description || '',
            address: detail.address || '',
            city: detail.city || '',
            country: detail.country || 'France',
            style: detail.style || 'cocktail_lounge',
            website: detail.website || '',
            latitude: detail.latitude != null ? String(detail.latitude) : '',
            longitude: detail.longitude != null ? String(detail.longitude) : '',
            photoUrl: '',
        });
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                await loadBars();
                if (isBarOwner && user) {
                    const cocktails = await apiFetchList<RawCocktail>('/cocktails?status=approved');
                    setApprovedCocktails(cocktails.map(mapRawCocktail));
                    await loadOwnedBar();
                }
            } catch {
                setError('Impossible de charger l annuaire des bars.');
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [isBarOwner, user?.id]);

    useEffect(() => {
        if (!selectedBarId) {
            setSelectedBar(null);
            setSignatureCocktails([]);
            return;
        }

        const loadDetail = async () => {
            setDetailLoading(true);
            try {
                const detail = await apiFetch<BarDetail>(`/bars/${selectedBarId}`);
                await hydrateBarDetail(detail);
            } catch {
                setSelectedBar(null);
                setSignatureCocktails([]);
            } finally {
                setDetailLoading(false);
            }
        };
        void loadDetail();
    }, [selectedBarId]);

    const styles = useMemo(() => Array.from(new Set(bars.map((bar) => bar.style).filter(Boolean))) as string[], [bars]);
    const filteredBars = useMemo(() => filterType === 'all' ? bars : bars.filter((bar) => bar.style === filterType), [bars, filterType]);

    const saveBar = async () => {
        setError('');
        setMessage('');
        try {
            const payload = {
                name: barForm.name.trim(),
                slug: slugify(barForm.name.trim()),
                description: barForm.description.trim() || undefined,
                address: barForm.address.trim() || undefined,
                city: barForm.city.trim() || undefined,
                country: barForm.country.trim() || undefined,
                website: barForm.website.trim() || undefined,
                style: barForm.style,
                latitude: barForm.latitude ? Number(barForm.latitude) : undefined,
                longitude: barForm.longitude ? Number(barForm.longitude) : undefined,
            };
            if (!payload.name) throw new Error('Le nom du bar est requis.');
            const bar = ownedBar
                ? await apiFetch<BarDetail>(`/bars/${ownedBar.id}`, { method: 'PUT', body: JSON.stringify(payload) })
                : await apiFetch<BarDetail>('/bars', { method: 'POST', body: JSON.stringify({ ...payload, photos: barForm.photoUrl.trim() ? [{ url: barForm.photoUrl.trim(), is_primary: true }] : undefined }) });
            if (ownedBar && barForm.photoUrl.trim()) await apiFetch(`/bars/${ownedBar.id}/photos`, { method: 'POST', body: JSON.stringify({ url: barForm.photoUrl.trim(), is_primary: true }) });
            await loadBars();
            await loadOwnedBar();
            await hydrateBarDetail(await apiFetch<BarDetail>(`/bars/${bar.id}`));
            setSelectedBarId(bar.id);
            setBarForm((current) => ({ ...current, photoUrl: '' }));
            setMessage(ownedBar ? 'Bar mis a jour.' : 'Bar cree.');
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Impossible d enregistrer ce bar.');
        }
    };

    const addSignature = async () => {
        if (!ownedBar || !signatureForm.cocktailId) return;
        setError('');
        setMessage('');
        try {
            await apiFetch(`/bars/${ownedBar.id}/signature-cocktails`, {
                method: 'POST',
                body: JSON.stringify({
                    cocktail_id: signatureForm.cocktailId,
                    price: signatureForm.price.trim() || undefined,
                    currency: signatureForm.currency.trim() || undefined,
                    is_available: true,
                }),
            });
            await loadOwnedBar();
            await hydrateBarDetail(await apiFetch<BarDetail>(`/bars/${ownedBar.id}`));
            if (selectedBarId === ownedBar.id) setSelectedBarId(ownedBar.id);
            setSignatureForm({ cocktailId: '', price: '', currency: 'EUR' });
            setMessage('Cocktail signature ajoute.');
        } catch {
            setError('Impossible d ajouter ce cocktail signature.');
        }
    };

    const removeSignature = async (signatureId: string) => {
        if (!ownedBar) return;
        setError('');
        setMessage('');
        try {
            await apiFetch(`/bars/${ownedBar.id}/signature-cocktails/${signatureId}`, { method: 'DELETE' });
            await loadOwnedBar();
            await hydrateBarDetail(await apiFetch<BarDetail>(`/bars/${ownedBar.id}`));
            if (selectedBarId === ownedBar.id) setSelectedBarId(ownedBar.id);
            setMessage('Cocktail signature retire.');
        } catch {
            setError('Impossible de retirer ce cocktail signature.');
        }
    };

    if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 py-12"><div className="max-w-7xl mx-auto px-4 text-center text-4xl font-display">Chargement...</div></div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="text-7xl mb-4 animate-wiggle">B</div>
                    <h1 className="text-6xl md:text-8xl font-display mb-4"><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-teal-500 to-green-500">Bars partenaires</span></h1>
                    <p className="text-2xl text-gray-600">Annuaire, details, cocktails signature et espace proprietaire.</p>
                </div>

                {error ? <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">{error}</div> : null}
                {message ? <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">{message}</div> : null}

                {isBarOwner ? (
                    <div className="mb-10 border-4 border-brand-dark bg-white p-6 shadow-hard">
                        <div className="flex items-center gap-3 mb-4"><Store className="w-6 h-6" /><h2 className="text-2xl font-display">{ownedBar ? 'Mon bar' : 'Creer mon compte bar'}</h2></div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <input value={barForm.name} onChange={(e) => setBarForm((c) => ({ ...c, name: e.target.value }))} placeholder="Nom du bar" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                            <select value={barForm.style} onChange={(e) => setBarForm((c) => ({ ...c, style: e.target.value }))} className="border-4 border-brand-dark px-4 py-3 font-bold">{BAR_STYLES.map((style) => <option key={style} value={style}>{style}</option>)}</select>
                            <input value={barForm.city} onChange={(e) => setBarForm((c) => ({ ...c, city: e.target.value }))} placeholder="Ville" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                            <input value={barForm.address} onChange={(e) => setBarForm((c) => ({ ...c, address: e.target.value }))} placeholder="Adresse" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                            <input value={barForm.website} onChange={(e) => setBarForm((c) => ({ ...c, website: e.target.value }))} placeholder="Site web" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                            <input value={barForm.photoUrl} onChange={(e) => setBarForm((c) => ({ ...c, photoUrl: e.target.value }))} placeholder="Photo URL" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                            <input value={barForm.latitude} onChange={(e) => setBarForm((c) => ({ ...c, latitude: e.target.value }))} placeholder="Latitude" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                            <input value={barForm.longitude} onChange={(e) => setBarForm((c) => ({ ...c, longitude: e.target.value }))} placeholder="Longitude" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                            <textarea value={barForm.description} onChange={(e) => setBarForm((c) => ({ ...c, description: e.target.value }))} placeholder="Presentation du bar" className="md:col-span-2 min-h-28 border-4 border-brand-dark px-4 py-3 font-bold" />
                        </div>
                        <div className="mt-4"><Button onClick={() => void saveBar()}>{ownedBar ? 'Mettre a jour mon bar' : 'Creer mon bar'}</Button></div>

                        {ownedBar ? (
                            <div className="mt-8 border-t-4 border-gray-100 pt-6">
                                <h3 className="text-xl font-display mb-3">Cocktails signature</h3>
                                <div className="grid gap-3 md:grid-cols-[2fr_1fr_140px_auto]">
                                    <select value={signatureForm.cocktailId} onChange={(e) => setSignatureForm((c) => ({ ...c, cocktailId: e.target.value }))} className="border-4 border-brand-dark px-4 py-3 font-bold">
                                        <option value="">Selectionner un cocktail</option>
                                        {approvedCocktails.map((cocktail) => <option key={cocktail.id} value={cocktail.id}>{cocktail.name}</option>)}
                                    </select>
                                    <input value={signatureForm.price} onChange={(e) => setSignatureForm((c) => ({ ...c, price: e.target.value }))} placeholder="Prix" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                                    <input value={signatureForm.currency} onChange={(e) => setSignatureForm((c) => ({ ...c, currency: e.target.value }))} placeholder="EUR" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                                    <Button onClick={() => void addSignature()}><Plus className="w-4 h-4" />Ajouter</Button>
                                </div>
                                <div className="mt-4 space-y-3">
                                    {ownedBar.signature_cocktails.map((signature) => (
                                        <div key={signature.id} className="flex items-center justify-between border-2 border-slate-200 bg-slate-50 px-4 py-3">
                                            <div>
                                                <div className="font-bold">{signature.cocktail_name || signature.cocktail_id}</div>
                                                <div className="text-sm text-gray-500">{signature.price ? `${signature.price} ${signature.currency || 'EUR'}` : 'Sans prix'} - {signature.is_available ? 'Disponible' : 'Indisponible'}</div>
                                            </div>
                                            <button type="button" onClick={() => void removeSignature(signature.id)} className="border-2 border-brand-dark bg-white px-3 py-2 font-bold">Retirer</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : null}

                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    <button type="button" onClick={() => setFilterType('all')} className={`px-6 py-3 font-bold border-4 ${filterType === 'all' ? 'bg-brand-primary text-white border-brand-dark' : 'bg-white text-gray-600 border-gray-300'}`}>Tous</button>
                    {styles.map((style) => <button key={style} type="button" onClick={() => setFilterType(style)} className={`px-6 py-3 font-bold border-4 ${filterType === style ? 'bg-brand-secondary text-white border-brand-dark' : 'bg-white text-gray-600 border-gray-300'}`}>{style}</button>)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-display">{filteredBars.length} bars trouves</h2>
                        {filteredBars.map((bar) => (
                            <button key={bar.id} type="button" onClick={() => setSelectedBarId(bar.id)} className={`card-skew p-4 text-left w-full ${selectedBarId === bar.id ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white' : 'bg-white'}`}>
                                <div className="font-display text-2xl mb-2">{bar.name}</div>
                                <p className={`text-sm mb-2 ${selectedBarId === bar.id ? 'text-white/80' : 'text-gray-600'}`}>{locationLabel(bar)}</p>
                                <div className="flex items-center justify-between text-sm font-bold"><span>{bar.style || 'Style non renseigne'}</span><span>{typeof bar.average_rating === 'number' ? `${bar.average_rating.toFixed(1)} / 5` : 'Sans note'}</span></div>
                            </button>
                        ))}
                    </div>

                    <div className="lg:col-span-2">
                        {selectedBar ? (
                            <div className="card-skew bg-white p-8">
                                <h2 className="text-4xl font-display mb-2">{selectedBar.name}</h2>
                                <p className="text-gray-600 mb-3">{selectedBar.style || 'Style non renseigne'}</p>
                                <div className="flex items-center gap-2 text-gray-600 mb-2"><MapPin className="w-5 h-5" />{locationLabel(selectedBar)}</div>
                                <div className="flex items-center gap-4 mb-6 text-sm font-bold text-gray-600">
                                    <span className="inline-flex items-center gap-1"><Star className="w-4 h-4 fill-current text-yellow-500" />{typeof selectedBar.average_rating === 'number' ? selectedBar.average_rating.toFixed(1) : 'Sans note'}</span>
                                    <span>{selectedBar.likes_count ?? 0} j aime</span>
                                    {selectedBar.owner_username ? <span>Proprietaire: {selectedBar.owner_username}</span> : null}
                                </div>
                                {selectedBar.photos.length > 0 ? <img src={selectedBar.photos.find((photo) => photo.is_primary)?.url || selectedBar.photos[0].url} alt={selectedBar.name} className="mb-6 h-72 w-full object-cover border-4 border-brand-dark" /> : null}
                                <p className="text-lg text-gray-700 mb-6">{selectedBar.description || 'Aucune description disponible pour ce bar.'}</p>

                                {(selectedBar.latitude != null && selectedBar.longitude != null) ? (
                                    <div className="mb-8 border-4 border-brand-dark bg-sky-50 p-5">
                                        <h3 className="text-2xl font-display mb-2">Map du bar</h3>
                                        <p className="text-sm text-gray-600 mb-3">Coordonnees: {selectedBar.latitude}, {selectedBar.longitude}</p>
                                        <a href={`https://www.openstreetmap.org/?mlat=${selectedBar.latitude}&mlon=${selectedBar.longitude}#map=18/${selectedBar.latitude}/${selectedBar.longitude}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-4 border-brand-dark bg-white px-4 py-3 font-bold">
                                            Ouvrir la map <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                ) : null}

                                <h3 className="text-3xl font-display mb-4">{detailLoading ? 'Chargement...' : 'Cocktails signature'}</h3>
                                {signatureCocktails.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {signatureCocktails.map((cocktail) => (
                                            <Link key={cocktail.id} href={`/cocktail/${cocktail.id}`} className="block border-4 border-brand-dark bg-gradient-to-br from-white to-blue-50 p-5">
                                                <h4 className="text-2xl font-display mb-2">{cocktail.name}</h4>
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{cocktail.description || 'Cocktail signature du bar.'}</p>
                                                <div className="flex flex-wrap gap-2 text-xs font-black uppercase">
                                                    <span className="border-2 border-brand-dark bg-white px-3 py-1">{cocktail.difficulty}</span>
                                                    {cocktail.price ? <span className="border-2 border-brand-dark bg-white px-3 py-1">{cocktail.price} {cocktail.currency || 'EUR'}</span> : null}
                                                    <span className="border-2 border-brand-dark bg-white px-3 py-1">{cocktail.isAvailable ? 'Disponible' : 'Indisponible'}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : selectedBar.signature_cocktails.length > 0 ? (
                                    <div className="space-y-3">{selectedBar.signature_cocktails.map((cocktail) => <div key={cocktail.id} className="border-2 border-slate-200 bg-slate-50 px-4 py-3"><div className="font-bold">{cocktail.cocktail_name || 'Cocktail signature'}</div><div className="text-sm text-gray-500">{cocktail.price ? `${cocktail.price} ${cocktail.currency || 'EUR'} - ` : ''}{cocktail.is_available ? 'Disponible' : 'Indisponible'}</div></div>)}</div>
                                ) : <p className="text-gray-500">Aucun cocktail signature affiche pour ce bar.</p>}
                            </div>
                        ) : <div className="card-skew bg-white p-16 text-center"><h2 className="text-4xl font-display mb-4">Aucun bar disponible</h2><p className="text-xl text-gray-600">Le catalogue de bars est vide pour le moment.</p></div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
