import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/allergens
 * Public endpoint — no auth required.
 * Returns the full master list of allergens from the allergens table.
 */
export async function GET(_req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();

        const { data, error } = await sb.from('allergens').select('*').order('name');

        if (error) {
            throw new Error(`Failed to fetch allergens: ${error.message}`);
        }

        const allergens = (data || []).map((row: Record<string, unknown>) => ({
            id: row.id,
            name: row.name,
            description: row.description ?? null,
        }));

        return NextResponse.json({ allergens });
    } catch (err) {
        console.error('GET /api/allergens error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
