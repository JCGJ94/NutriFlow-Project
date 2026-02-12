import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

@Injectable()
export class NotebooklmMcpService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(NotebooklmMcpService.name);
    private client: Client;
    private transport?: StdioClientTransport;
    private isConnected = false;

    constructor(private readonly configService: ConfigService) {
        this.client = new Client(
            {
                name: 'NutriFlow-API',
                version: '0.1.0',
            },
            {
                capabilities: {},
            },
        );
    }

    async onModuleInit() {
        // We no longer connect on init to avoid blocking the application startup
        // Connection will happen lazily on the first query
        this.logger.log('Knowledge Service initialized (Lazy mode)');
    }

    private async ensureConnection() {
        if (this.isConnected && this.transport) {
            return;
        }

        try {
            const mcpPath = this.configService.get<string>('NOTEBOOKLM_MCP_PATH');

            if (!mcpPath) {
                this.logger.log('Connecting to Knowledge Service via local bridge...');
                this.transport = new StdioClientTransport({
                    command: 'npx',
                    args: ['--no-install', 'notebooklm-mcp'],
                });
            } else {
                this.logger.log('Connecting to Knowledge Service via custom path...');
                this.transport = new StdioClientTransport({
                    command: mcpPath,
                });
            }

            await this.client.connect(this.transport);
            this.isConnected = true;
            this.logger.log('✅ Knowledge Service connected successfully');
        } catch (error: any) {
            this.isConnected = false;
            this.logger.error('❌ Failed to connect to Knowledge Service', error.stack);
            throw new Error('Knowledge Service is currently unavailable');
        }
    }

    async onModuleDestroy() {
        if (this.transport) {
            try {
                await this.transport.close();
            } catch (e) {
                // Ignore close errors
            }
        }
    }

    async query(notebookId: string, query: string): Promise<string> {
        await this.ensureConnection();

        try {
            const response = await this.client.callTool({
                name: 'notebook_query',
                arguments: {
                    notebook_id: notebookId,
                    query: query,
                },
            });

            // Assuming response content is text and follows MCP spec
            const content = response.content as any[];
            if (!content || content.length === 0) {
                return '';
            }

            return content[0].text || '';
        } catch (error: any) {
            this.logger.error(`Error querying NotebookLM: ${error.message}`);
            throw error;
        }
    }
}

