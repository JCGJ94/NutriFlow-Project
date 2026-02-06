import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from '../ai/gemini.service';
import { NotebooklmMcpService } from './notebooklm-mcp.service';
import { UserProfile, GeneratedWeekPlan } from './types';

@Injectable()
export class AiDietService {

    constructor(
        private readonly geminiService: GeminiService,
        private readonly mcpService: NotebooklmMcpService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Generate a weekly diet plan using AI and NotebookLM
     */
    async generateDietPlan(profile: UserProfile): Promise<GeneratedWeekPlan> {
        let context = "Follow general healthy guidelines based on evidence-based nutrition science.";

        // 1. Try to get context from NotebookLM via MCP (graceful fallback if unavailable)
        try {
            const notebookId = this.configService.get<string>('NOTEBOOKLM_ID');
            if (notebookId) {
                const query = `Provide nutritional guidelines and meal suggestions for a ${profile.dietPattern} diet for a ${profile.sex} ${profile.age} years old with objective ${profile.weightGoalKg ? `reach ${profile.weightGoalKg}kg` : 'maintain weight'}. Consider allergens: ${profile.allergenIds.join(', ') || 'None'}.`;
                const mcpContext = await this.mcpService.query(notebookId, query);
                if (mcpContext) {
                    context = mcpContext;
                    console.log('✅ Successfully retrieved context from NotebookLM');
                }
            } else {
                console.warn('⚠️ NOTEBOOKLM_ID not configured, using default nutrition guidelines');
            }
        } catch (error: any) {
            console.warn('⚠️ NotebookLM MCP unavailable, falling back to default guidelines:', error.message);
        }

        // 2. Construct Prompt (Using Gemini for layout generation based on context)
        const prompt = this.buildPrompt(profile, context);

        // 3. Call Gemini
        const responseText = await this.geminiService.generateText(prompt);

        // 4. Parse & Validate JSON
        try {
            const cleanedJson = this.cleanJsonString(responseText);
            const plan = JSON.parse(cleanedJson) as GeneratedWeekPlan;
            return plan;
        } catch (e) {
            console.error('Failed to parse AI response:', responseText);
            throw new Error('AI failed to generate a valid diet plan format.');
        }
    }

    private buildPrompt(profile: UserProfile, context: string): string {
        return `
SYSTEM ROLE:
You are a deterministic diet plan generation engine for NutriFlow.
You are NOT a conversational assistant.
You are a JSON generator constrained by a strict schema.
You must follow ALL rules below without exception.

---

CRITICAL OUTPUT RULES (MANDATORY):
1. OUTPUT MUST BE VALID JSON ONLY
2. DO NOT include markdown, explanations, or natural language
3. DO NOT wrap JSON in code blocks
4. DO NOT add or omit fields defined in the schema
5. If you cannot comply, OUTPUT THIS EXACT JSON: {"error": "SCHEMA_VIOLATION"}

---

INPUT DATA (AUTHORITATIVE):

SOURCE MATERIAL (KNOWLEDGE BASE):
---
${context}
---

USER PROFILE:
- Age: ${profile.age}
- Sex: ${profile.sex}
- Weight: ${profile.weightKg}kg
- Height: ${profile.heightCm}cm
- Activity: ${profile.activityLevel}
- Diet Pattern: ${profile.dietPattern}
- Meals per day: ${profile.mealsPerDay}
- Goal: ${profile.weightGoalKg ? `Reach ${profile.weightGoalKg}kg` : 'Maintain weight'}
- Allergies: ${profile.allergenIds.join(', ') || 'None'}

---

HARD CONSTRAINTS (NON-NEGOTIABLE):
- NEVER include allergens: ${profile.allergenIds.join(', ') || 'None'}
- NEVER violate the diet pattern: ${profile.dietPattern}
- NEVER exceed ±5% of daily calorie target
- NEVER exceed ±5% of macro targets
- Meals MUST sum exactly to daily totals
- Daily totals MUST sum exactly to weekly totals
- Use grams as integer values
- kcal, protein, carbs, fat MUST be numbers

---

SCHEMA DEFINITION (LOCKED):

{
  "weekStart": "YYYY-MM-DD",
  "targetKcal": number,
  "targetProtein": number,
  "targetCarbs": number,
  "targetFat": number,
  "days": [
    {
      "dayOfWeek": number, // 0=Monday, 6=Sunday
      "totalKcal": number,
      "totalProtein": number,
      "totalCarbs": number,
      "totalFat": number,
      "meals": [
        {
          "mealType": "breakfast" | "lunch" | "dinner" | "snack",
          "totalKcal": number,
          "items": [
            {
              "ingredientName": "string",
              "grams": number,
              "kcal": number,
              "protein": number,
              "carbs": number,
              "fat": number
            }
          ]
        }
      ]
    }
  ]
}

---

FINAL INSTRUCTION:
Return ONLY the JSON response matching the schema above.
`;
    }

    private cleanJsonString(str: string): string {
        // Remove Markdown code blocks if present
        return str.replace(/```json\n?|\n?```/g, '').trim();
    }
}
