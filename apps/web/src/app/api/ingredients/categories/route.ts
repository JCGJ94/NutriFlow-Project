import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';
import { IngredientCategory } from '@nutriflow/shared';

/**
 * GET /api/ingredients/categories
 * Auth required. Returns the enum values of IngredientCategory.
 */
export async function GET(_req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();
        await requireUser(sb);

        // Categories are a static enum — no DB query needed.
        const categories = Object.values(IngredientCategory);
        return NextResponse.json({ categories });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('GET /api/ingredients/categories error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
