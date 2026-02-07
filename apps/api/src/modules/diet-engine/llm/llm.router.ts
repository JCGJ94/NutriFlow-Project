import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider, NarrationInput, NarrationOutput, GenericLLMInput } from './llm-provider.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { NullProvider } from './providers/null.provider';

@Injectable()
export class LLMRouter {
    private readonly logger = new Logger(LLMRouter.name);
    private providers: Record<string, LLMProvider>;
    private primaryProvider: string;
    private fallbackProvider: string;

    constructor(
        private readonly configService: ConfigService,
        geminiProvider: GeminiProvider,
        ollamaProvider: OllamaProvider,
        nullProvider: NullProvider,
    ) {
        this.providers = {
            gemini: geminiProvider,
            ollama: ollamaProvider,
            null: nullProvider,
        };

        this.primaryProvider = this.configService.get<string>('LLM_PRIMARY', 'gemini').toLowerCase();
        this.fallbackProvider = this.configService.get<string>('LLM_FALLBACK', 'ollama').toLowerCase();
    }

    async generateText(input: NarrationInput | GenericLLMInput): Promise<NarrationOutput> {
        const chain = [
            this.primaryProvider,
            this.fallbackProvider,
            'null'
        ];

        // Deduplicate chain
        const uniqueChain = Array.from(new Set(chain));

        for (const providerName of uniqueChain) {
            const provider = this.providers[providerName];
            if (!provider) {
                this.logger.warn(`Provider '${providerName}' not found in registry. Skipping.`);
                continue;
            }

            try {
                return await provider.generateText(input);
            } catch (error: any) {
                this.logger.warn(`Provider '${providerName}' failed: ${error.message}. Trying next...`);
                // Continue to next provider
            }
        }

        // Should theoretically never reach here because NullProvider shouldn't throw
        return this.providers['null'].generateText(input);
    }
}
