import { Injectable } from '@nestjs/common';
import { IngredientCategory } from '@nutriflow/shared';
import {
    IngredientData,
    GeneratedMealItem,
    DailyTargets,
} from '../types';

@Injectable()
export class IngredientSelector {
    /**
     * Select ingredients for a meal that approximate the target macros
     * Uses a greedy algorithm to fill macro targets
     */
    selectIngredientsForMeal(
        availableIngredients: IngredientData[],
        targetCategories: IngredientCategory[],
        mealTarget: DailyTargets,
        usedIngredientIds: Set<string> = new Set(),
    ): GeneratedMealItem[] {
        const items: GeneratedMealItem[] = [];
        let remainingKcal = mealTarget.kcal;
        let remainingProtein = mealTarget.macros.protein;

        // Group ingredients by category
        const byCategory = new Map<IngredientCategory, IngredientData[]>();
        for (const category of targetCategories) {
            const categoryIngredients = availableIngredients.filter(
                (i) => i.category === category && !usedIngredientIds.has(i.id),
            );
            if (categoryIngredients.length > 0) {
                byCategory.set(category, categoryIngredients);
            }
        }

        // Select one ingredient from each category
        for (const category of targetCategories) {
            const ingredients = byCategory.get(category);
            if (!ingredients || ingredients.length === 0) continue;

            // Select a random ingredient from the category
            const ingredient = this.selectRandom(ingredients);
            usedIngredientIds.add(ingredient.id);

            // Calculate portion size based on remaining targets
            const portionKcal = remainingKcal / (targetCategories.length - items.length);
            const grams = this.calculatePortion(ingredient, portionKcal, remainingProtein);

            const item = this.createMealItem(ingredient, grams);
            items.push(item);

            remainingKcal -= item.kcal;
            remainingProtein -= item.protein;
        }

        return items;
    }

    /**
     * Calculate portion size to hit calorie target
     */
    private calculatePortion(
        ingredient: IngredientData,
        targetKcal: number,
        targetProtein: number,
    ): number {
        // Calculate grams needed to hit calorie target
        const gramsForKcal = (targetKcal * 100) / ingredient.kcalPer100g;

        // For protein sources, also consider protein target
        if (ingredient.category === IngredientCategory.PROTEIN) {
            const gramsForProtein = (targetProtein * 100) / ingredient.proteinPer100g;
            // Use whichever is smaller to avoid overshooting
            return Math.round(Math.min(gramsForKcal, gramsForProtein * 1.5));
        }

        // Limit portion sizes to reasonable amounts
        const maxGrams = this.getMaxGrams(ingredient.category);
        return Math.round(Math.min(gramsForKcal, maxGrams));
    }

    /**
     * Get maximum reasonable portion size by category
     */
    private getMaxGrams(category: IngredientCategory): number {
        switch (category) {
            case IngredientCategory.PROTEIN:
                return 200;
            case IngredientCategory.VEGETABLE:
                return 300;
            case IngredientCategory.CARBOHYDRATE:
            case IngredientCategory.GRAIN:
                return 200;
            case IngredientCategory.FRUIT:
                return 200;
            case IngredientCategory.DAIRY:
                return 250;
            case IngredientCategory.LEGUME:
                return 150;
            case IngredientCategory.FAT:
            case IngredientCategory.NUT_SEED:
                return 50;
            default:
                return 150;
        }
    }

    /**
     * Create meal item with calculated macros
     */
    private createMealItem(ingredient: IngredientData, grams: number): GeneratedMealItem {
        const multiplier = grams / 100;

        return {
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            grams,
            kcal: Math.round(ingredient.kcalPer100g * multiplier),
            protein: Math.round(ingredient.proteinPer100g * multiplier * 10) / 10,
            carbs: Math.round(ingredient.carbsPer100g * multiplier * 10) / 10,
            fat: Math.round(ingredient.fatPer100g * multiplier * 10) / 10,
        };
    }

    /**
     * Select random element from array
     */
    private selectRandom<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }
}
