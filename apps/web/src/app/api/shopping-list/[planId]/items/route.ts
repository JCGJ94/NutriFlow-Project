import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';
import { IngredientCategory } from '@nutriflow/shared';
import { z } from 'zod';

type RouteContext = { params: Promise<{ planId: string }> };

const AddItemSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    quantity: z.string().optional(),
    ingredientId: z.string().optional(),
    grams: z.number().optional(),
});

// ---- POST /api/shopping-list/[planId]/items ----------------------------

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

        const parsed = AddItemSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.errors },
                { status: 400 },
            );
        }

        const dto = parsed.data;

        // Find or ensure shopping list exists for this plan
        const { data: list, error: listError } = await sb
            .from('shopping_lists')
            .select('id')
            .eq('plan_id', planId)
            .single();

        if (listError || !list) {
            return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 });
        }

        const { data: newItem, error: insertError } = await sb
            .from('shopping_list_items')
            .insert({
                shopping_list_id: (list as any).id,
                ingredient_id: dto.ingredientId ?? null,
                custom_name: dto.name,
                total_grams: dto.grams ?? 0,
                is_checked: false,
            })
            .select(`
                id,
                custom_name,
                ingredient_id,
                total_grams,
                is_checked,
                ingredients (
                    id,
                    name,
                    name_en,
                    category
                )
            `)
            .single();

        if (insertError) {
            throw new Error(`Failed to add item: ${insertError.message}`);
        }

        const ing = Array.isArray((newItem as any).ingredients)
            ? (newItem as any).ingredients[0]
            : (newItem as any).ingredients;

        return NextResponse.json(
            {
                id: (newItem as any).id,
                ingredientId: (newItem as any).ingredient_id ?? null,
                ingredientName: (newItem as any).ingredient_id ? (ing?.name ?? 'Unknown') : (newItem as any).custom_name,
                ingredientNameEn: (newItem as any).ingredient_id ? (ing?.name_en ?? ing?.name) : (newItem as any).custom_name,
                category: (newItem as any).ingredient_id ? (ing?.category ?? IngredientCategory.CONDIMENT) : IngredientCategory.CONDIMENT,
                totalGrams: (newItem as any).total_grams ? Number((newItem as any).total_grams) : undefined,
                isChecked: (newItem as any).is_checked,
                isCustom: !(newItem as any).ingredient_id,
            },
            { status: 201 },
        );
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('POST /api/shopping-list/[planId]/items error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
