
export interface NarrationInput {
    planSummary: string;
    profileCtx: string;
    language?: string;
    // Optional rendering hints
    style?: 'concise' | 'detailed' | 'motivaional';
}

export interface GenericLLMInput {
    prompt: string;
    systemContext?: string;
    temperature?: number;
}

export interface NarrationOutput {
    content: string;
    provider: string; // 'gemini' | 'ollama' | 'null'
    modelUsed?: string;
}

export interface LLMProvider {
    /**
     * Unique name of the provider implementation
     */
    getName(): string;

    /**
     * Generate text based on input context
     * @throws Error if generation fails (allowing fallback to next provider)
     */
    generateText(input: NarrationInput | GenericLLMInput): Promise<NarrationOutput>;
}
