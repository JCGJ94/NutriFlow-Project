export interface NarrationInput {
    planSummary: string;
    profileCtx: string;
    language?: string;
    style?: 'concise' | 'detailed' | 'motivaional';
}

export interface GenericLLMInput {
    prompt: string;
    systemContext?: string;
    temperature?: number;
}

export interface NarrationOutput {
    content: string;
    provider: string;
    modelUsed?: string;
}

export interface LLMProvider {
    getName(): string;
    generateText(input: NarrationInput | GenericLLMInput): Promise<NarrationOutput>;
}
