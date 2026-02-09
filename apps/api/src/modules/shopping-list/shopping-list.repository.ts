import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../config/supabase.module';
import { IngredientCategory } from '@nutriflow/shared';

export interface ShoppingListItemDto {
    id: string;
    ingredientId: string | null;
    ingredientName: string;
    category: IngredientCategory;
    totalGrams?: number;
    isChecked: boolean;
    isCustom: boolean;
}

export interface ShoppingListDto {
    planId: string;
    weekStart: string;
    items: ShoppingListItemDto[];
    generatedAt: Date;
}

@Injectable()
export class ShoppingListRepository {
    constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) { }

    async getForPlan(planId: string): Promise<ShoppingListDto> {
        // 1. Try to get existing list from DB
        const { data: existingList } = await this.supabase
            .from('shopping_lists')
            .select(`
                id,
                plan_id,
                generated_at,
                plans (week_start),
                items:shopping_list_items (
                    id,
                    ingredient_id,
                    total_grams,
                    is_checked,
                    ingredients (
                        id,
                        name,
                        category
                    )
                )
            `)
            .eq('plan_id', planId)
            .maybeSingle();

        if (existingList) {
            return {
                planId: existingList.plan_id,
                weekStart: (existingList.plans as any)?.week_start,
                items: (existingList.items as any[]).map(item => ({
                    id: item.id,
                    ingredientId: item.ingredient_id,
                    ingredientName: item.ingredient_id ? (item.ingredients?.name || 'Unknown') : item.custom_name,
                    category: item.ingredient_id ? (item.ingredients?.category || IngredientCategory.CONDIMENT) : IngredientCategory.CONDIMENT,
                    totalGrams: item.total_grams ? Number(item.total_grams) : undefined,
                    isChecked: item.is_checked,
                    isCustom: !item.ingredient_id
                })),
                generatedAt: new Date(existingList.generated_at)
            };
        }

        // 2. If not found, generate and save
        return this.generateAndSave(planId);
    }

    private async generateAndSave(planId: string): Promise<ShoppingListDto> {
        // Get plan info
        const { data: plan, error: planError } = await this.supabase
            .from('plans')
            .select('week_start')
            .eq('id', planId)
            .single();

        console.log('Generating list for plan starting:', plan?.week_start);

        if (planError) throw new Error(`Plan not found: ${planError.message}`);

        // Get all meal items for this plan with ingredient details
        const { data: items, error: itemsError } = await this.supabase
            .from('plan_meal_items')
            .select(`
                ingredient_id,
                grams,
                plan_meals!inner (plan_id),
                ingredients (id, name, category)
            `)
            .eq('plan_meals.plan_id', planId);

        if (itemsError) throw new Error(`Failed to fetch items: ${itemsError.message}`);

        // Aggregate by ingredient
        const aggregated = new Map<string, any>();
        for (const item of items || []) {
            const ingredientId = item.ingredient_id;
            const ingredient = Array.isArray(item.ingredients) ? item.ingredients[0] : item.ingredients;

            if (aggregated.has(ingredientId)) {
                aggregated.get(ingredientId).totalGrams += Number(item.grams);
            } else {
                aggregated.set(ingredientId, {
                    ingredientId,
                    ingredientName: (ingredient as any)?.name || 'Unknown',
                    category: (ingredient as any)?.category || IngredientCategory.CONDIMENT,
                    totalGrams: Number(item.grams),
                });
            }
        }

        // 3. Create shopping list record
        const { data: newList, error: createError } = await this.supabase
            .from('shopping_lists')
            .insert({ plan_id: planId })
            .select()
            .single();

        if (createError) throw new Error(`Failed to create shopping list: ${createError.message}`);

        // 4. Create items
        const itemInserts = Array.from(aggregated.values()).map(item => ({
            shopping_list_id: newList.id,
            ingredient_id: item.ingredientId,
            total_grams: item.totalGrams,
            is_checked: false
        }));

        // 5. Return the result
        if (itemInserts.length > 0) {
            const { error: insertItemsError } = await this.supabase
                .from('shopping_list_items')
                .insert(itemInserts);

            if (insertItemsError) throw new Error(`Failed to insert items: ${insertItemsError.message}`);
        }

        // 5. Return the result
        return this.getForPlan(planId);
    }

    async toggleItem(itemId: string, isChecked: boolean): Promise<void> {
        const { error } = await this.supabase
            .from('shopping_list_items')
            .update({ is_checked: isChecked })
            .eq('id', itemId);

        if (error) throw new Error(`Failed to toggle item: ${error.message}`);
    }

    async removeItem(itemId: string): Promise<void> {
        const { error } = await this.supabase
            .from('shopping_list_items')
            .delete()
            .eq('id', itemId);

        if (error) throw new Error(`Failed to remove item: ${error.message}`);
    }

    async addItem(planId: string, item: { ingredientId?: string; customName?: string; grams?: number }): Promise<void> {
        const { data: list } = await this.supabase
            .from('shopping_lists')
            .select('id')
            .eq('plan_id', planId)
            .single();

        if (!list) throw new Error('Shopping list not found');

        const { error } = await this.supabase
            .from('shopping_list_items')
            .insert({
                shopping_list_id: list.id,
                ingredient_id: item.ingredientId || null,
                custom_name: item.customName || null,
                total_grams: item.grams || null,
                is_checked: false
            });

        if (error) throw new Error(`Failed to add item: ${error.message}`);
    }
}
