import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleDriveService {
    private readonly logger = new Logger(GoogleDriveService.name);
    private readonly apiKey: string;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
        if (!this.apiKey) {
            this.logger.warn('⚠️ API Key not found. Drive access might be limited.');
        }
    }

    /**
     * List all files in a specific public folder using API Key
     */
    async listFiles(folderId: string): Promise<any[]> {
        try {
            const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
            const url = `https://www.googleapis.com/drive/v3/files?q=${query}&key=${this.apiKey}&fields=files(id,name,mimeType)`;

            this.logger.debug(`🔍 Calling Google Drive API: ${url.replace(this.apiKey, 'API_KEY_HIDDEN')}`);

            const response = await fetch(url);
            const data: any = await response.json();

            this.logger.debug(`📡 Google Drive Response: ${JSON.stringify(data)}`);

            if (data.error) {
                this.logger.error(`Google API Error: ${data.error.message} (Code: ${data.error.code})`);
                throw new Error(data.error.message);
            }

            return data.files || [];
        } catch (error: any) {
            this.logger.error(`💥 Error listing Drive files: ${error.message}`);
            throw error; // Rethrow so the controller can report it
        }
    }

    /**
     * Get the content of a public file
     */
    async getFileContent(fileId: string, mimeType: string): Promise<string> {
        try {
            let url: string;

            // Check specifically for Google Docs
            if (mimeType === 'application/vnd.google-apps.document') {
                url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain&key=${this.apiKey}`;
            } else {
                url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${this.apiKey}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                // If text/plain export fails or is restricted, it might return a 403
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.text();
        } catch (error: any) {
            this.logger.error(`💥 Error getting file content (${fileId}): ${error.message}`);
            throw error;
        }
    }
}
