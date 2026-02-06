import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

export interface SearchResult {
    id: string;
    content: string;
    metadata: any;
    similarity: number;
}

@Injectable()
export class RagService {
    constructor(
        @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
    ) { }

    /**
     * Search for similar documents in the knowledge base
     * @param embedding The vector embedding of the query
     * @param limit Number of results to return
     * @param threshold Similarity threshold (0-1)
     */
    async searchSimilarDocuments(
        embedding: number[],
        limit = 5,
        threshold = 0.7,
    ): Promise<SearchResult[]> {
        const { data, error } = await this.supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: threshold,
            match_count: limit,
        });

        if (error) {
            throw new Error(`Vector search failed: ${error.message}`);
        }

        return data as SearchResult[];
    }

    /**
     * Insert a document with its embedding into the knowledge base
     */
    async insertDocument(
        content: string,
        embedding: number[],
        metadata: Record<string, any> = {},
    ) {
        const { data, error } = await this.supabase
            .from('knowledge_docs')
            .insert({
                content,
                embedding,
                metadata,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to insert document: ${error.message}`);
        }

        return data;
    }
}
