const API_BASE_URL = '/api';

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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

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
