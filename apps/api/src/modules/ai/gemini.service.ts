import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class GeminiService {
    private genAI?: GoogleGenerativeAI;
    private model?: GenerativeModel;
    private embeddingModel?: GenerativeModel;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            console.warn('⚠️ GEMINI_API_KEY is not defined. AI features will be disabled.');
            return;
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        // Using gemini-2.0-flash - the only model available for this API key
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
        });
        this.embeddingModel = this.genAI.getGenerativeModel({
            model: 'text-embedding-004',
        });
    }

    private checkApiKey() {
        if (!this.genAI) {
            throw new Error('AI Service not initialized: GEMINI_API_KEY is missing');
        }
    }

    private async withRetry<T>(operation: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
        try {
            return await operation();
        } catch (error: any) {
            if (retries > 0 && error.message?.includes('429')) {
                console.warn(`⚠️ Gemini API Rate Limit (429). Retrying in ${delay}ms... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.withRetry(operation, retries - 1, delay * 2);
            }
            throw error;
        }
    }

    /**
     * Generate text from a prompt
     */
    async generateText(prompt: string): Promise<string> {
        this.checkApiKey();
        return this.withRetry(async () => {
            const result = await this.model!.generateContent(prompt);
            const response = await result.response;
            return response.text();
        });
    }

    /**
     * Generate embedding for a given text
     * Returns a vector of numbers
     */
    async generateEmbedding(text: string): Promise<number[]> {
        this.checkApiKey();
        return this.withRetry(async () => {
            const result = await this.embeddingModel!.embedContent(text);
            const embedding = result.embedding;
            return embedding.values;
        });
    }
}
