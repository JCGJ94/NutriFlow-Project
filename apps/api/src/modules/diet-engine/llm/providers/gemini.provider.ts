import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../../ai/gemini.service';
import { LLMProvider, NarrationInput, NarrationOutput, GenericLLMInput } from '../llm-provider.interface';

@Injectable()
export class GeminiProvider implements LLMProvider {
    private readonly logger = new Logger(GeminiProvider.name);

    constructor(private readonly geminiService: GeminiService) { }

    getName(): string {
        return 'gemini';
    }

    async generateText(input: NarrationInput | GenericLLMInput): Promise<NarrationOutput> {
        this.logger.debug('Attempting generation with Gemini...');

        let prompt: string;

        if ('prompt' in input) {
            // Generic text generation
            prompt = input.systemContext
                ? `${input.systemContext}\n\n${input.prompt}`
                : input.prompt;
        } else {
            // Legacy Narration generation
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
            `;
        }

        const text = await this.geminiService.generateText(prompt);

        return {
            content: text,
            provider: 'gemini',
            modelUsed: 'gemini-2.0-flash'
        };
    }
}
