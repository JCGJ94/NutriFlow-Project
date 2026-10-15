/**
 * Google Drive file access helpers — plain functions, no DI.
 *
 * Uses the Google Drive REST API with an API key for public folder access.
 * Adapted from apps/api/src/modules/ai/google-drive.service.ts.
 *
 * Supported MIME types for ingestion:
 *   - application/vnd.google-apps.document  (exported as text/plain)
 *   - text/plain
 *   - text/markdown
 */

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
}

const SUPPORTED_MIME_TYPES = [
    'application/vnd.google-apps.document',
    'text/plain',
    'text/markdown',
] as const;

function getApiKey(): string {
    const key = process.env.GEMINI_API_KEY || '';
    if (!key) {
        console.warn('Google Drive API key (GEMINI_API_KEY) not found. Drive access may be limited.');
    }
    return key;
}

/**
 * List all files in a public Google Drive folder.
 */
export async function listDriveFiles(folderId: string): Promise<DriveFile[]> {
    const apiKey = getApiKey();
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&key=${apiKey}&fields=files(id,name,mimeType)`;

    const response = await fetch(url);
    const data: any = await response.json();

    if (data.error) {
        throw new Error(`Google Drive API Error: ${data.error.message}`);
    }

    return (data.files ?? []) as DriveFile[];
}

/**
 * Get the text content of a file from Google Drive.
 * Google Docs are exported as plain text; other types are fetched directly.
 */
export async function getDriveFileContent(fileId: string, mimeType: string): Promise<string> {
    const apiKey = getApiKey();
    let url: string;

    if (mimeType === 'application/vnd.google-apps.document') {
        url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain&key=${apiKey}`;
    } else {
        url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.text();
}

/**
 * Returns true if this MIME type is supported for ingestion.
 */
export function isSupportedMimeType(mimeType: string): boolean {
    return (SUPPORTED_MIME_TYPES as readonly string[]).includes(mimeType);
}
