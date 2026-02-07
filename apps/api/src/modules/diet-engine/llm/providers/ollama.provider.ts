import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider, NarrationInput, NarrationOutput, GenericLLMInput } from '../llm-provider.interface';

@Injectable()
export class OllamaProvider implements LLMProvider {
    private readonly logger = new Logger(OllamaProvider.name);
    private readonly baseUrl: string;
    private readonly model: string;
    private readonly enabled: boolean;

    constructor(private readonly configService: ConfigService) {
        this.baseUrl = this.configService.get<string>('OLLAMA_BASE_URL', 'http://localhost:11434');
        this.model = this.configService.get<string>('OLLAMA_MODEL', 'llama3');
        this.enabled = this.configService.get<boolean>('ALLOW_OLLAMA', false) ||
            this.configService.get<string>('NODE_ENV') === 'development';
    }

    getName(): string {
        return 'ollama';
    }

    async generateText(input: NarrationInput | GenericLLMInput): Promise<NarrationOutput> {
        if (!this.enabled) {
            throw new Error('Ollama provider is disabled in configuration');
        }

        this.logger.debug(`Attempting generation with Ollama (${this.model})...`);

        let prompt: string;
        if ('prompt' in input) {
            prompt = input.systemContext ? `${input.systemContext}\n\n${input.prompt}` : input.prompt;
        } else {
            prompt = `Explain this diet plan for a user (${input.profileCtx}). Plan: ${input.planSummary}. Keep it simple and motivating.`;
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    prompt: prompt,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }

            const data = await response.json() as any;

            return {
                content: data.response,
                provider: 'ollama',
                modelUsed: this.model
            };
        } catch (error: any) {
            this.logger.error(`Ollama generation failed: ${error.message}`);
            throw error;
        }
    }
}
