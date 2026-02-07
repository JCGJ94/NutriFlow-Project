import { Injectable, Logger } from '@nestjs/common';
import { LLMRouter } from './llm/llm.router';
import { GeneratedWeekPlan, UserProfile } from './types';

@Injectable()
export class DietNarrationService {
    private readonly logger = new Logger(DietNarrationService.name);

    constructor(private readonly llmRouter: LLMRouter) { }

    /**
     * Generate a narration for the entire week plan
     */
    async narrateWeekPlan(plan: GeneratedWeekPlan, profile: UserProfile, style: 'concise' | 'detailed' | 'motivaional' = 'concise') {
        const planSummary = this.summarizePlan(plan);
        const profileCtx = this.summarizeProfile(profile);

        this.logger.log(`Requesting narration for plan with style: ${style}`);

        return this.llmRouter.generateText({
            planSummary,
            profileCtx,
            language: profile.language,
            style
        });
    }

    /**
     * Create a compact summary string of the JSON plan to save Context Window
     */
    private summarizePlan(plan: GeneratedWeekPlan): string {
        const dailyAvg = plan.targetKcal;
        const macroSplit = `P:${plan.targetProtein}g C:${plan.targetCarbs}g F:${plan.targetFat}g`;

        // Extract unique meal types and a sample of ingredients to give flavor
        const sampleDay = plan.days[0];
        const meals = sampleDay.meals.map(m => m.mealType).join(', ');
        const sampleIngredients = sampleDay.meals.flatMap(m => m.items).slice(0, 5).map(i => i.ingredientName).join(', ');

        return `Weekly Plan. Avg Kcal: ${dailyAvg}. Macros: ${macroSplit}. Structure: ${meals}. Sample foods: ${sampleIngredients}...`;
    }

    private summarizeProfile(profile: UserProfile): string {
        return `${profile.age}y ${profile.sex}, Goal: ${profile.weightGoalKg ? 'Target ' + profile.weightGoalKg + 'kg' : 'Maintain'}. Activity: ${profile.activityLevel}. Diet: ${profile.dietPattern}.`;
    }
}
