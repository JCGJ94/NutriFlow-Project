import { Module } from '@nestjs/common';
import { ExerciseEngineService } from './exercise-engine.service';

@Module({
    providers: [ExerciseEngineService],
    exports: [ExerciseEngineService],
})
export class ExerciseEngineModule { }
