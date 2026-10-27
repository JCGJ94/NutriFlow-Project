import type { SupabaseClient } from '@supabase/supabase-js';
import type { IngredientData } from '@/lib/diet-engine/types';

/**
 * Allergen ids the user declared in their profile.
 *
 * Throws when the query fails: an empty list means "no allergies", so a swallowed
 * error would silently generate a plan that ignores them.
 */
export async function loadUserAllergenIds(sb: SupabaseClient, userId: string): Promise<string[]> {
    const { data, error } = await sb
        .from('profile_allergens')
        .select('allergen_id')
        .eq('profile_id', userId);

    if (error) throw new Error(`Failed to load allergens: ${error.message}`);

    return (data || []).map((row: { allergen_id: string }) => row.allergen_id);
}

/** Every ingredient with the allergens it contains (from the ingredient_allergens join table). */
export async function loadIngredients(sb: SupabaseClient): Promise<IngredientData[]> {
    const { data, error } = await sb.from('ingredients').select('*, ingredient_allergens(allergen_id)');

    if (error) throw new Error(`Failed to load ingredients: ${error.message}`);

    return (data || []).map((i: any) => ({
        id: i.id,
        name: i.name,
        category: i.category,
        allergenIds: (i.ingredient_allergens || []).map((a: { allergen_id: string }) => a.allergen_id),
        kcalPer100g: i.kcal_per_100g,
        proteinPer100g: i.protein_per_100g,
        carbsPer100g: i.carbs_per_100g,
        fatPer100g: i.fat_per_100g,
        fiberPer100g: i.fiber_per_100g ?? 0,
        isVegan: i.is_vegan ?? false,
        isVegetarian: i.is_vegetarian ?? false,
        dietPatterns: i.diet_patterns || [],
    }));
}
