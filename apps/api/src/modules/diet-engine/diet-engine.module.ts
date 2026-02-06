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

@Module({
    imports: [IngredientsModule, ProfilesModule, AiModule],
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
    ],
    exports: [DietEngineService, AiDietService],
})
export class DietEngineModule { }
