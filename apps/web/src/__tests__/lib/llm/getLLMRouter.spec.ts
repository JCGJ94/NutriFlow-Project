import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('getLLMRouter', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('returns a router with a generateText function', async () => {
        vi.stubEnv('LLM_PRIMARY', 'null');
        vi.stubEnv('LLM_FALLBACK', 'null');
        const { getLLMRouter } = await import('../../../lib/llm/router');
        const router = getLLMRouter();
        expect(typeof router.generateText).toBe('function');
    });

    it('falls back to null provider when primary fails', async () => {
        vi.stubEnv('LLM_PRIMARY', 'gemini');
        vi.stubEnv('LLM_FALLBACK', 'null');

        const fakeGeminiProvider = {
            getName: () => 'gemini',
            generateText: vi.fn().mockRejectedValue(new Error('API unavailable')),
        };
        const fakeNullProvider = {
            getName: () => 'null',
            generateText: vi.fn().mockResolvedValue({ content: 'fallback', provider: 'null', modelUsed: 'template-v1' }),
        };

        const { getLLMRouter } = await import('../../../lib/llm/router');
        const router = getLLMRouter({ gemini: fakeGeminiProvider, null: fakeNullProvider });

        const result = await router.generateText({ prompt: 'test' });
        expect(result.provider).toBe('null');
        expect(fakeGeminiProvider.generateText).toHaveBeenCalledOnce();
    });

    it('returns result from primary provider when it succeeds', async () => {
        vi.stubEnv('LLM_PRIMARY', 'gemini');
        vi.stubEnv('LLM_FALLBACK', 'null');

        const fakeGeminiProvider = {
            getName: () => 'gemini',
            generateText: vi.fn().mockResolvedValue({ content: 'generated text', provider: 'gemini', modelUsed: 'gemini-2.0-flash' }),
        };

        const { getLLMRouter } = await import('../../../lib/llm/router');
        const router = getLLMRouter({ gemini: fakeGeminiProvider });

        const result = await router.generateText({ prompt: 'hello' });
        expect(result.provider).toBe('gemini');
        expect(result.content).toBe('generated text');
    });

    it('deduplicates providers in the fallback chain', async () => {
        vi.stubEnv('LLM_PRIMARY', 'null');
        vi.stubEnv('LLM_FALLBACK', 'null');

        const fakeNullProvider = {
            getName: () => 'null',
            generateText: vi.fn().mockResolvedValue({ content: 'ok', provider: 'null', modelUsed: 'template-v1' }),
        };

        const { getLLMRouter } = await import('../../../lib/llm/router');
        const router = getLLMRouter({ null: fakeNullProvider });

        await router.generateText({ prompt: 'test' });
        // null appears twice in chain (primary + fallback + null sentinel), but dedupe → called only once
        expect(fakeNullProvider.generateText).toHaveBeenCalledOnce();
    });
});
