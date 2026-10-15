import type { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Typed HTTP error thrown by auth guards.
 * Route Handlers catch this and return the appropriate HTTP response.
 */
export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Asserts a valid authenticated user exists in the current request.
 * Throws ApiError(401) if no user is found.
 */
export async function requireUser(sb: SupabaseClient): Promise<User> {
    const {
        data: { user },
        error,
    } = await sb.auth.getUser();

    if (error || !user) {
        throw new ApiError(401, 'Unauthorized');
    }

    return user;
}

/**
 * Asserts the authenticated user has the 'admin' role in app_metadata.
 * Throws ApiError(401) if unauthenticated, ApiError(403) if not admin.
 *
 * Design decision (D3): admin role lives in app_metadata.role — server-trusted,
 * not user-editable — NOT user_metadata.
 */
export async function requireAdminRole(sb: SupabaseClient): Promise<User> {
    const user = await requireUser(sb);

    if (user.app_metadata?.role !== 'admin') {
        throw new ApiError(403, 'Forbidden');
    }

    return user;
}
