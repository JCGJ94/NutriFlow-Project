import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { GoogleDriveService } from './google-drive.service';

@Module({
    imports: [ConfigModule],
    providers: [GeminiService, GoogleDriveService],
    exports: [GeminiService, GoogleDriveService],
})
export class AiModule { }
