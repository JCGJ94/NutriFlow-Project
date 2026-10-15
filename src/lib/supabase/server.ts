import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { getSupabaseEnv } from './env';

export async function createClient() {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const { url, key } = getSupabaseEnv();

    return createServerClient(url, key, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
                try {
                    cookieStore.set({ name, value, ...options });
                } catch {
                    // Handle cookies in read-only contexts
                }
            },
            remove(name: string, options: CookieOptions) {
                try {
                    cookieStore.set({ name, value: '', ...options });
                } catch {
                    // Handle cookies in read-only contexts
                }
            },
        },
    });
}
