import { DietPattern } from '@nutriflow/shared';
import { IngredientData } from '../types';

/**
 * Filter ingredients based on the user's diet pattern.
 */
export function filterByDietPattern(
    ingredients: IngredientData[],
    dietPattern: DietPattern,
): IngredientData[] {
    switch (dietPattern) {
        case DietPattern.VEGAN:
            return ingredients.filter((i) => i.isVegan);

        case DietPattern.VEGETARIAN:
            return ingredients.filter((i) => i.isVegetarian);

        case DietPattern.PESCATARIAN:
            return ingredients.filter((i) => {
                if (i.isVegetarian) return true;
                const nameLower = i.name.toLowerCase();
                if (i.category === 'protein' && (
                    nameLower.includes('fish') ||
                    nameLower.includes('salmon') ||
                    nameLower.includes('tuna') ||
                    nameLower.includes('shrimp')
                )) return true;
                return false;
            });

        case DietPattern.OMNIVORE:
        default:
            return ingredients;
    }
}
