import { Sex, ActivityLevel, DietPattern, IngredientCategory } from '@nutriflow/shared';
import { AiDietService } from './ai-diet.service';
import { DietEngineService } from './diet-engine.service';
import { BmrCalculator } from './calculators/bmr.calculator';
import { MacrosCalculator } from './calculators/macros.calculator';
import { IngredientSelector } from './selectors/ingredient.selector';
import { AllergenRule } from './rules/allergen.rule';
import { DietPatternRule } from './rules/diet-pattern.rule';
import { DietNarrationService } from './diet-narration.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('Diet Engine Integration Test', () => {
    let aiDietService: AiDietService;
    let dietEngineService: DietEngineService;
    let narrationServiceMock: any;

    const mockProfile: any = {
        id: 'user-123',
        age: 30,
        sex: Sex.MALE,
        weightKg: 85,
        heightCm: 180,
        activityLevel: ActivityLevel.MODERATELY_ACTIVE,
        mealsPerDay: 4,
        dietPattern: DietPattern.OMNIVORE,
        allergenIds: [],
        weightGoalKg: 75, // Deficit mode
    };

    const availableIngredients: any[] = [
        { id: '1', name: 'Chicken Breast', category: IngredientCategory.PROTEIN, kcalPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, allergenIds: [], isVegan: false, isVegetarian: false },
        { id: '2', name: 'Brown Rice', category: IngredientCategory.CARBOHYDRATE, kcalPer100g: 111, proteinPer100g: 2.6, carbsPer100g: 23, fatPer100g: 0.9, allergenIds: [], isVegan: true, isVegetarian: true },
        { id: '3', name: 'Broccoli', category: IngredientCategory.VEGETABLE, kcalPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, allergenIds: [], isVegan: true, isVegetarian: true },
        { id: '4', name: 'Olive Oil', category: IngredientCategory.FAT, kcalPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, allergenIds: [], isVegan: true, isVegetarian: true },
        { id: '5', name: 'Oats', category: IngredientCategory.GRAIN, kcalPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66, fatPer100g: 6.9, allergenIds: [], isVegan: true, isVegetarian: true },
    ];

    beforeEach(() => {
        const bmrCalculator = new BmrCalculator();
        const macrosCalculator = new MacrosCalculator();
        const ingredientSelector = new IngredientSelector();
        const allergenRule = new AllergenRule();
        const dietPatternRule = new DietPatternRule();

        dietEngineService = new DietEngineService(
            bmrCalculator,
            macrosCalculator,
            ingredientSelector,
            allergenRule,
            dietPatternRule
        );

        narrationServiceMock = {
            narrateWeekPlan: vi.fn().mockResolvedValue({ summary: 'Narration mock' }),
        };

        // Manual DI for AiDietService
        aiDietService = new AiDietService(narrationServiceMock as DietNarrationService);
    });

    describe('End-to-End Logic Verification', () => {
        it('should correctly calculate TDEE and Deficit for weight loss', () => {
            const bmrCalculator = new BmrCalculator();
            const result = bmrCalculator.calculateBmr(mockProfile);

            // Men: BMR = 10 * 85 + 6.25 * 180 - 5 * 30 + 5 = 850 + 1125 - 150 + 5 = 1830
            // TDEE = 1830 * 1.55 = 2836.5 -> 2837
            // Target = 2837 - 500 = 2337
            expect(result.bmr).toBe(1830);
            expect(result.tdee).toBe(2837);
            expect(result.targetKcal).toBe(2337);
        });

        it('should generate a 7-day plan with correct structure using internal engine', () => {
            const plan = dietEngineService.generateWeeklyPlan(mockProfile, availableIngredients, '2026-02-10');

            expect(plan.days.length).toBe(7);
            expect(plan.days[0].meals.length).toBe(4); // Based on mealsPerDay: 4
            expect(plan.targetKcal).toBe(2337);

            // Sum of meals should equal daily total
            const day0 = plan.days[0];
            const sumKcal = day0.meals.reduce((sum, m) => sum + m.totalKcal, 0);
            expect(day0.totalKcal).toBe(sumKcal);
        });

        it('AiDietService should delegate narration to DietNarrationService', async () => {
            const plan = dietEngineService.generateWeeklyPlan(mockProfile, availableIngredients, '2026-02-10');
            const narration = await aiDietService.narratePlan(plan, mockProfile);

            expect(narrationServiceMock.narrateWeekPlan).toHaveBeenCalled();
            expect(narration).toEqual({ summary: 'Narration mock' });
        });

        it('AiDietService.generateDietPlan should throw error', async () => {
            await expect(aiDietService.generateDietPlan(mockProfile)).rejects.toThrow();
        });
    });
});
