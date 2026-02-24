// Use local proxy to avoid CORS
const API_BASE_URL = '/api';

interface FetchOptions extends RequestInit {
    headers?: HeadersInit;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { headers, body, ...rest } = options;
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    const mergedHeaders: HeadersInit = isFormData
        ? { ...headers }
        : {
              'Content-Type': 'application/json',
              ...headers,
          };

    const config: FetchOptions = {
        ...rest,
        credentials: 'include',
        body,
        headers: mergedHeaders,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorText = await response.text();
            let errorBody;
            try {
                errorBody = JSON.parse(errorText);
            } catch {
                errorBody = { message: errorText };
            }
            
            console.error("API Error Body:", errorBody);
            
            const message = errorBody.message || 
                          (errorBody.error ? JSON.stringify(errorBody.error) : '') ||
                          (errorBody.issues ? JSON.stringify(errorBody.issues) : '') ||
                          `Error ${response.status}: ${response.statusText}`;
                          
            throw new Error(message);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Failed:', error);
        throw error;
    }
}
