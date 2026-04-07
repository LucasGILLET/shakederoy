'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderHeart, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { createCollection, listMyCollections, listPublicCollections, type Collection } from '../lib/collectionsApi';

export default function CollectionsPage() {
    const { user, loading: authLoading } = useAuth();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [publicCollections, setPublicCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [createName, setCreateName] = useState('');
    const [createDescription, setCreateDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const loadCollections = async () => {
            setLoading(true);
            setError('');

            try {
                const [mine, publicList] = await Promise.all([
                    user ? listMyCollections().catch(() => []) : Promise.resolve([]),
                    listPublicCollections().catch(() => []),
                ]);

                setCollections(mine);
                setPublicCollections(publicList);
            } catch {
                setError('Impossible de charger les collections.');
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            void loadCollections();
        }
    }, [authLoading, user]);

    const handleCreate = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!user || !createName.trim()) {
            return;
        }

        setCreating(true);
        setError('');

        try {
            const created = await createCollection({
                name: createName.trim(),
                description: createDescription.trim() || undefined,
                isPublic,
            });
            setCollections((current) => [created, ...current]);
            if (created.is_public) {
                setPublicCollections((current) => [created, ...current]);
            }
            setCreateName('');
            setCreateDescription('');
            setIsPublic(false);
        } catch (creationError) {
            setError(creationError instanceof Error ? creationError.message : 'Creation impossible.');
        } finally {
            setCreating(false);
        }
    };

    if (loading || authLoading) {
        return <div className="mx-auto max-w-6xl px-4 py-12 text-4xl font-display">Chargement...</div>;
    }

    return (
        <div className="min-h-screen bg-[#FFF9F0] py-12">
            <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4">
                <section className="card-skew bg-white p-10">
                    <div className="transform skewY(2deg)">
                        <div className="mb-4 flex items-center gap-4">
                            <FolderHeart className="h-10 w-10 text-brand-primary" />
                            <div>
                                <h1 className="text-5xl font-display">Collections</h1>
                                <p className="text-lg text-gray-600">Organise tes cocktails et explore les collections publiques.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {error ? (
                    <div className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
                ) : null}

                {user ? (
                    <section className="card-skew bg-white p-8">
                        <div className="transform skewY(2deg)">
                            <h2 className="mb-6 text-3xl font-display">Creer une collection</h2>
                            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
                                <input
                                    className="rounded-2xl border-2 border-slate-300 px-4 py-3"
                                    placeholder="Nom de la collection"
                                    value={createName}
                                    onChange={(event) => setCreateName(event.target.value)}
                                />
                                <input
                                    className="rounded-2xl border-2 border-slate-300 px-4 py-3"
                                    placeholder="Description optionnelle"
                                    value={createDescription}
                                    onChange={(event) => setCreateDescription(event.target.value)}
                                />
                                <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                    <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} />
                                    Rendre la collection publique
                                </label>
                                <Button className="justify-center" disabled={creating || !createName.trim()} type="submit">
                                    <Plus className="h-4 w-4" /> {creating ? 'Creation...' : 'Creer'}
                                </Button>
                            </form>
                        </div>
                    </section>
                ) : (
                    <section className="card-skew bg-white p-8">
                        <div className="transform skewY(2deg)">
                            <p className="text-lg text-gray-600">
                                <Link href="/login" className="font-bold text-brand-primary underline">Connecte-toi</Link> pour creer tes propres collections.
                            </p>
                        </div>
                    </section>
                )}

                <section className="grid gap-8 lg:grid-cols-2">
                    <article className="card-skew bg-white p-8">
                        <div className="transform skewY(2deg)">
                            <h2 className="mb-6 text-3xl font-display">Mes collections</h2>
                            {user ? (
                                collections.length > 0 ? (
                                    <div className="space-y-4">
                                        {collections.map((collection) => (
                                            <div key={collection.id} className="border-2 border-slate-200 bg-slate-50 px-4 py-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <h3 className="text-xl font-display">{collection.name}</h3>
                                                        <p className="text-sm text-gray-600">{collection.description || 'Aucune description'}</p>
                                                    </div>
                                                    <span className="border-2 border-brand-dark bg-white px-3 py-1 text-xs font-black uppercase">
                                                        {collection.is_public ? 'Public' : 'Prive'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Aucune collection pour le moment.</p>
                                )
                            ) : (
                                <p className="text-gray-500">Connexion requise pour afficher tes collections.</p>
                            )}
                        </div>
                    </article>

                    <article className="card-skew bg-white p-8">
                        <div className="transform skewY(2deg)">
                            <h2 className="mb-6 text-3xl font-display">Collections publiques</h2>
                            {publicCollections.length > 0 ? (
                                <div className="space-y-4">
                                    {publicCollections.map((collection) => (
                                        <div key={collection.id} className="border-2 border-slate-200 bg-slate-50 px-4 py-4">
                                            <h3 className="text-xl font-display">{collection.name}</h3>
                                            <p className="text-sm text-gray-600">{collection.description || 'Aucune description'}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">Aucune collection publique disponible.</p>
                            )}
                        </div>
                    </article>
                </section>
            </div>
        </div>
    );
}
