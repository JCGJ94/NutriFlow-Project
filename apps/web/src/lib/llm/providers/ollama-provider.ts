import { LLMProvider, NarrationInput, NarrationOutput, GenericLLMInput } from '../llm-provider.interface';

export function createOllamaProvider(): LLMProvider {
    const baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL ?? 'llama3';
    const enabled =
        process.env.ALLOW_OLLAMA === 'true' ||
        process.env.NODE_ENV === 'development';

    return {
        getName() {
            return 'ollama';
        },

        async generateText(input: NarrationInput | GenericLLMInput): Promise<NarrationOutput> {
            if (!enabled) {
                throw new Error('Ollama provider is disabled in configuration');
            }

            let prompt: string;
            if ('prompt' in input) {
                prompt = input.systemContext
                    ? `${input.systemContext}\n\n${input.prompt}`
                    : input.prompt;
            } else {
                prompt = `Explain this diet plan for a user (${input.profileCtx}). Plan: ${input.planSummary}. Keep it simple and motivating.`;
            }

            const response = await fetch(`${baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, prompt, stream: false }),
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }

            const data = (await response.json()) as any;

            return {
                content: data.response,
                provider: 'ollama',
                modelUsed: model,
            };
        },
    };
}
