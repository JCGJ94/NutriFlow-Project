import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAdminRole, ApiError } from '@/lib/auth/guards';
import { z } from 'zod';

// ---- Zod schema --------------------------------------------------------

const CreateAllergenSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
});

// ---- GET /api/admin/allergens ------------------------------------------

export async function GET(_req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();
        await requireAdminRole(sb);

        const adminSb = getSupabaseAdmin();

        const { data, error } = await adminSb
            .from('allergens')
            .select('*')
            .order('name');

        if (error) {
            throw new Error(`Failed to fetch allergens: ${error.message}`);
        }

        return NextResponse.json(
            (data ?? []).map((a: any) => ({
                id: a.id,
                name: a.name,
                description: a.description,
            })),
        );
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('GET /api/admin/allergens error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ---- POST /api/admin/allergens -----------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();
        await requireAdminRole(sb);

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const parsed = CreateAllergenSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.errors },
                { status: 400 },
            );
        }

        const { name, description } = parsed.data;
        const adminSb = getSupabaseAdmin();

        const { data, error } = await adminSb
            .from('allergens')
            .insert({ name, description })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create allergen: ${error.message}`);
        }

        return NextResponse.json(
            {
                id: (data as any).id,
                name: (data as any).name,
                description: (data as any).description,
            },
            { status: 201 },
        );
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('POST /api/admin/allergens error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
