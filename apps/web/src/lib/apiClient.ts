import { createClient as createBrowserClient } from '@/lib/supabase/client';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiClientOptions extends RequestInit {
    params?: Record<string, string>;
}

/**
 * Slice 2 — Profiles + Ingredients Route Handlers are now local.
 * Slice 3 — Plans + Exercise Plans Route Handlers are now local.
 * Slice 4 — Shopping List + Admin Route Handlers are now local.
 * Slice 5 — RAG Route Handlers are now local.
 * Paths listed here bypass the Railway URL and route to local /api/ handlers
 * when called server-side (client-side already hits /api/* which Next.js routes
 * to the real handler, taking priority over rewrites).
 */
const LOCAL_API_PREFIXES = [
    'profile',
    'me/profile',
    'me/allergens',
    'allergens',
    'ingredients',
    // Slice 3
    'plans',
    'exercise-plans',
    // Slice 4
    'shopping-list',
    'admin',
    // Slice 5
    'rag',
];

function isLocalApiPath(endpoint: string): boolean {
    const clean = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return LOCAL_API_PREFIXES.some(
        (prefix) => clean === prefix || clean.startsWith(`${prefix}/`),
    );
}

class ApiClient {
    private getBaseUrl(endpoint: string): string {
        const isServer = typeof window === 'undefined';
        // Remove leading slash if present to avoid double slashes when joining
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

        if (isServer) {
            // Slice 2+: endpoints with local Route Handlers use self-referential URL.
            // Next.js requires an absolute URL for server-side fetch within the same app.
            if (isLocalApiPath(cleanEndpoint)) {
                const host =
                    process.env.NEXT_PUBLIC_SITE_URL ||
                    process.env.VERCEL_URL ||
                    'http://localhost:3000';
                const base = host.startsWith('http') ? host : `https://${host}`;
                return `${base.replace(/\/$/, '')}/api/${cleanEndpoint}`;
            }

            // Legacy: Hit the NestJS Railway backend directly
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

        // Client-side: Use (relative) Next.js rewrites / Route Handlers
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
                } catch { /* Ignore parse error */ }
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
