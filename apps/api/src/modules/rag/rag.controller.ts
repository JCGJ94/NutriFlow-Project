import { Controller, Post, Body, Get, Query, Logger } from '@nestjs/common';
import { RagService } from './rag.service';
import { GeminiService } from '../ai/gemini.service';
import { GoogleDriveService } from '../ai/google-drive.service';
import { ConfigService } from '@nestjs/config';

@Controller('rag')
export class RagController {
    private readonly logger = new Logger(RagController.name);

    constructor(
        private readonly ragService: RagService,
        private readonly geminiService: GeminiService,
        private readonly driveService: GoogleDriveService,
        private readonly configService: ConfigService,
    ) { }

    @Post('ingest')
    async ingestDocument(@Body() body: { content: string; metadata?: any }) {
        const { content, metadata } = body;

        // 1. Generate text embedding using Gemini
        const embedding = await this.geminiService.generateEmbedding(content);

        // 2. Store document and embedding in Supabase Vector Store
        const result = await this.ragService.insertDocument(
            content,
            embedding,
            metadata,
        );

        return {
            status: 'success',
            id: result.id,
            message: 'Document ingested and vectorized successfully'
        };
    }

    @Post('sync-drive')
    async syncFromDrive() {
        const folderId = this.configService.get<string>('GOOGLE_DRIVE_FOLDER_ID');
        if (!folderId) {
            return { error: 'GOOGLE_DRIVE_FOLDER_ID not configured' };
        }

        this.logger.log(`🔄 Starting sync from Drive folder: ${folderId}`);
        let files: any[] = [];
        try {
            files = await this.driveService.listFiles(folderId);
        } catch (error: any) {
            this.logger.error(`💥 Failed to list files: ${error.message}`);
            return { error: `Drive API Error: ${error.message}` };
        }

        let ingestedCount = 0;

        if (files.length === 0) {
            this.logger.warn('⚠️ No files found in the specified Drive folder.');
        }

        for (const file of files) {
            if (!file.id || !file.name) continue;

            // Skip non-document files if needed (like images or mental maps)
            const supportedTypes = [
                'application/vnd.google-apps.document',
                'text/plain',
                'text/markdown'
            ];

            if (!supportedTypes.includes(file.mimeType)) {
                this.logger.log(`⏩ Skipping unsupported file type: ${file.name} (${file.mimeType})`);
                continue;
            }

            try {
                this.logger.log(`📄 Processing file: ${file.name} (${file.id})`);
                const content = await this.driveService.getFileContent(file.id, file.mimeType || '');

                if (!content || content.trim().length === 0) {
                    this.logger.warn(`⚠️ Skipping empty file: ${file.name}`);
                    continue;
                }

                const embedding = await this.geminiService.generateEmbedding(content);
                await this.ragService.insertDocument(content, embedding, {
                    source: 'google-drive',
                    fileName: file.name,
                    fileId: file.id,
                    syncAt: new Date().toISOString()
                });
                ingestedCount++;
                this.logger.log(`✅ Successfully ingested: ${file.name}`);
            } catch (error: any) {
                this.logger.error(`❌ Failed to sync file ${file.name}: ${error.message}`);
            }
        }

        return {
            status: 'success',
            ingested: ingestedCount,
            total: files.length,
            message: `Synchronization complete. Ingested ${ingestedCount} out of ${files.length} found files.`
        };
    }

    @Get('search')
    async search(@Query('q') query: string) {
        if (!query) return { results: [] };

        // 1. Generate embedding for the query
        const embedding = await this.geminiService.generateEmbedding(query);

        // 2. Search for similar documents
        const results = await this.ragService.searchSimilarDocuments(embedding);

        return { query, results };
    }
}
