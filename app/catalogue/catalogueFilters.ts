import type { Cocktail, Ingredient } from '../lib/data';

export type AlcoholFilter = 'all' | 'alcohol' | 'no-alcohol';
export type DifficultyFilter = 'all' | Cocktail['difficulty'];
export type SortOption =
    | 'name-asc'
    | 'name-desc'
    | 'duration-asc'
    | 'duration-desc'
    | 'favorites-first';

export interface RawCocktail {
    id: string | number;
    name?: unknown;
    description?: unknown;
    difficulty?: unknown;
    duration?: unknown;
    prep_time?: unknown;
    alcohol?: unknown;
    alcoholic?: unknown;
    isAlcoholic?: unknown;
    type?: unknown;
    color?: unknown;
    image?: unknown;
    tags?: unknown;
    ingredients?: unknown;
    instructions?: unknown;
    steps?: unknown;
    status?: unknown;
    created_by_id?: unknown;
}

export interface CatalogueFilterState {
    search: string;
    alcoholFilter: AlcoholFilter;
    difficultyFilter: DifficultyFilter;
    sortBy: SortOption;
}

interface FilterContext {
    favoriteIds?: Set<string>;
}

const DEFAULT_COLOR = '#EF4444';
const DEFAULT_DURATION = '5 min';
const DEFAULT_NAME = 'Cocktail';

export const DEFAULT_SORT: SortOption = 'name-asc';

export const ALCOHOL_FILTERS: Array<{ id: AlcoholFilter; label: string }> = [
    { id: 'all', label: 'Tout' },
    { id: 'alcohol', label: 'Avec alcool' },
    { id: 'no-alcohol', label: 'Sans alcool' },
];

export const DIFFICULTY_FILTERS: Array<{ id: DifficultyFilter; label: string }> = [
    { id: 'all', label: 'Toutes difficultes' },
    { id: 'Facile', label: 'Facile' },
    { id: 'Moyen', label: 'Moyen' },
    { id: 'Difficile', label: 'Difficile' },
];

export const SORT_OPTIONS: Array<{ id: SortOption; label: string }> = [
    { id: 'favorites-first', label: 'Favoris d abord' },
    { id: 'name-asc', label: 'Nom (A -> Z)' },
    { id: 'name-desc', label: 'Nom (Z -> A)' },
    { id: 'duration-asc', label: 'Temps (rapide -> long)' },
    { id: 'duration-desc', label: 'Temps (long -> rapide)' },
];

function safeJsonParse(value: string): unknown {
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

export function normalizeText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function parseIngredients(value: unknown): Ingredient[] {
    const parsedValue = typeof value === 'string' ? safeJsonParse(value) : value;

    if (!Array.isArray(parsedValue)) {
        return [];
    }

    return parsedValue
        .map((ingredient): Ingredient | null => {
            if (typeof ingredient === 'string') {
                const name = ingredient.trim();
                return name ? { name, amount: '' } : null;
            }

            if (!ingredient || typeof ingredient !== 'object') {
                return null;
            }

            const source = ingredient as Record<string, unknown>;
            const name = String(source.name ?? source.ingredient ?? '').trim();
            const amount = String(source.amount ?? source.quantity ?? '').trim();

            if (!name) {
                return null;
            }

            return { name, amount };
        })
        .filter((ingredient): ingredient is Ingredient => ingredient !== null);
}

function parseSteps(value: unknown): string[] {
    const parsedValue = typeof value === 'string' ? safeJsonParse(value) : value;

    if (Array.isArray(parsedValue)) {
        return parsedValue
            .map((step): string => {
                if (typeof step === 'string') {
                    return step.trim();
                }

                if (!step || typeof step !== 'object') {
                    return '';
                }

                const source = step as Record<string, unknown>;
                return String(source.description ?? source.step ?? '').trim();
            })
            .filter(Boolean);
    }

    if (typeof value === 'string' && value.trim()) {
        return [value.trim()];
    }

    return [];
}

function parseTags(value: unknown, ingredients: Ingredient[]): string[] {
    const fromArray = (data: unknown[]): string[] =>
        data
            .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
            .filter(Boolean);

    let tags: string[] = [];

    if (Array.isArray(value)) {
        tags = fromArray(value);
    } else if (typeof value === 'string' && value.trim()) {
        const parsedValue = safeJsonParse(value);
        if (Array.isArray(parsedValue)) {
            tags = fromArray(parsedValue);
        } else {
            tags = value
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean);
        }
    }

    if (!tags.length) {
        tags = ingredients.map((ingredient) => ingredient.name).slice(0, 4);
    }

    return Array.from(new Set(tags));
}

function parseDifficulty(value: unknown): Cocktail['difficulty'] {
    const normalizedValue = normalizeText(String(value ?? ''));

    if (normalizedValue.includes('facile') || normalizedValue.includes('easy') || normalizedValue === '1') {
        return 'Facile';
    }

    if (normalizedValue.includes('difficile') || normalizedValue.includes('hard') || normalizedValue === '5') {
        return 'Difficile';
    }

    return 'Moyen';
}

function parseDuration(value: unknown): string {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        return `${value} min`;
    }

    if (typeof value === 'string') {
        const trimmedValue = value.trim();
        if (!trimmedValue) {
            return DEFAULT_DURATION;
        }

        const hasDigits = /\d/.test(trimmedValue);
        if (hasDigits && !normalizeText(trimmedValue).includes('min')) {
            return `${trimmedValue} min`;
        }

        return trimmedValue;
    }

    return DEFAULT_DURATION;
}

function parseBoolean(value: unknown): boolean | null {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value !== 0;
    }

    if (typeof value !== 'string') {
        return null;
    }

    const normalizedValue = normalizeText(value);
    const spacedValue = normalizedValue.replace(/[_-]+/g, ' ');
    const compactValue = spacedValue.replace(/\s+/g, '');

    if (
        spacedValue.includes('sans alcool') ||
        compactValue.includes('sansalcool') ||
        spacedValue.includes('non alcoholic') ||
        compactValue.includes('nonalcoholic') ||
        spacedValue.includes('no alcohol') ||
        compactValue.includes('noalcohol') ||
        spacedValue.includes('non alcoolise') ||
        compactValue.includes('nonalcoolise') ||
        compactValue.includes('mocktail') ||
        compactValue.includes('virgin')
    ) {
        return false;
    }

    if (
        spacedValue.includes('avec alcool') ||
        compactValue.includes('avecalcool') ||
        spacedValue.includes('with alcohol') ||
        compactValue.includes('withalcohol') ||
        compactValue.includes('alcoholic') ||
        compactValue.includes('alcoolise') ||
        compactValue === 'cocktail'
    ) {
        return true;
    }

    if (compactValue === 'true' || compactValue === '1' || compactValue === 'yes') {
        return true;
    }

    if (compactValue === 'false' || compactValue === '0' || compactValue === 'no') {
        return false;
    }

    return null;
}

function inferAlcohol(raw: RawCocktail): boolean {
    const fromType = parseBoolean(raw.type);
    if (fromType !== null) {
        return fromType;
    }

    const explicitAlcohol =
        parseBoolean(raw.alcohol) ??
        parseBoolean(raw.isAlcoholic) ??
        parseBoolean(raw.alcoholic);

    return explicitAlcohol ?? true;
}

function getDurationInMinutes(duration: string): number {
    const matchedNumber = duration.match(/\d+/);
    return matchedNumber ? Number(matchedNumber[0]) : Number.MAX_SAFE_INTEGER;
}

export function mapRawCocktail(raw: RawCocktail): Cocktail {
    const ingredients = parseIngredients(raw.ingredients);

    return {
        id: String(raw.id),
        name: String(raw.name ?? '').trim() || DEFAULT_NAME,
        description: String(raw.description ?? '').trim(),
        difficulty: parseDifficulty(raw.difficulty),
        duration: parseDuration(raw.duration ?? raw.prep_time),
        alcohol: inferAlcohol(raw),
        color:
            typeof raw.color === 'string' && raw.color.trim()
                ? raw.color
                : DEFAULT_COLOR,
        image:
            typeof raw.image === 'string' && raw.image.trim() ? raw.image : '',
        tags: parseTags(raw.tags, ingredients),
        ingredients,
        steps: parseSteps(raw.instructions ?? raw.steps),
    };
}

export function applyCatalogueFilters(
    cocktails: Cocktail[],
    filters: CatalogueFilterState,
    context: FilterContext = {}
): Cocktail[] {
    const normalizedQuery = normalizeText(filters.search);
    const favoriteIds = context.favoriteIds ?? new Set<string>();

    const filtered = cocktails.filter((cocktail) => {
        if (normalizedQuery) {
            const searchableText = [
                cocktail.name,
                cocktail.description,
                cocktail.tags.join(' '),
                cocktail.ingredients
                    .map((ingredient) => `${ingredient.name} ${ingredient.amount}`)
                    .join(' '),
            ].join(' ');

            if (!normalizeText(searchableText).includes(normalizedQuery)) {
                return false;
            }
        }

        if (filters.alcoholFilter === 'alcohol' && !cocktail.alcohol) {
            return false;
        }

        if (filters.alcoholFilter === 'no-alcohol' && cocktail.alcohol) {
            return false;
        }

        if (filters.difficultyFilter !== 'all' && cocktail.difficulty !== filters.difficultyFilter) {
            return false;
        }

        return true;
    });

    return [...filtered].sort((a, b) => {
        if (filters.sortBy === 'favorites-first') {
            const aFavorite = favoriteIds.has(a.id);
            const bFavorite = favoriteIds.has(b.id);

            if (aFavorite !== bFavorite) {
                return aFavorite ? -1 : 1;
            }

            return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
        }

        if (filters.sortBy === 'name-asc') {
            return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
        }

        if (filters.sortBy === 'name-desc') {
            return b.name.localeCompare(a.name, 'fr', { sensitivity: 'base' });
        }

        const aDuration = getDurationInMinutes(a.duration);
        const bDuration = getDurationInMinutes(b.duration);

        if (filters.sortBy === 'duration-asc') {
            return aDuration - bDuration;
        }

        return bDuration - aDuration;
    });
}

export function hasActiveFilters(filters: CatalogueFilterState): boolean {
    return (
        filters.search.trim().length > 0 ||
        filters.alcoholFilter !== 'all' ||
        filters.difficultyFilter !== 'all' ||
        filters.sortBy !== DEFAULT_SORT
    );
}

export function getActiveFilterLabels(filters: CatalogueFilterState): string[] {
    const labels: string[] = [];

    if (filters.search.trim()) {
        labels.push(`Recherche: "${filters.search.trim()}"`);
    }

    if (filters.alcoholFilter !== 'all') {
        labels.push(filters.alcoholFilter === 'alcohol' ? 'Avec alcool' : 'Sans alcool');
    }

    if (filters.difficultyFilter !== 'all') {
        labels.push(filters.difficultyFilter);
    }

    if (filters.sortBy !== DEFAULT_SORT) {
        const sortLabel = SORT_OPTIONS.find((option) => option.id === filters.sortBy);
        if (sortLabel) {
            labels.push(sortLabel.label);
        }
    }

    return labels;
}

function extractIdFromFavoriteEntry(entry: unknown): string | null {
    if (typeof entry === 'string' || typeof entry === 'number') {
        const normalized = String(entry).trim();
        return normalized ? normalized : null;
    }

    if (!entry || typeof entry !== 'object') {
        return null;
    }

    const candidate = entry as Record<string, unknown>;
    const rawId =
        candidate.cocktailId ??
        candidate.cocktail_id ??
        candidate.id ??
        (candidate.cocktail &&
        typeof candidate.cocktail === 'object' &&
        (candidate.cocktail as Record<string, unknown>).id
            ? (candidate.cocktail as Record<string, unknown>).id
            : null);

    if (rawId === null || rawId === undefined) {
        return null;
    }

    const normalized = String(rawId).trim();
    return normalized ? normalized : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }

    return value as Record<string, unknown>;
}

function toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

function toBoolean(value: unknown): boolean | null {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        const normalized = normalizeText(value);
        if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
            return true;
        }

        if (normalized === 'false' || normalized === '0' || normalized === 'no') {
            return false;
        }
    }

    return null;
}

function extractFavoritesEntries(data: unknown): unknown[] {
    if (Array.isArray(data)) {
        return data;
    }

    const root = asRecord(data);
    if (!root) {
        return [];
    }

    const topLevelCandidates = [
        root.favorites,
        root.items,
        root.results,
        root.data,
        root.cocktails,
        root.rows,
    ];

    for (const candidate of topLevelCandidates) {
        if (Array.isArray(candidate)) {
            return candidate;
        }

        const nested = asRecord(candidate);
        if (!nested) {
            continue;
        }

        const nestedCandidates = [
            nested.favorites,
            nested.items,
            nested.results,
            nested.data,
            nested.cocktails,
            nested.rows,
        ];

        for (const nestedCandidate of nestedCandidates) {
            if (Array.isArray(nestedCandidate)) {
                return nestedCandidate;
            }
        }
    }

    return [];
}

function extractPaginationSource(data: unknown): Record<string, unknown> | null {
    const root = asRecord(data);
    if (!root) {
        return null;
    }

    const pagination = asRecord(root.pagination);
    if (pagination) {
        return pagination;
    }

    const meta = asRecord(root.meta);
    if (meta) {
        return meta;
    }

    return root;
}

export function getNextFavoritesPage(data: unknown, currentPage: number): number | null {
    const source = extractPaginationSource(data);
    if (!source) {
        return null;
    }

    const explicitNext = toNumber(source.nextPage ?? source.next_page ?? source.next);
    if (explicitNext !== null) {
        return explicitNext > currentPage ? explicitNext : null;
    }

    const page =
        toNumber(source.page ?? source.currentPage ?? source.current_page) ??
        currentPage;
    const totalPages = toNumber(
        source.totalPages ?? source.total_pages ?? source.lastPage ?? source.last_page
    );

    if (totalPages !== null) {
        return page < totalPages ? page + 1 : null;
    }

    const hasNext = toBoolean(
        source.hasNext ?? source.has_next ?? source.hasMore ?? source.has_more
    );
    if (hasNext === true) {
        return page + 1;
    }

    return null;
}

export function extractFavoriteIds(data: unknown): Set<string> {
    const entries = extractFavoritesEntries(data);

    return new Set(
        entries
            .map((entry) => extractIdFromFavoriteEntry(entry))
            .filter((id): id is string => id !== null)
    );
}
