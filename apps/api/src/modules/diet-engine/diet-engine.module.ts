import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { DietEngineService } from './diet-engine.service';
import { BmrCalculator } from './calculators/bmr.calculator';
import { MacrosCalculator } from './calculators/macros.calculator';
import { IngredientSelector } from './selectors/ingredient.selector';
import { AllergenRule } from './rules/allergen.rule';
import { DietPatternRule } from './rules/diet-pattern.rule';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { AiModule } from '../ai/ai.module';
import { AiDietService } from './ai-diet.service';
import { NotebooklmMcpService } from './notebooklm-mcp.service';

import { AiDietController } from './ai-diet.controller';
import { DietNarrationService } from './diet-narration.service';
import { TranslationBridgeService } from './translation-bridge.service';
import { LLMRouter } from './llm/llm.router';
import { GeminiProvider } from './llm/providers/gemini.provider';
import { OllamaProvider } from './llm/providers/ollama.provider';
import { NullProvider } from './llm/providers/null.provider';

@Module({
    imports: [IngredientsModule, ProfilesModule, AiModule, CacheModule.register({ ttl: 86400000 })],
    controllers: [AiDietController],
    providers: [
        DietEngineService,
        AiDietService,
        NotebooklmMcpService,
        BmrCalculator,
        MacrosCalculator,
        IngredientSelector,
        AllergenRule,
        DietPatternRule,
        // ADR-004: Generative AI decoupling
        DietNarrationService,
        LLMRouter,
        GeminiProvider,
        OllamaProvider,
        NullProvider,
        TranslationBridgeService,
    ],
    exports: [DietEngineService, AiDietService, DietNarrationService, TranslationBridgeService],
})
export class DietEngineModule { }
