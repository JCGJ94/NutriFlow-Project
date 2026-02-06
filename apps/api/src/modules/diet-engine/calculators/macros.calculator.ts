import { Injectable } from '@nestjs/common';
import { MacroTargets, DailyTargets } from '../types';

@Injectable()
export class MacrosCalculator {
    /**
     * Calculate macro targets based on calorie goal
     * Standard weight loss macros:
     * - Protein: 30% (higher to preserve muscle)
     * - Carbs: 40%
     * - Fat: 30%
     * 
     * Calories per gram:
     * - Protein: 4 kcal/g
     * - Carbs: 4 kcal/g
     * - Fat: 9 kcal/g
     */
    calculateMacros(targetKcal: number): DailyTargets {
        // Macro percentages for weight loss
        const proteinPercent = 0.30;
        const carbsPercent = 0.40;
        const fatPercent = 0.30;

        // Calories per macro gram
        const proteinCalPerG = 4;
        const carbsCalPerG = 4;
        const fatCalPerG = 9;

        const macros: MacroTargets = {
            protein: Math.round((targetKcal * proteinPercent) / proteinCalPerG),
            carbs: Math.round((targetKcal * carbsPercent) / carbsCalPerG),
            fat: Math.round((targetKcal * fatPercent) / fatCalPerG),
            fiber: Math.round(targetKcal / 1000 * 14), // ~14g fiber per 1000 kcal
        };

        return {
            kcal: targetKcal,
            macros,
        };
    }

    /**
     * Calculate macros for a specific meal based on percentage of daily intake
     */
    calculateMealMacros(dailyTargets: DailyTargets, percentage: number): DailyTargets {
        return {
            kcal: Math.round(dailyTargets.kcal * percentage),
            macros: {
                protein: Math.round(dailyTargets.macros.protein * percentage),
                carbs: Math.round(dailyTargets.macros.carbs * percentage),
                fat: Math.round(dailyTargets.macros.fat * percentage),
                fiber: Math.round(dailyTargets.macros.fiber * percentage),
            },
        };
    }
}
