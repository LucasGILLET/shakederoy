import { apiFetch, apiFetchList } from './api';

export interface Collection {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export interface CollectionCocktail {
    id: string;
    collection_id: string;
    cocktail_id: string;
    created_at: string;
    updated_at: string;
}

export function listMyCollections() {
    return apiFetchList<Collection>('/users/collections');
}

export function listPublicCollections() {
    return apiFetchList<Collection>('/users/collections/public');
}

export function createCollection(payload: { name: string; description?: string; isPublic?: boolean }) {
    return apiFetch<Collection>('/users/collections/create', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export function listCollectionCocktails(collectionId: string) {
    return apiFetchList<CollectionCocktail>(`/users/collections/${collectionId}/cocktails`);
}

export function addCocktailToCollection(collectionId: string, cocktailId: string) {
    return apiFetch<CollectionCocktail>(`/users/collections/${collectionId}/cocktails`, {
        method: 'POST',
        body: JSON.stringify({ cocktailId }),
    });
}
