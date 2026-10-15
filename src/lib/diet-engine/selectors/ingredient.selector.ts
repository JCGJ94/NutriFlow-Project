import { IngredientCategory } from '@/lib/contracts';
import { IngredientData, GeneratedMealItem, DailyTargets } from '../types';

/**
 * Select ingredients for a meal that approximate the target macros.
 * Uses a greedy algorithm to fill macro targets.
 */
export function selectIngredientsForMeal(
    availableIngredients: IngredientData[],
    targetCategories: IngredientCategory[],
    mealTarget: DailyTargets,
    usedIngredientIds: Set<string> = new Set(),
): GeneratedMealItem[] {
    const items: GeneratedMealItem[] = [];
    let remainingKcal = mealTarget.kcal;
    let remainingProtein = mealTarget.macros.protein;

    const byCategory = new Map<IngredientCategory, IngredientData[]>();
    for (const category of targetCategories) {
        const categoryIngredients = availableIngredients.filter(
            (i) => i.category === category && !usedIngredientIds.has(i.id),
        );
        if (categoryIngredients.length > 0) {
            byCategory.set(category, categoryIngredients);
        }
    }

    for (const category of targetCategories) {
        const ingredients = byCategory.get(category);
        if (!ingredients || ingredients.length === 0) continue;

        const ingredient = selectRandom(ingredients);
        usedIngredientIds.add(ingredient.id);

        const portionKcal = remainingKcal / (targetCategories.length - items.length);
        const grams = calculatePortion(ingredient, portionKcal, remainingProtein);

        const item = createMealItem(ingredient, grams);
        items.push(item);

        remainingKcal -= item.kcal;
        remainingProtein -= item.protein;
    }

    return items;
}

function calculatePortion(ingredient: IngredientData, targetKcal: number, targetProtein: number): number {
    const gramsForKcal = (targetKcal * 100) / ingredient.kcalPer100g;

    if (ingredient.category === IngredientCategory.PROTEIN) {
        const gramsForProtein = (targetProtein * 100) / ingredient.proteinPer100g;
        return Math.round(Math.min(gramsForKcal, gramsForProtein * 1.5));
    }

    const maxGrams = getMaxGrams(ingredient.category);
    return Math.round(Math.min(gramsForKcal, maxGrams));
}

function getMaxGrams(category: IngredientCategory): number {
    switch (category) {
        case IngredientCategory.PROTEIN: return 200;
        case IngredientCategory.VEGETABLE: return 300;
        case IngredientCategory.CARBOHYDRATE:
        case IngredientCategory.GRAIN: return 200;
        case IngredientCategory.FRUIT: return 200;
        case IngredientCategory.DAIRY: return 250;
        case IngredientCategory.LEGUME: return 150;
        case IngredientCategory.FAT:
        case IngredientCategory.NUT_SEED: return 50;
        default: return 150;
    }
}

function createMealItem(ingredient: IngredientData, grams: number): GeneratedMealItem {
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

function selectRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}
