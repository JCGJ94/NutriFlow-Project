import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { AppController } from './app.controller';

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

        // Rate Limiting
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 100,
        }]),

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
    controllers: [AppController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
