import { Injectable } from '@nestjs/common';
import { DietPattern } from '@nutriflow/shared';
import { IngredientData } from '../types';

@Injectable()
export class DietPatternRule {
    /**
     * Filter ingredients based on diet pattern
     * - Vegan: only vegan ingredients
     * - Vegetarian: only vegetarian ingredients
     * - Pescatarian: vegetarian + fish/seafood (marked with special category)
     * - Omnivore: all ingredients
     */
    filterByDietPattern(
        ingredients: IngredientData[],
        dietPattern: DietPattern,
    ): IngredientData[] {
        switch (dietPattern) {
            case DietPattern.VEGAN:
                return ingredients.filter((i) => i.isVegan);

            case DietPattern.VEGETARIAN:
                return ingredients.filter((i) => i.isVegetarian);

            case DietPattern.PESCATARIAN:
                // Vegetarian + allow fish (we'll mark fish as vegetarian=false but check category)
                return ingredients.filter((i) => {
                    if (i.isVegetarian) return true;
                    // Allow fish/seafood proteins
                    if (i.category === 'protein' && i.name.toLowerCase().includes('fish')) return true;
                    if (i.category === 'protein' && i.name.toLowerCase().includes('salmon')) return true;
                    if (i.category === 'protein' && i.name.toLowerCase().includes('tuna')) return true;
                    if (i.category === 'protein' && i.name.toLowerCase().includes('shrimp')) return true;
                    return false;
                });

            case DietPattern.OMNIVORE:
            default:
                return ingredients;
        }
    }
}
