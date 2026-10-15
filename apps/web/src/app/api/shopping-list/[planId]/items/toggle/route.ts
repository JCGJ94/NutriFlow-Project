import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';
import { z } from 'zod';

type RouteContext = { params: Promise<{ planId: string }> };

const ToggleSchema = z.object({
    ingredientName: z.string().min(1, 'ingredientName is required'),
});

// ---- POST /api/shopping-list/[planId]/items/toggle ---------------------

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

        const parsed = ToggleSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.errors },
                { status: 400 },
            );
        }

        const { ingredientName } = parsed.data;

        // Get the shopping list for this plan
        const { data: list, error: listError } = await sb
            .from('shopping_lists')
            .select('id')
            .eq('plan_id', planId)
            .single();

        if (listError || !list) {
            return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 });
        }

        // Find the item by ingredient name (custom_name or via ingredient join)
        // We look in shopping_list_items joined with ingredients
        const { data: itemRows, error: itemError } = await sb
            .from('shopping_list_items')
            .select(`
                id,
                is_checked,
                custom_name,
                ingredient_id,
                ingredients (name)
            `)
            .eq('shopping_list_id', (list as any).id);

        if (itemError) {
            throw new Error(`Failed to fetch items: ${itemError.message}`);
        }

        const matchedItem = (itemRows ?? []).find((item: any) => {
            const ingName = Array.isArray(item.ingredients)
                ? item.ingredients[0]?.name
                : item.ingredients?.name;
            const resolvedName = item.ingredient_id ? ingName : item.custom_name;
            return resolvedName?.toLowerCase() === ingredientName.toLowerCase();
        });

        if (!matchedItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const newChecked = !(matchedItem as any).is_checked;

        const { data: updated, error: updateError } = await sb
            .from('shopping_list_items')
            .update({ is_checked: newChecked })
            .eq('id', (matchedItem as any).id)
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
