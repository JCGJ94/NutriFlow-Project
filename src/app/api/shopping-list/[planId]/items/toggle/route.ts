import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';
import { ToggleShoppingItemSchema } from '@/lib/contracts';

type RouteContext = { params: Promise<{ planId: string }> };

// ---- POST /api/shopping-list/[planId]/items/toggle ---------------------
// Sets the checked state of one item. The item is identified by id (names can
// repeat and custom items have no ingredient) and the new state is explicit,
// so retries and optimistic UI updates are idempotent.

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
    try {
        const { planId } = await params;
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

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const parsed = ToggleShoppingItemSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.errors },
                { status: 400 },
            );
        }

        const { itemId, isChecked } = parsed.data;

        // Verify the item belongs to this plan's shopping list
        const { data: item, error: itemError } = await sb
            .from('shopping_list_items')
            .select(`
                id,
                shopping_lists (plan_id)
            `)
            .eq('id', itemId)
            .single();

        const list = (item as any)?.shopping_lists;
        const itemPlanId = Array.isArray(list) ? list[0]?.plan_id : list?.plan_id;

        if (itemError || !item || itemPlanId !== planId) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const { data: updated, error: updateError } = await sb
            .from('shopping_list_items')
            .update({ is_checked: isChecked })
            .eq('id', itemId)
            .select('id, is_checked')
            .single();

        if (updateError) {
            throw new Error(`Failed to toggle item: ${updateError.message}`);
        }

        return NextResponse.json({ checked: (updated as any).is_checked });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('POST /api/shopping-list/[planId]/items/toggle error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
