import { getLLMRouter } from './router';
import type { NarrationOutput } from './llm-provider.interface';
import type { GeneratedWeekPlan, UserProfile } from '../diet-engine/types';

/**
 * Generate a narration for the entire week plan.
 */
export async function narrateDiet(
    plan: GeneratedWeekPlan,
    profile: UserProfile,
    style: 'concise' | 'detailed' | 'motivaional' = 'concise',
): Promise<NarrationOutput> {
    const planSummary = summarizePlan(plan);
    const profileCtx = summarizeProfile(profile);

    return getLLMRouter().generateText({ planSummary, profileCtx, language: profile.language, style });
}

/**
 * Translate a diet plan JSON to the target language.
 */
export async function translatePlan(
    plan: GeneratedWeekPlan,
    targetLang: 'es' | 'en',
): Promise<GeneratedWeekPlan> {
    if (!plan.days || plan.days.length === 0) return plan;

    const systemContext = `
You are a bilingual nutrition and fitness translator.
Your task is to translate a JSON object representing a Diet or Exercise Plan to ${targetLang === 'es' ? 'Spanish' : 'English'}.

RULES:
1. Keep all numeric values, UUIDs, IDs, dates, and keys EXACTLY as they are.
2. Translate 'ingredientName', 'exerciseName', 'name' (for workout days), 'unit', and 'type' (exercise category) fields.
3. Translate 'summary', 'tips', and 'description' if they exist.
4. DO NOT translate 'mealType' (keep as 'breakfast', 'lunch', 'dinner', 'snack').
5. Maintain the EXACT JSON structure.
6. Respond ONLY with the translated JSON.
    `.trim();

    const prompt = `Translate this JSON object: ${JSON.stringify(plan)}`;

    try {
        const result = await getLLMRouter().generateText({ prompt, systemContext, temperature: 0.1 });
        const cleanJson = result.content.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson) as GeneratedWeekPlan;
    } catch {
        return plan;
    }
}

function summarizePlan(plan: GeneratedWeekPlan): string {
    const macroSplit = `P:${plan.targetProtein}g C:${plan.targetCarbs}g F:${plan.targetFat}g`;
    const sampleDay = plan.days[0];
    const meals = sampleDay?.meals.map((m) => m.mealType).join(', ') ?? '';
    const sampleIngredients = sampleDay?.meals
        .flatMap((m) => m.items)
        .slice(0, 5)
        .map((i) => i.ingredientName)
        .join(', ') ?? '';

    return `Weekly Plan. Avg Kcal: ${plan.targetKcal}. Macros: ${macroSplit}. Structure: ${meals}. Sample foods: ${sampleIngredients}...`;
}

function summarizeProfile(profile: UserProfile): string {
    return `${profile.age}y ${profile.sex}, Goal: ${profile.weightGoalKg ? 'Target ' + profile.weightGoalKg + 'kg' : 'Maintain'}. Activity: ${profile.activityLevel}. Diet: ${profile.dietPattern}.`;
}
