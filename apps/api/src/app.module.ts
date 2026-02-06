import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { IngredientsModule } from './modules/ingredients/ingredients.module';
import { PlansModule } from './modules/plans/plans.module';
import { DietEngineModule } from './modules/diet-engine/diet-engine.module';
import { ShoppingListModule } from './modules/shopping-list/shopping-list.module';
import { AdminModule } from './modules/admin/admin.module';
import { SupabaseModule } from './config/supabase.module';
import { RagModule } from './modules/rag/rag.module';
import { AiModule } from './modules/ai/ai.module';
import { ExerciseEngineModule } from './modules/exercise-engine/exercise-engine.module';
import { ExercisePlansModule } from './modules/exercise-plans/exercise-plans.module';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [
                '../../.env.local',  // Monorepo root (PRIMARY)
                '../../.env',
                '.env.local',        // Local fallback
                '.env'
            ],
        }),

        // Supabase connection
        SupabaseModule,

        // Feature modules
        AuthModule,
        ProfilesModule,
        IngredientsModule,
        PlansModule,
        DietEngineModule,
        ShoppingListModule,
        AdminModule,
        RagModule,
        AiModule,
        ExerciseEngineModule,
        ExercisePlansModule,
    ],
})
export class AppModule { }
