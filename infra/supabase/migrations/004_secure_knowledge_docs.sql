-- =============================================
-- NutriFlow Security Updates - Secure Knowledge Docs
-- =============================================
-- Enable RLS on knowledge_docs to prevent unauthorized access
-- Run this AFTER 003_ai_knowledge_schema.sql

-- 1. Enable RLS
ALTER TABLE knowledge_docs ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies

-- Policy: Allow all authenticated users to READ knowledge docs (Shared Knowledge Base)
-- If this data is sensitive/personal, change to: USING (auth.uid() = user_id)
CREATE POLICY "Authenticated users can view knowledge docs"
  ON knowledge_docs FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Service Role (Admin/Backend) has full access
-- (Implicitly true for service_role, but explicit policies can be safer if using local role switching)
-- No explicit policy needed for service_role as it bypasses RLS by default, 
-- but we ensure NO ONE ELSE can insert/update/delete via API by NOT adding those policies for 'public' or 'authenticated'.

-- 3. Safety Check: Verify match_documents security
-- Since match_documents is usually defined with default security (INVOKER),
-- it will now respect the RLS policies above. 
-- A user calling the function will only see rows permitted by "Authenticated users can view knowledge docs".

SELECT 'RLS enabled on knowledge_docs' as message;
