import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { PlansRepository } from './plans.repository';
import { DietEngineModule } from '../diet-engine/diet-engine.module';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { ExercisePlansModule } from '../exercise-plans/exercise-plans.module';

@Module({
    imports: [
        DietEngineModule,
        IngredientsModule,
        ProfilesModule,
        ExercisePlansModule,
    ],
    controllers: [PlansController],
    providers: [PlansService, PlansRepository],
    exports: [PlansService],
})
export class PlansModule { }
