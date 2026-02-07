-- =============================================
-- NutriFlow MVP - AI Knowledge Base Schema
-- =============================================
-- Requires: Supabase with "vector" extension enabled
-- Run this in your Supabase SQL Editor

-- 1. Enable pgvector extension
-- Note: You might need superuser privileges or enable it via Dashboard > Database > Extensions
create extension if not exists vector with schema extensions;

-- 2. Create Knowledge Docs Table
-- Stores chunks of text (recipes, nutrition info) with their embeddings
create table if not exists knowledge_docs (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  metadata jsonb default '{}'::jsonb, -- Store source, title, tags, etc.
  embedding vector(768), -- Gemini text-embedding-004 dimensions (768)
  created_at timestamptz default now()
);

-- Index for faster similarity search (IVFFlat)
-- We create it only if there are enough rows, but declaring it early helps plan
-- For <2000 rows, exact search (collections scan) is fine. 
-- For >2000 columns, recommended to add an index.
-- create index if not exists knowledge_docs_embedding_idx 
-- on knowledge_docs 
-- using ivfflat (embedding vector_cosine_ops)
-- with (lists = 100);

-- 3. Similarity Search Function
-- Used by the RAG Service to find relevant context
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    knowledge_docs.id,
    knowledge_docs.content,
    knowledge_docs.metadata,
    1 - (knowledge_docs.embedding <=> query_embedding) as similarity
  from knowledge_docs
  where 1 - (knowledge_docs.embedding <=> query_embedding) > match_threshold
  order by knowledge_docs.embedding <=> query_embedding
  limit match_count;
end;
$$;
