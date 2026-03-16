const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, '') ?? '';

interface FetchOptions extends RequestInit {
    headers?: HeadersInit;
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
