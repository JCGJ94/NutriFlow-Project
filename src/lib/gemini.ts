import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

interface GeminiClient {
    generateText(prompt: string): Promise<string>;
    generateEmbedding(text: string): Promise<number[]>;
}

interface DisabledGeminiClient {
    disabled: true;
    generateText(prompt: string): Promise<never>;
    generateEmbedding(text: string): Promise<never>;
}

type GeminiResult = GeminiClient | DisabledGeminiClient;

let cachedClient: GeminiResult | null = null;

/**
 * Lazy singleton Gemini client.
 * Returns a disabled stub if GEMINI_API_KEY is missing (fails gracefully).
 */
export function getGemini(): GeminiResult {
    if (cachedClient) return cachedClient;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn('GEMINI_API_KEY is not defined. AI features will be disabled.');
        const disabled: DisabledGeminiClient = {
            disabled: true,
            generateText: () => Promise.reject(new Error('Gemini is disabled: GEMINI_API_KEY missing')),
            generateEmbedding: () => Promise.reject(new Error('Gemini is disabled: GEMINI_API_KEY missing')),
        };
        cachedClient = disabled;
        return disabled;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const embeddingModel: GenerativeModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

    cachedClient = {
        generateText: (prompt: string) => withRetry(() =>
            model.generateContent(prompt).then((r) => r.response.text())
        ),
        generateEmbedding: (text: string) => withRetry(() =>
            embeddingModel.embedContent(text).then((r) => r.embedding.values)
        ),
    };

    return cachedClient;
}

/**
 * Retry on HTTP 429 (rate limit) with exponential backoff.
 */
async function withRetry<T>(operation: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
        return await operation();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        if (retries > 0 && message.includes('429')) {
            console.warn(`Gemini rate limit (429). Retrying in ${delay}ms… (${retries} left)`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return withRetry(operation, retries - 1, delay * 2);
        }
        throw error;
    }
}

/** Reset cached client (for tests only). */
export function _resetGeminiCache(): void {
    cachedClient = null;
}
