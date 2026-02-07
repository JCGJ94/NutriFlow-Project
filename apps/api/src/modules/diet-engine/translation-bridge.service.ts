import { Injectable, Logger } from '@nestjs/common';
import { LLMRouter } from './llm/llm.router';
import { GeneratedWeekPlan } from './types';

@Injectable()
export class TranslationBridgeService {
    private readonly logger = new Logger(TranslationBridgeService.name);

    constructor(private readonly llmRouter: LLMRouter) { }

    /**
     * Translates a diet plan to the target language (es/en)
     * This avoids full regeneration and maintains 'fluidity'
     */
    async translatePlan(plan: GeneratedWeekPlan, targetLang: 'es' | 'en'): Promise<GeneratedWeekPlan> {
        this.logger.log(`Translating plan to: ${targetLang}`);

        if (!plan.days || plan.days.length === 0) return plan;

        const systemContext = `
        You are a bilingual nutrition translator. 
        Your task is to translate a Diet Plan JSON to ${targetLang === 'es' ? 'Spanish' : 'English'}.
        
        RULES:
        1. Keep all numeric values, UUIDs, and keys EXACTLY as they are.
        2. Translate 'ingredientName', 'mealType', and 'unit' fields.
        3. Translate the 'summary' and 'tips' if they exist.
        4. Maintain the EXACT JSON structure.
        5. Respond ONLY with the translated JSON.
        `;

        const prompt = `Translate this JSON object: ${JSON.stringify(plan)}`;

        try {
            const result = await this.llmRouter.generateText({
                prompt,
                systemContext,
                temperature: 0.1, // Low temp for structural integrity
            });

            // Extract JSON from content (handling potential markdown fences)
            const cleanJson = result.content.replace(/```json|```/g, '').trim();
            const translatedPlan = JSON.parse(cleanJson);

            return translatedPlan;
        } catch (error) {
            this.logger.error(`Failed to translate plan: ${error.message}`);
            // Fallback: return original plan if translation fails (better than crash)
            return plan;
        }
    }
}
