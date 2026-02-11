import { Module } from '@nestjs/common';
import { ExercisePlansController } from './exercise-plans.controller';
import { ExercisePlansService } from './exercise-plans.service';
import { ExerciseEngineModule } from '../exercise-engine/exercise-engine.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { DietEngineModule } from '../diet-engine/diet-engine.module';

@Module({
    imports: [
        ExerciseEngineModule,
        ProfilesModule,
        DietEngineModule,
    ],
    controllers: [ExercisePlansController],
    providers: [ExercisePlansService],
    exports: [ExercisePlansService],
})
export class ExercisePlansModule { }
