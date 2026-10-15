import { LLMProvider, NarrationInput, NarrationOutput, GenericLLMInput } from '../llm-provider.interface';

export const nullProvider: LLMProvider = {
    getName() {
        return 'null';
    },

    async generateText(input: NarrationInput | GenericLLMInput): Promise<NarrationOutput> {
        let staticResponse: string;

        if ('prompt' in input) {
            staticResponse = `AI features are currently in standby. [Simulated Response for: ${input.prompt.substring(0, 50)}...]`;
        } else {
            staticResponse = `Here is your personalized diet plan! Based on your profile (${input.profileCtx}), this plan is designed to help you hit your targets. The plan focuses on whole foods and balanced macros. *Note: AI generated insights are currently unavailable, but your plan is nutritionally precise.*`;
        }

        return {
            content: staticResponse,
            provider: 'null',
            modelUsed: 'template-v1',
        };
    },
};
