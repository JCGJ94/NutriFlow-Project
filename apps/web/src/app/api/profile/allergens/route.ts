import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';
import { z } from 'zod';

const SetAllergensSchema = z.object({
    allergenIds: z.array(z.string()),
});

function mapAllergenRow(row: Record<string, unknown>) {
    const allergen = row.allergens as Record<string, unknown>;
    return {
        id: allergen.id,
        name: allergen.name,
        description: allergen.description ?? null,
    };
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();
        const user = await requireUser(sb);

        const { data, error } = await sb
            .from('profile_allergens')
            .select(`
                allergen_id,
                allergens (
                    id,
                    name,
                    description
                )
            `)
            .eq('profile_id', user.id);

        if (error) {
            throw new Error(`Failed to fetch allergens: ${error.message}`);
        }

        const allergens = (data || []).map((row) => mapAllergenRow(row as Record<string, unknown>));
        return NextResponse.json({ allergens });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('GET /api/profile/allergens error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();
        const user = await requireUser(sb);

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const parsed = SetAllergensSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'allergenIds must be an array of strings' },
                { status: 400 },
            );
        }

        const { allergenIds } = parsed.data;

        // Replace: delete then insert
        await sb.from('profile_allergens').delete().eq('profile_id', user.id);

        if (allergenIds.length > 0) {
            const rows = allergenIds.map((allergenId) => ({
                profile_id: user.id,
                allergen_id: allergenId,
            }));
            const { error: insertError } = await sb.from('profile_allergens').insert(rows);
            if (insertError) {
                throw new Error(`Failed to set allergens: ${insertError.message}`);
            }
        }

        // Return updated list
        const { data, error } = await sb
            .from('profile_allergens')
            .select(`
                allergen_id,
                allergens (
                    id,
                    name,
                    description
                )
            `)
            .eq('profile_id', user.id);

        if (error) {
            throw new Error(`Failed to fetch updated allergens: ${error.message}`);
        }

        const allergens = (data || []).map((row) => mapAllergenRow(row as Record<string, unknown>));
        return NextResponse.json({ allergens });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('PUT /api/profile/allergens error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
