import { Injectable } from '@nestjs/common';
import { IngredientData } from '../types';

@Injectable()
export class AllergenRule {
    /**
     * Filter out ingredients that contain any of the user's allergens
     */
    filterByAllergens(
        ingredients: IngredientData[],
        userAllergenIds: string[],
    ): IngredientData[] {
        if (userAllergenIds.length === 0) {
            return ingredients;
        }

        const allergenSet = new Set(userAllergenIds);

        return ingredients.filter((ingredient) => {
            // Check if ingredient has any of the user's allergens
            const ingredientAllergens = ingredient.allergenIds || [];
            return !ingredientAllergens.some((id) => allergenSet.has(id));
        });
    }
}
