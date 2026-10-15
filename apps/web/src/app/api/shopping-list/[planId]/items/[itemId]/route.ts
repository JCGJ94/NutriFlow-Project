import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';

type RouteContext = { params: Promise<{ planId: string; itemId: string }> };

// ---- DELETE /api/shopping-list/[planId]/items/[itemId] -----------------

export async function DELETE(_req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
    try {
        const { planId, itemId } = await params;
        const sb = await createClient();
        const user = await requireUser(sb);

        // Check plan ownership
        const { data: plan, error: planError } = await sb
            .from('plans')
            .select('id, user_id')
            .eq('id', planId)
            .single();

        if (planError || !plan || (plan as any).user_id !== user.id) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        // Verify item belongs to this plan's shopping list
        const { data: item, error: itemError } = await sb
            .from('shopping_list_items')
            .select(`
                id,
                shopping_lists (plan_id)
            `)
            .eq('id', itemId)
            .single();

        if (itemError || !item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const itemPlanId = ((item as any).shopping_lists as any)?.plan_id;
        if (itemPlanId !== planId) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const { error: deleteError } = await sb
            .from('shopping_list_items')
            .delete()
            .eq('id', itemId);

        if (deleteError) {
            throw new Error(`Failed to delete item: ${deleteError.message}`);
        }

        return new NextResponse(null, { status: 204 });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('DELETE /api/shopping-list/[planId]/items/[itemId] error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
