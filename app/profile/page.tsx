'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { apiFetch, apiFetchList } from '../lib/api';
import { fetchFavoritesPage } from '../lib/favoritesApi';
import { extractFavoriteIds, getNextFavoritesPage, type RawCocktail } from '../catalogue/catalogueFilters';

interface CurrentUser {
    id: string;
    email: string;
    role: 'admin' | 'user';
    username: string;
    is_bar_owner: boolean;
}

type BarDetail = {
    id: string;
    name: string;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    style?: string | null;
    website?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    photos: Array<{ id: string; url: string; is_primary: boolean }>;
    signature_cocktails: Array<{ id: string; cocktail_id: string; cocktail_name?: string | null; price?: string | null; currency?: string | null; is_available: boolean }>;
};

type CocktailOption = {
    id: string;
    name: string;
};

const BAR_STYLES = ['classic', 'speakeasy', 'tiki', 'rooftop', 'dive', 'wine_bar', 'cocktail_lounge', 'sports_bar', 'brewpub', 'other'];

function slugify(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function ProfilePage() {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<CurrentUser | null>(null);
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [createdCount, setCreatedCount] = useState(0);
    const [ownedBar, setOwnedBar] = useState<BarDetail | null>(null);
    const [approvedCocktails, setApprovedCocktails] = useState<CocktailOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingBar, setSavingBar] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [profileForm, setProfileForm] = useState({ username: '', email: '', isBarOwner: false });
    const [barForm, setBarForm] = useState({
        name: '',
        description: '',
        address: '',
        city: '',
        country: 'France',
        style: 'cocktail_lounge',
        menuPdfUrl: '',
        latitude: '',
        longitude: '',
        photoUrl: '',
    });
    const [signatureForm, setSignatureForm] = useState({ cocktailId: '', price: '', currency: 'EUR' });

    const isBarOwner = Boolean(profile?.is_bar_owner);

    const loadOwnedBar = async (userId: string) => {
        const ownBars = await apiFetchList<{ id: string }>(`/bars?owner_id=${encodeURIComponent(userId)}`).catch(() => []);
        if (!ownBars.length) {
            setOwnedBar(null);
            setBarForm((current) => ({
                ...current,
                name: '',
                description: '',
                address: '',
                city: '',
                country: 'France',
                style: 'cocktail_lounge',
                menuPdfUrl: '',
                latitude: '',
                longitude: '',
                photoUrl: '',
            }));
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
            menuPdfUrl: detail.website || '',
            latitude: detail.latitude != null ? String(detail.latitude) : '',
            longitude: detail.longitude != null ? String(detail.longitude) : '',
            photoUrl: '',
        });
    };

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            router.push('/login');
            return;
        }

        const loadProfile = async () => {
            setError('');

            try {
                const [currentUser, cocktails, approved] = await Promise.all([
                    apiFetch<CurrentUser>('/users/self'),
                    apiFetchList<RawCocktail>(`/cocktails?community=true&user_id=${encodeURIComponent(user.id)}`),
                    apiFetchList<CocktailOption>('/cocktails?status=approved').catch(() => []),
                ]);

                const allFavoriteIds = new Set<string>();
                let currentPage = 1;

                for (let requestCount = 0; requestCount < 25; requestCount += 1) {
                    const favoritesData = await fetchFavoritesPage({ page: currentPage }).catch(() => []);
                    extractFavoriteIds(favoritesData).forEach((favoriteId) => allFavoriteIds.add(favoriteId));

                    const nextPage = getNextFavoritesPage(favoritesData, currentPage);
                    if (nextPage === null || nextPage <= currentPage) {
                        break;
                    }

                    currentPage = nextPage;
                }

                setProfile(currentUser);
                setProfileForm({
                    username: currentUser.username,
                    email: currentUser.email,
                    isBarOwner: currentUser.is_bar_owner,
                });
                setCreatedCount(cocktails.length);
                setFavoritesCount(allFavoriteIds.size);
                setApprovedCocktails(approved.map((cocktail) => ({ id: cocktail.id, name: cocktail.name })));

                if (currentUser.is_bar_owner) {
                    await loadOwnedBar(currentUser.id);
                } else {
                    setOwnedBar(null);
                }
            } catch {
                setError('Impossible de charger le profil.');
            } finally {
                setLoading(false);
            }
        };

        void loadProfile();
    }, [authLoading, router, user]);

    const saveProfile = async () => {
        setSavingProfile(true);
        setError('');
        setMessage('');

        try {
            const updated = await apiFetch<CurrentUser>('/users/update/self', {
                method: 'PUT',
                body: JSON.stringify({
                    username: profileForm.username.trim(),
                    email: profileForm.email.trim(),
                    isBarOwner: profileForm.isBarOwner,
                }),
            });

            setProfile(updated);
            setProfileForm({
                username: updated.username,
                email: updated.email,
                isBarOwner: updated.is_bar_owner,
            });
            await refreshUser();
            if (updated.is_bar_owner) {
                await loadOwnedBar(updated.id);
            } else {
                setOwnedBar(null);
            }
            setMessage('Profil mis a jour.');
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Impossible de mettre a jour le profil.');
        } finally {
            setSavingProfile(false);
        }
    };

    const saveBar = async () => {
        if (!profile?.is_bar_owner) {
            return;
        }

        setSavingBar(true);
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
                website: barForm.menuPdfUrl.trim() || undefined,
                style: barForm.style,
                latitude: barForm.latitude ? Number(barForm.latitude) : undefined,
                longitude: barForm.longitude ? Number(barForm.longitude) : undefined,
            };

            if (!payload.name) {
                throw new Error('Le nom du bar est requis.');
            }

            const savedBar = ownedBar
                ? await apiFetch<BarDetail>(`/bars/${ownedBar.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                })
                : await apiFetch<BarDetail>('/bars', {
                    method: 'POST',
                    body: JSON.stringify({
                        ...payload,
                        photos: barForm.photoUrl.trim() ? [{ url: barForm.photoUrl.trim(), is_primary: true }] : undefined,
                    }),
                });

            if (ownedBar && barForm.photoUrl.trim()) {
                await apiFetch(`/bars/${ownedBar.id}/photos`, {
                    method: 'POST',
                    body: JSON.stringify({ url: barForm.photoUrl.trim(), is_primary: true }),
                });
            }

            await loadOwnedBar(profile.id);
            setMessage(ownedBar ? 'Bar mis a jour.' : 'Bar cree.');
            setBarForm((current) => ({ ...current, photoUrl: '' }));
            if (!ownedBar) {
                setOwnedBar(savedBar);
            }
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Impossible d enregistrer ce bar.');
        } finally {
            setSavingBar(false);
        }
    };

    const addSignature = async () => {
        if (!ownedBar || !signatureForm.cocktailId) {
            return;
        }

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

            await loadOwnedBar(profile!.id);
            setSignatureForm({ cocktailId: '', price: '', currency: 'EUR' });
            setMessage('Cocktail signature ajoute.');
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Impossible d ajouter ce cocktail signature.');
        }
    };

    const removeSignature = async (signatureId: string) => {
        if (!ownedBar) {
            return;
        }

        setError('');
        setMessage('');

        try {
            await apiFetch(`/bars/${ownedBar.id}/signature-cocktails/${signatureId}`, { method: 'DELETE' });
            await loadOwnedBar(profile!.id);
            setMessage('Cocktail signature retire.');
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Impossible de retirer ce cocktail signature.');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
                <div className="text-4xl font-display">Chargement...</div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#FFF9F0] py-12">
            <div className="max-w-5xl mx-auto px-4 space-y-8">
                {error ? (
                    <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        {error}
                    </div>
                ) : null}

                {message ? (
                    <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
                        {message}
                    </div>
                ) : null}

                <div className="card-skew bg-white p-10">
                    <div className="transform skewY(2deg)">
                        <h1 className="text-5xl font-display mb-4">Mon profil</h1>
                        <p className="text-gray-600 text-lg mb-8">Gere ton compte, ton espace pro et les informations publiques de ton bar.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="border-4 border-brand-dark p-5 bg-gray-50">
                                <div className="text-sm font-black uppercase text-gray-500 mb-2">Favoris</div>
                                <div className="text-4xl font-display text-brand-primary">{favoritesCount}</div>
                            </div>
                            <div className="border-4 border-brand-dark p-5 bg-gray-50">
                                <div className="text-sm font-black uppercase text-gray-500 mb-2">Cocktails crees</div>
                                <div className="text-4xl font-display text-brand-secondary">{createdCount}</div>
                            </div>
                            <div className="border-4 border-brand-dark p-5 bg-gray-50">
                                <div className="text-sm font-black uppercase text-gray-500 mb-2">Compte pro</div>
                                <div className="text-xl font-bold">{profile.is_bar_owner ? 'Actif' : 'Standard'}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                value={profileForm.username}
                                onChange={(event) => setProfileForm((current) => ({ ...current, username: event.target.value }))}
                                placeholder="Pseudo"
                                className="border-4 border-brand-dark px-4 py-3 font-bold"
                            />
                            <input
                                value={profileForm.email}
                                onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                                placeholder="Email"
                                className="border-4 border-brand-dark px-4 py-3 font-bold"
                            />
                        </div>

                        <label className="mt-4 flex items-start gap-3 border-4 border-brand-dark bg-blue-50 px-4 py-4 font-bold">
                            <input
                                type="checkbox"
                                checked={profileForm.isBarOwner}
                                onChange={(event) => setProfileForm((current) => ({ ...current, isBarOwner: event.target.checked }))}
                                className="mt-1"
                            />
                            <span>
                                <span className="block">Activer mon compte pro / bar</span>
                                <span className="block text-sm font-medium text-gray-600">Permet de creer et modifier un bar, son adresse, sa carte PDF et ses cocktails signature.</span>
                            </span>
                        </label>

                        <div className="mt-6 flex flex-wrap gap-4">
                            <Button onClick={() => void saveProfile()} disabled={savingProfile}>
                                {savingProfile ? 'Enregistrement...' : 'Enregistrer mon profil'}
                            </Button>
                            <Button variant="outline" onClick={() => router.push('/favorites')}>Voir mes favoris</Button>
                            <Button variant="outline" onClick={() => router.push('/my-cocktails')}>Voir mes creations</Button>
                            <Button variant="outline" onClick={() => router.push('/bars')}>Explorer les bars</Button>
                        </div>
                    </div>
                </div>

                {isBarOwner ? (
                    <div className="card-skew bg-white p-10">
                        <div className="transform skewY(2deg)">
                            <h2 className="text-4xl font-display mb-4">{ownedBar ? 'Mon bar' : 'Creer mon bar'}</h2>
                            <p className="text-gray-600 text-lg mb-8">Renseigne ton adresse, ta carte PDF et les cocktails signature visibles par les utilisateurs.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input value={barForm.name} onChange={(event) => setBarForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nom du bar" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                                <select value={barForm.style} onChange={(event) => setBarForm((current) => ({ ...current, style: event.target.value }))} className="border-4 border-brand-dark px-4 py-3 font-bold">
                                    {BAR_STYLES.map((style) => <option key={style} value={style}>{style}</option>)}
                                </select>
                                <input value={barForm.address} onChange={(event) => setBarForm((current) => ({ ...current, address: event.target.value }))} placeholder="Adresse complete" className="border-4 border-brand-dark px-4 py-3 font-bold md:col-span-2" />
                                <input value={barForm.city} onChange={(event) => setBarForm((current) => ({ ...current, city: event.target.value }))} placeholder="Ville" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                                <input value={barForm.country} onChange={(event) => setBarForm((current) => ({ ...current, country: event.target.value }))} placeholder="Pays" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                                <input value={barForm.latitude} onChange={(event) => setBarForm((current) => ({ ...current, latitude: event.target.value }))} placeholder="Latitude" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                                <input value={barForm.longitude} onChange={(event) => setBarForm((current) => ({ ...current, longitude: event.target.value }))} placeholder="Longitude" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                                <input value={barForm.menuPdfUrl} onChange={(event) => setBarForm((current) => ({ ...current, menuPdfUrl: event.target.value }))} placeholder="Lien de la carte PDF" className="border-4 border-brand-dark px-4 py-3 font-bold md:col-span-2" />
                                <input value={barForm.photoUrl} onChange={(event) => setBarForm((current) => ({ ...current, photoUrl: event.target.value }))} placeholder="Photo URL principale" className="border-4 border-brand-dark px-4 py-3 font-bold md:col-span-2" />
                                <textarea value={barForm.description} onChange={(event) => setBarForm((current) => ({ ...current, description: event.target.value }))} placeholder="Presentation du bar" className="border-4 border-brand-dark px-4 py-3 font-bold min-h-32 md:col-span-2" />
                            </div>

                            <div className="mt-6 flex flex-wrap gap-4">
                                <Button onClick={() => void saveBar()} disabled={savingBar}>
                                    {savingBar ? 'Enregistrement...' : ownedBar ? 'Mettre a jour mon bar' : 'Creer mon bar'}
                                </Button>
                                {ownedBar?.website ? (
                                    <a href={ownedBar.website} target="_blank" rel="noreferrer" className="inline-flex items-center border-4 border-brand-dark bg-white px-4 py-3 font-bold">
                                        Ouvrir la carte PDF
                                    </a>
                                ) : null}
                            </div>

                            {ownedBar ? (
                                <div className="mt-8 border-t-4 border-gray-100 pt-8">
                                    <h3 className="text-2xl font-display mb-4">Cocktails signature</h3>
                                    <div className="grid gap-3 md:grid-cols-[2fr_1fr_140px_auto]">
                                        <select value={signatureForm.cocktailId} onChange={(event) => setSignatureForm((current) => ({ ...current, cocktailId: event.target.value }))} className="border-4 border-brand-dark px-4 py-3 font-bold">
                                            <option value="">Selectionner un cocktail</option>
                                            {approvedCocktails.map((cocktail) => <option key={cocktail.id} value={cocktail.id}>{cocktail.name}</option>)}
                                        </select>
                                        <input value={signatureForm.price} onChange={(event) => setSignatureForm((current) => ({ ...current, price: event.target.value }))} placeholder="Prix" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                                        <input value={signatureForm.currency} onChange={(event) => setSignatureForm((current) => ({ ...current, currency: event.target.value }))} placeholder="EUR" className="border-4 border-brand-dark px-4 py-3 font-bold" />
                                        <Button onClick={() => void addSignature()}>Ajouter</Button>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        {ownedBar.signature_cocktails.length > 0 ? ownedBar.signature_cocktails.map((signature) => (
                                            <div key={signature.id} className="flex flex-col gap-3 border-2 border-slate-200 bg-slate-50 px-4 py-4 md:flex-row md:items-center md:justify-between">
                                                <div>
                                                    <div className="font-bold">{signature.cocktail_name || signature.cocktail_id}</div>
                                                    <div className="text-sm text-gray-500">{signature.price ? `${signature.price} ${signature.currency || 'EUR'}` : 'Sans prix'} - {signature.is_available ? 'Disponible' : 'Indisponible'}</div>
                                                </div>
                                                <button type="button" onClick={() => void removeSignature(signature.id)} className="border-2 border-brand-dark bg-white px-3 py-2 font-bold">
                                                    Retirer
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="border-4 border-dashed border-gray-300 p-6 text-center text-gray-600">
                                                Aucun cocktail signature pour le moment.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                ) : (
                    <div className="card-skew bg-white p-10">
                        <div className="transform skewY(2deg)">
                            <h2 className="text-3xl font-display mb-3">Compte standard</h2>
                            <p className="text-gray-600 text-lg mb-6">Active le compte pro dans ton profil pour creer un bar, ajouter son adresse, publier sa carte PDF et proposer ses cocktails signature.</p>
                            <Link href="/bars" className="inline-flex border-4 border-brand-dark bg-white px-4 py-3 font-bold">
                                Voir l espace bars
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
