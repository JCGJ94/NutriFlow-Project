import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAdminRole, ApiError } from '@/lib/auth/guards';
import { z } from 'zod';

type RouteContext = { params: Promise<{ id: string }> };

// ---- Zod schema --------------------------------------------------------

const UpdateAllergenSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
});

// ---- PUT /api/admin/allergens/[id] -------------------------------------

export async function PUT(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
    try {
        const { id } = await params;
        const sb = await createClient();
        await requireAdminRole(sb);

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const parsed = UpdateAllergenSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.errors },
                { status: 400 },
            );
        }

        const adminSb = getSupabaseAdmin();

        const updateData: Record<string, any> = {};
        if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
        if (parsed.data.description !== undefined) updateData.description = parsed.data.description;

        const { data, error } = await adminSb
            .from('allergens')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Allergen not found' }, { status: 404 });
            }
            throw new Error(`Failed to update allergen: ${error.message}`);
        }

        return NextResponse.json({
            id: (data as any).id,
            name: (data as any).name,
            description: (data as any).description,
        });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('PUT /api/admin/allergens/[id] error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ---- DELETE /api/admin/allergens/[id] ----------------------------------

export async function DELETE(_req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
    try {
        const { id } = await params;
        const sb = await createClient();
        await requireAdminRole(sb);

        const adminSb = getSupabaseAdmin();

        const { error } = await adminSb
            .from('allergens')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete allergen: ${error.message}`);
        }

        return new NextResponse(null, { status: 204 });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('DELETE /api/admin/allergens/[id] error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
