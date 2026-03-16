'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { fetchFavoritesPage } from '../lib/favoritesApi';
import { extractFavoriteIds, getNextFavoritesPage, type RawCocktail } from '../catalogue/catalogueFilters';

interface CurrentUser {
    id: string;
    email: string;
    role: 'admin' | 'user';
    username: string;
}

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<CurrentUser | null>(null);
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [createdCount, setCreatedCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                const [currentUser, cocktails] = await Promise.all([
                    apiFetch<CurrentUser>('/users/self'),
                    apiFetch<RawCocktail[]>('/cocktails'),
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

                const ownCocktails = cocktails.filter(
                    (cocktail) => String(cocktail.created_by_id ?? '') === currentUser.id
                );

                setProfile(currentUser);
                setCreatedCount(ownCocktails.length);
                setFavoritesCount(allFavoriteIds.size);
            } catch {
                setError('Impossible de charger le profil.');
            } finally {
                setLoading(false);
            }
        };

        void loadProfile();
    }, [authLoading, router, user]);

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
            <div className="max-w-4xl mx-auto px-4">
                <div className="card-skew bg-white p-10">
                    <div className="transform skewY(2deg)">
                        <h1 className="text-5xl font-display mb-4">Mon profil</h1>
                        <p className="text-gray-600 text-lg mb-8">Informations minimales du compte et suivi Sprint 1 et 2.</p>

                        {error && (
                            <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            <div className="border-4 border-brand-dark p-5 bg-gray-50">
                                <div className="text-sm font-black uppercase text-gray-500 mb-2">Email</div>
                                <div className="text-xl font-bold break-all">{profile.email}</div>
                            </div>
                            <div className="border-4 border-brand-dark p-5 bg-gray-50">
                                <div className="text-sm font-black uppercase text-gray-500 mb-2">Role</div>
                                <div className="text-xl font-bold">{profile.role}</div>
                            </div>
                            <div className="border-4 border-brand-dark p-5 bg-gray-50">
                                <div className="text-sm font-black uppercase text-gray-500 mb-2">Favoris</div>
                                <div className="text-4xl font-display text-brand-primary">{favoritesCount}</div>
                            </div>
                            <div className="border-4 border-brand-dark p-5 bg-gray-50">
                                <div className="text-sm font-black uppercase text-gray-500 mb-2">Cocktails crees</div>
                                <div className="text-4xl font-display text-brand-secondary">{createdCount}</div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Button onClick={() => router.push('/favorites')}>Voir mes favoris</Button>
                            <Button variant="outline" onClick={() => router.push('/my-cocktails')}>Voir mes creations</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
