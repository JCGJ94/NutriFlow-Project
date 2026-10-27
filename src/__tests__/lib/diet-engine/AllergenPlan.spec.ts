import { describe, it, expect } from 'vitest';
import { ActivityLevel, DietPattern, IngredientCategory, Sex } from '@/lib/contracts';
import { generateWeeklyPlan } from '@/lib/diet-engine';
import type { IngredientData, UserProfile } from '@/lib/diet-engine/types';

// Engine-level (no mocks): a small catalog shaped like the seeded one, with the
// allergen tags migration 007 applies. Once allergens are really filtered, whole
// categories can disappear, and the plan must still be finite and allergen-free.

function ing(
    id: string,
    category: IngredientCategory,
    allergenIds: string[] = [],
    { vegan = true }: { vegan?: boolean } = {},
): IngredientData {
    return {
        id,
        name: id,
        category,
        allergenIds,
        kcalPer100g: 120,
        proteinPer100g: 8,
        carbsPer100g: 15,
        fatPer100g: 4,
        fiberPer100g: 2,
        isVegan: vegan,
        isVegetarian: true,
    };
}

const C = IngredientCategory;
const catalog: IngredientData[] = [
    ing('milk-1', C.DAIRY, ['milk'], { vegan: false }),
    ing('yogurt-1', C.DAIRY, ['milk'], { vegan: false }),
    ing('apple', C.FRUIT),
    ing('bread', C.CARBOHYDRATE, ['gluten']),
    ing('rice', C.CARBOHYDRATE),
    ing('chicken', C.PROTEIN, [], { vegan: false }),
    ing('tofu', C.PROTEIN, ['soybeans']),
    ing('tempeh', C.PROTEIN, ['soybeans']),
    ing('seitan', C.PROTEIN, ['gluten']),
    ing('broccoli', C.VEGETABLE),
    ing('olive-oil', C.FAT),
    ing('almonds', C.NUT_SEED, ['nuts']),
];

const baseProfile: UserProfile = {
    id: 'u1',
    age: 30,
    sex: Sex.MALE,
    weightKg: 80,
    heightCm: 180,
    activityLevel: ActivityLevel.MODERATELY_ACTIVE,
    mealsPerDay: 5,
    dietPattern: DietPattern.OMNIVORE,
    allergenIds: [],
};

function assertFiniteAndAllergenFree(profile: UserProfile) {
    const plan = generateWeeklyPlan(profile, catalog, '2026-01-05');
    const forbidden = new Set(profile.allergenIds);
    const byId = new Map(catalog.map((i) => [i.id, i]));

    expect(plan.days).toHaveLength(7);
    for (const day of plan.days) {
        for (const total of [day.totalKcal, day.totalProtein, day.totalCarbs, day.totalFat]) {
            expect(Number.isFinite(total)).toBe(true);
        }
        for (const meal of day.meals) {
            for (const total of [meal.totalKcal, meal.totalProtein, meal.totalCarbs, meal.totalFat]) {
                expect(Number.isFinite(total)).toBe(true);
            }
            for (const item of meal.items) {
                for (const v of [item.grams, item.kcal, item.protein, item.carbs, item.fat]) {
                    expect(Number.isFinite(v)).toBe(true);
                }
                const tags = byId.get(item.ingredientId)!.allergenIds;
                expect(tags.some((t) => forbidden.has(t))).toBe(false);
            }
        }
    }
    return plan;
}

describe('generateWeeklyPlan with declared allergens', () => {
    it('never includes a tagged ingredient and stays finite for a milk-allergic omnivore (dairy category empty)', () => {
        const plan = assertFiniteAndAllergenFree({ ...baseProfile, allergenIds: ['milk'] });
        const ids = plan.days.flatMap((d) => d.meals.flatMap((m) => m.items.map((i) => i.ingredientId)));
        expect(ids).not.toContain('milk-1');
        expect(ids).not.toContain('yogurt-1');
    });

    it('stays finite and allergen-free for a vegan allergic to soy and gluten (no protein left)', () => {
        const plan = assertFiniteAndAllergenFree({
            ...baseProfile,
            dietPattern: DietPattern.VEGAN,
            allergenIds: ['soybeans', 'gluten'],
        });
        const ids = plan.days.flatMap((d) => d.meals.flatMap((m) => m.items.map((i) => i.ingredientId)));
        expect(ids.some((id) => ['tofu', 'tempeh', 'seitan', 'bread'].includes(id))).toBe(false);
    });

    it('still produces items for a user with no allergens', () => {
        const plan = assertFiniteAndAllergenFree(baseProfile);
        expect(plan.days[0].meals.some((m) => m.items.length > 0)).toBe(true);
    });
});
