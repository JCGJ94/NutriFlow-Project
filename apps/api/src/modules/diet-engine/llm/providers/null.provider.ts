import { Injectable, Logger } from '@nestjs/common';
import { LLMProvider, NarrationInput, NarrationOutput, GenericLLMInput } from '../llm-provider.interface';

@Injectable()
export class NullProvider implements LLMProvider {
    private readonly logger = new Logger(NullProvider.name);

    getName(): string {
        return 'null';
    }

    async generateText(input: NarrationInput | GenericLLMInput): Promise<NarrationOutput> {
        this.logger.warn('Fallback to NullProvider. Returning static/simulated response.');

        let staticResponse: string;

        if ('prompt' in input) {
            staticResponse = `AI features are currently in standby. [Simulated Response for: ${input.prompt.substring(0, 50)}...]`;
        } else {
            // Simple template-based response for narration
            staticResponse = `
Here is your personalized diet plan! 
Based on your profile (${input.profileCtx}), this plan is designed to help you hit your targets.
The plan focuses on whole foods and balanced macros. 
*Note: AI generated insights are currently unavailable, but your plan is nutritionally precise.*
            `.trim();
        }

        return {
            content: staticResponse,
            provider: 'null',
            modelUsed: 'template-v1'
        };
    }
}
