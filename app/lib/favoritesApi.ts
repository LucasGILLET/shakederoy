import { apiFetch } from './api';

interface FavoritesRequestOptions {
  headers?: HeadersInit;
  page?: number;
}

export async function fetchFavoritesPage(options: FavoritesRequestOptions = {}): Promise<unknown> {
  const { headers, page } = options;
  const suffix = page && page > 1 ? `?page=${page}` : '';
  return apiFetch<unknown>(`/users/favorites${suffix}`, { headers });
}

export async function toggleFavorite(
  cocktailId: string,
  options: Omit<FavoritesRequestOptions, 'page'> = {}
): Promise<{ action: 'added' | 'removed' }> {
  const { headers } = options;
  return apiFetch<{ action: 'added' | 'removed' }>(`/users/favorites/toggle`, {
    method: 'POST',
    body: JSON.stringify({ cocktailId }),
    headers,
  });
}

export async function removeFavorite(
  cocktailId: string,
  options: Omit<FavoritesRequestOptions, 'page'> = {}
): Promise<void> {
  const result = await toggleFavorite(cocktailId, options);

  if (result.action !== 'removed') {
    await toggleFavorite(cocktailId, options);
  }
}
