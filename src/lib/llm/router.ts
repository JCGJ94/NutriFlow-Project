import { LLMProvider, NarrationInput, GenericLLMInput, NarrationOutput } from './llm-provider.interface';
import { geminiProvider } from './providers/gemini-provider';
import { createOllamaProvider } from './providers/ollama-provider';
import { nullProvider } from './providers/null-provider';

interface LLMRouter {
    generateText(input: NarrationInput | GenericLLMInput): Promise<NarrationOutput>;
}

let cachedRouter: LLMRouter | null = null;

/**
 * Lazy singleton LLM router.
 * Accepts optional provider overrides for testing.
 * When deps are provided, bypasses the module-level singleton cache.
 */
export function getLLMRouter(deps?: Record<string, LLMProvider>): LLMRouter {
    // If deps are injected (test scenario), build a fresh router without caching
    if (deps) {
        return buildRouter(deps);
    }

    if (cachedRouter) return cachedRouter;

    const defaultProviders: Record<string, LLMProvider> = {
        gemini: geminiProvider,
        ollama: createOllamaProvider(),
        null: nullProvider,
    };

    cachedRouter = buildRouter(defaultProviders);
    return cachedRouter;
}

function buildRouter(providers: Record<string, LLMProvider>): LLMRouter {
    const primaryProvider = (process.env.LLM_PRIMARY ?? 'gemini').toLowerCase();
    const fallbackProvider = (process.env.LLM_FALLBACK ?? 'ollama').toLowerCase();

    return {
        async generateText(input: NarrationInput | GenericLLMInput): Promise<NarrationOutput> {
            const chain = [primaryProvider, fallbackProvider, 'null'];
            const uniqueChain = Array.from(new Set(chain));

            for (const providerName of uniqueChain) {
                const provider = providers[providerName];
                if (!provider) {
                    console.warn(`LLMRouter: provider '${providerName}' not found. Skipping.`);
                    continue;
                }

                try {
                    return await provider.generateText(input);
                } catch (error: any) {
                    console.warn(`LLMRouter: provider '${providerName}' failed: ${error.message}. Trying next…`);
                }
            }

            // Final safety net — null provider should never throw
            return providers['null']
                ? providers['null'].generateText(input)
                : Promise.resolve({ content: 'AI unavailable', provider: 'null', modelUsed: 'template-v1' });
        },
    };
}

/** Reset cached router (for tests only). */
export function _resetLLMRouterCache(): void {
    cachedRouter = null;
}
