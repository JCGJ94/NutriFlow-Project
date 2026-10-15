import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';
import { IngredientCategory } from '@nutriflow/shared';

type RouteContext = { params: Promise<{ planId: string }> };

// ---- Helpers -----------------------------------------------------------

function mapShoppingListItem(item: Record<string, any>) {
    const ing = Array.isArray(item.ingredients) ? item.ingredients[0] : item.ingredients;
    return {
        id: item.id,
        ingredientId: item.ingredient_id ?? null,
        ingredientName: item.ingredient_id ? (ing?.name ?? 'Unknown') : item.custom_name,
        ingredientNameEn: item.ingredient_id ? (ing?.name_en ?? ing?.name) : item.custom_name,
        category: item.ingredient_id ? (ing?.category ?? IngredientCategory.CONDIMENT) : IngredientCategory.CONDIMENT,
        totalGrams: item.total_grams ? Number(item.total_grams) : undefined,
        isChecked: item.is_checked,
        isCustom: !item.ingredient_id,
    };
}

async function generateAndSave(sb: any, planId: string) {
    // Get all meal items for this plan with ingredient details
    const { data: items, error: itemsError } = await sb
        .from('plan_meal_items')
        .select(`
            ingredient_id,
            grams,
            plan_meals!inner (plan_id),
            ingredients (id, name, name_en, category)
        `)
        .eq('plan_meals.plan_id', planId);

    if (itemsError) {
        throw new Error(`Failed to fetch meal items: ${itemsError.message}`);
    }

    // Aggregate by ingredient
    const aggregated = new Map<string, any>();
    for (const item of items ?? []) {
        const ingredientId = item.ingredient_id;
        const ingredient = Array.isArray(item.ingredients) ? item.ingredients[0] : item.ingredients;

        if (aggregated.has(ingredientId)) {
            aggregated.get(ingredientId).totalGrams += Number(item.grams);
        } else {
            aggregated.set(ingredientId, {
                ingredientId,
                ingredientName: (ingredient as any)?.name ?? 'Unknown',
                ingredientNameEn: (ingredient as any)?.name_en ?? (ingredient as any)?.name,
                category: (ingredient as any)?.category ?? IngredientCategory.CONDIMENT,
                totalGrams: Number(item.grams),
            });
        }
    }

    // Create shopping list record
    const { data: newList, error: createError } = await sb
        .from('shopping_lists')
        .insert({ plan_id: planId })
        .select()
        .single();

    if (createError) {
        throw new Error(`Failed to create shopping list: ${createError.message}`);
    }

    // Insert aggregated items
    const itemInserts = Array.from(aggregated.values()).map((item) => ({
        shopping_list_id: newList.id,
        ingredient_id: item.ingredientId,
        total_grams: item.totalGrams,
        is_checked: false,
    }));

    if (itemInserts.length > 0) {
        const { error: insertError } = await sb
            .from('shopping_list_items')
            .insert(itemInserts);

        if (insertError) {
            throw new Error(`Failed to insert shopping list items: ${insertError.message}`);
        }
    }

    // Return the freshly created list
    return getForPlan(sb, planId);
}

async function getForPlan(sb: any, planId: string) {
    const { data: existingList, error } = await sb
        .from('shopping_lists')
        .select(`
            id,
            plan_id,
            generated_at,
            plans (week_start, user_id),
            items:shopping_list_items (
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
            )
        `)
        .eq('plan_id', planId)
        .maybeSingle();

    if (error) throw new Error(`Failed to fetch shopping list: ${error.message}`);

    return existingList;
}

// ---- GET /api/shopping-list/[planId] -----------------------------------

export async function GET(_req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
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

        let listData = await getForPlan(sb, planId);

        // If no list exists yet, generate from meal items
        if (!listData) {
            listData = await generateAndSave(sb, planId);
        }

        return NextResponse.json({
            planId: (listData as any).plan_id,
            weekStart: ((listData as any).plans as any)?.week_start,
            items: ((listData as any).items as any[]).map(mapShoppingListItem),
            generatedAt: (listData as any).generated_at,
        });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('GET /api/shopping-list/[planId] error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
