import { Test, TestingModule } from '@nestjs/testing';
import { DietEngineService } from './diet-engine.service';
import { BmrCalculator } from './calculators/bmr.calculator';
import { MacrosCalculator } from './calculators/macros.calculator';
import { IngredientSelector } from './selectors/ingredient.selector';
import { AllergenRule } from './rules/allergen.rule';
import { DietPatternRule } from './rules/diet-pattern.rule';

describe('DietEngineService', () => {
    let service: DietEngineService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DietEngineService,
                { provide: BmrCalculator, useValue: { calculateBmr: vi.fn() } },
                { provide: MacrosCalculator, useValue: { calculateMacros: vi.fn(), calculateMealMacros: vi.fn() } },
                { provide: IngredientSelector, useValue: { selectIngredientsForMeal: vi.fn() } },
                { provide: AllergenRule, useValue: { filterByAllergens: vi.fn() } },
                { provide: DietPatternRule, useValue: { filterByDietPattern: vi.fn() } },
            ],
        }).compile();

        service = module.get<DietEngineService>(DietEngineService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
