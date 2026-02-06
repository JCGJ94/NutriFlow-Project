import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { SupabaseModule } from '../../config/supabase.module';

import { AiModule } from '../ai/ai.module';

@Module({
    imports: [SupabaseModule, AiModule], // Need Supabase client for vector search, Gemini for embeddings
    controllers: [RagController],
    providers: [RagService],
    exports: [RagService],
})
export class RagModule { }
