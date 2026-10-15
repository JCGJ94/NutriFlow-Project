import { IngredientData } from '../types';

/**
 * Filter out ingredients that contain any of the user's allergens.
 */
export function filterByAllergens(
    ingredients: IngredientData[],
    userAllergenIds: string[],
): IngredientData[] {
    if (userAllergenIds.length === 0) return ingredients;

    const allergenSet = new Set(userAllergenIds);

    return ingredients.filter((ingredient) => {
        const ingredientAllergens = ingredient.allergenIds || [];
        return !ingredientAllergens.some((id) => allergenSet.has(id));
    });
}
