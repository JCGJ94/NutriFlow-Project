import { createClient as createBrowserClient } from '@/lib/supabase/client';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiClientOptions extends RequestInit {
    params?: Record<string, string>;
}

class ApiClient {
    private getBaseUrl(endpoint: string): string {
        const isServer = typeof window === 'undefined';
        // Remove leading slash if present to avoid double slashes when joining
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

        if (isServer) {
            // Server-side: Hit the backend directly
            // NEXT_PUBLIC_API_URL is likely http://localhost:3001
            // We assume backend has /v1 prefix based on main.ts global prefix
            let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            // Ensure apiUrl doesn't end with slash
            if (apiUrl.endsWith('/')) {
                apiUrl = apiUrl.slice(0, -1);
            }

            // Backend always uses /v1 prefix globally
            // Check if apiUrl already includes /v1 (e.g. production URL)
            if (!apiUrl.includes('/v1')) {
                apiUrl = `${apiUrl}/v1`;
            }

            return `${apiUrl}/${cleanEndpoint}`;
        }

        // Client-side: Use (relative) Next.js rewrites
        return `/api/${cleanEndpoint}`;
    }

    private async getAuthToken(): Promise<string | null> {
        if (typeof window === 'undefined') {
            // Server-side: Dynamically import to avoid bundling issues
            try {
                const { createClient } = await import('@/lib/supabase/server');
                const supabase = await createClient();
                const { data: { session } } = await supabase.auth.getSession();
                return session?.access_token || null;
            } catch (error) {
                console.error('Error getting server session:', error);
                return null;
            }
        } else {
            // Client-side
            const supabase = createBrowserClient();
            const { data: { session } } = await supabase.auth.getSession();
            return session?.access_token || null;
        }
    }

    async request<T>(endpoint: string, method: RequestMethod, options: ApiClientOptions = {}): Promise<T> {
        const { params, headers, ...customConfig } = options;

        // 1. Build URL
        let url = this.getBaseUrl(endpoint);
        if (params) {
            const searchParams = new URLSearchParams(params);
            url += `?${searchParams.toString()}`;
        }

        // 2. Get Token
        const token = await this.getAuthToken();

        // 3. Build Headers
        const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const contentHeaders: HeadersInit =
            method !== 'GET' && !options.body ? { 'Content-Type': 'application/json' } : {}; // Default JSON if not specified and not GET

        const config: RequestInit = {
            method,
            headers: {
                ...contentHeaders,
                ...authHeaders,
                ...headers,
            },
            ...customConfig,
        };

        // 4. Fetch
        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                // Handle 401/403 specifically if needed, or throw generic error
                if (response.status === 401) {
                    // On client, maybe redirect to login? 
                    // For now just throw.
                }
                // Try to parse error message from body
                let errorMessage = `API Error: ${response.status} ${response.statusText}`;
                try {
                    const text = await response.text();
                    if (text) {
                        const errorBody = JSON.parse(text);
                        errorMessage = errorBody.message || errorMessage;
                    }
                } catch { }
                throw new Error(errorMessage);
            }

            // 5. Parse Response
            if (response.status === 204) return {} as T;

            const text = await response.text();
            return text ? JSON.parse(text) : {} as T;
        } catch (error) {
            console.error(`API Request Failed: ${method} ${url}`, error);
            throw error;
        }
    }

    get<T>(endpoint: string, options?: ApiClientOptions) {
        return this.request<T>(endpoint, 'GET', options);
    }

    post<T>(endpoint: string, body: any, options?: ApiClientOptions) {
        return this.request<T>(endpoint, 'POST', { ...options, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...options?.headers } });
    }

    put<T>(endpoint: string, body: any, options?: ApiClientOptions) {
        return this.request<T>(endpoint, 'PUT', { ...options, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...options?.headers } });
    }

    delete<T>(endpoint: string, options?: ApiClientOptions) {
        return this.request<T>(endpoint, 'DELETE', options);
    }

    patch<T>(endpoint: string, body: any, options?: ApiClientOptions) {
        return this.request<T>(endpoint, 'PATCH', { ...options, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...options?.headers } });
    }
}

export const apiClient = new ApiClient();
