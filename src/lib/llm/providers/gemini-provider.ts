import { getGemini } from '../../gemini';
import { LLMProvider, NarrationInput, NarrationOutput, GenericLLMInput } from '../llm-provider.interface';

export const geminiProvider: LLMProvider = {
    getName() {
        return 'gemini';
    },

    async generateText(input: NarrationInput | GenericLLMInput): Promise<NarrationOutput> {
        const gemini = getGemini();

        let prompt: string;

        if ('prompt' in input) {
            prompt = input.systemContext
                ? `${input.systemContext}\n\n${input.prompt}`
                : input.prompt;
        } else {
            const languageName = input.language === 'en' ? 'English' : 'Spanish';
            prompt = `
You are a nutrition assistant. Explain the following diet plan to the user.
IMPORTANT: You MUST respond in ${languageName}.

USER CONTEXT:
${input.profileCtx}

DIET PLAN SUMMARY:
${input.planSummary}

INSTRUCTIONS:
- Style: ${input.style || 'concise'}
- Focus on why this plan fits their goals.
- Mention key nutrients provided.
- Do NOT output JSON. Output pure text (Markdown allowed).
            `.trim();
        }

        const text = await gemini.generateText(prompt);

        return {
            content: text,
            provider: 'gemini',
            modelUsed: 'gemini-2.0-flash',
        };
    },
};
