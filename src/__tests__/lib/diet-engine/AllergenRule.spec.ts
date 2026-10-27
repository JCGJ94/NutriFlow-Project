import { describe, it, expect } from 'vitest';
import { filterByAllergens } from '../../../lib/diet-engine/rules/allergen.rule';
import { IngredientCategory } from '@/lib/contracts';
import type { IngredientData } from '../../../lib/diet-engine/types';

const makeIngredient = (id: string, allergenIds: string[] = []): IngredientData => ({
    id,
    name: `Ingredient ${id}`,
    category: IngredientCategory.PROTEIN,
    kcalPer100g: 150,
    proteinPer100g: 20,
    carbsPer100g: 5,
    fatPer100g: 6,
    fiberPer100g: 0,
    isVegan: false,
    isVegetarian: false,
    allergenIds,
});

describe('filterByAllergens', () => {
    it('returns all ingredients when no allergens specified', () => {
        const ingredients = [makeIngredient('a'), makeIngredient('b')];
        const result = filterByAllergens(ingredients, []);
        expect(result).toHaveLength(2);
    });

    it('filters out ingredients that contain a user allergen', () => {
        const ingredients = [
            makeIngredient('safe', []),
            makeIngredient('risky', ['gluten']),
        ];
        const result = filterByAllergens(ingredients, ['gluten']);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('safe');
    });

    it('removes ingredient with any matching allergen (multi-allergen)', () => {
        const ingredients = [
            makeIngredient('clean', []),
            makeIngredient('has-milk', ['milk']),
            makeIngredient('has-both', ['gluten', 'milk']),
        ];
        const result = filterByAllergens(ingredients, ['gluten', 'soy']);
        expect(result).toHaveLength(2);
        expect(result.map(i => i.id)).not.toContain('has-both');
    });

    it('returns empty array when all ingredients conflict', () => {
        const ingredients = [makeIngredient('a', ['nuts']), makeIngredient('b', ['nuts'])];
        const result = filterByAllergens(ingredients, ['nuts']);
        expect(result).toHaveLength(0);
    });
});
