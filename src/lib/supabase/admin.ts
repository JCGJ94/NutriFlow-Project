import { createClient, SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adminClient: SupabaseClient<any> | null = null;

/**
 * Service-role Supabase client that bypasses RLS.
 * Use only in server-side contexts (Route Handlers, Server Actions).
 * Never expose to the browser.
 *
 * Typed as SupabaseClient<any> because no generated Database types exist yet.
 * All table mutations accept any object — type safety is enforced at the Zod layer.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseAdmin(): SupabaseClient<any> {
    if (!adminClient) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !serviceKey) {
            throw new Error(
                'Missing Supabase admin credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.',
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        adminClient = createClient<any>(url, serviceKey);
    }

    return adminClient;
}

/** Reset cached client (for tests only). */
export function _resetAdminClientCache(): void {
    adminClient = null;
}

