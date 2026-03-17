const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, '') ?? '';

interface FetchOptions extends RequestInit {
    headers?: HeadersInit;
}

interface PaginatedResponse<T> {
    data: T[];
    page: number;
    size: number;
    total: number;
    totalPages: number;
}

type ApiErrorBody = {
    message?: string;
    error?: unknown;
    issues?: unknown;
};

function buildErrorMessage(response: Response, errorBody: ApiErrorBody) {
    if (typeof errorBody.message === 'string' && errorBody.message.trim()) {
        return errorBody.message;
    }

    if (errorBody.error) {
        return JSON.stringify(errorBody.error);
    }

    if (errorBody.issues) {
        return JSON.stringify(errorBody.issues);
    }

    return `Error ${response.status}: ${response.statusText}`;
}

function buildApiUrl(endpoint: string) {
    if (!API_BASE_URL) {
        throw new Error('NEXT_PUBLIC_BACKEND_URL is not configured.');
    }

    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${normalizedEndpoint}`;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { headers, ...rest } = options;

    const config: FetchOptions = {
        ...rest,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    };

    const response = await fetch(buildApiUrl(endpoint), config);

    if (!response.ok) {
        const errorText = await response.text();
        let errorBody: ApiErrorBody;

        try {
            errorBody = JSON.parse(errorText) as ApiErrorBody;
        } catch {
            errorBody = { message: errorText };
        }

        throw new Error(buildErrorMessage(response, errorBody));
    }

    if (response.status === 204) {
        return {} as T;
    }

    return await response.json();
}

function isPaginatedResponse<T>(value: unknown): value is PaginatedResponse<T> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }

    return Array.isArray((value as { data?: unknown }).data);
}

export async function apiFetchList<T>(endpoint: string, options: FetchOptions = {}): Promise<T[]> {
    const response = await apiFetch<T[] | PaginatedResponse<T>>(endpoint, options);

    if (Array.isArray(response)) {
        return response;
    }

    if (isPaginatedResponse<T>(response)) {
        return response.data;
    }

    throw new Error(`Unexpected list response for ${endpoint}.`);
}
