-- Run this SQL in your Supabase SQL Editor to add delete permissions for admins
-- This version removes references to ai_insights table which doesn't exist

-- 1. Enable RLS on matching_requests and related tables
ALTER TABLE public.matching_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpt_analysis ENABLE ROW LEVEL SECURITY;

-- 2. Drop and recreate policies for matching_requests
DROP POLICY IF EXISTS "Companies can view their own matching requests" ON public.matching_requests;
DROP POLICY IF EXISTS "Companies can insert their own matching requests" ON public.matching_requests;
DROP POLICY IF EXISTS "Companies can update their own matching requests" ON public.matching_requests;
DROP POLICY IF EXISTS "Admins can manage all matching requests" ON public.matching_requests;

-- Companies can view their own
CREATE POLICY "Companies can view their own matching requests" 
ON public.matching_requests 
FOR SELECT 
USING (company_id IN (SELECT id FROM public.companies WHERE email = auth.jwt()->>'email'));

-- Companies can create their own
CREATE POLICY "Companies can insert their own matching requests" 
ON public.matching_requests 
FOR INSERT 
WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE email = auth.jwt()->>'email'));

-- Companies can update their own
CREATE POLICY "Companies can update their own matching requests" 
ON public.matching_requests 
FOR UPDATE 
USING (company_id IN (SELECT id FROM public.companies WHERE email = auth.jwt()->>'email'))
WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE email = auth.jwt()->>'email'));

-- IMPORTANT: Admins can do everything including DELETE
CREATE POLICY "Admins can manage all matching requests" 
ON public.matching_requests 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.companies WHERE email = auth.jwt()->>'email' AND is_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM public.companies WHERE email = auth.jwt()->>'email' AND is_admin = true));

-- 3. Create admin policies for related tables (pdf_uploads)
DROP POLICY IF EXISTS "Admins can manage all pdf_uploads" ON public.pdf_uploads;
CREATE POLICY "Admins can manage all pdf_uploads" 
ON public.pdf_uploads 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.companies WHERE email = auth.jwt()->>'email' AND is_admin = true));

-- Companies can view their own pdf_uploads
DROP POLICY IF EXISTS "Companies can view their own pdf_uploads" ON public.pdf_uploads;
CREATE POLICY "Companies can view their own pdf_uploads" 
ON public.pdf_uploads 
FOR SELECT 
USING (
  matching_request_id IN (
    SELECT id FROM public.matching_requests 
    WHERE company_id IN (
      SELECT id FROM public.companies 
      WHERE email = auth.jwt()->>'email'
    )
  )
);

-- 4. Ensure CASCADE DELETE is set up properly for pdf_uploads
ALTER TABLE public.pdf_uploads 
DROP CONSTRAINT IF EXISTS pdf_uploads_matching_request_id_fkey,
ADD CONSTRAINT pdf_uploads_matching_request_id_fkey 
  FOREIGN KEY (matching_request_id) 
  REFERENCES public.matching_requests(id) 
  ON DELETE CASCADE;

-- 5. Also set up CASCADE for gpt_analysis if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'gpt_analysis'
  ) THEN
    ALTER TABLE public.gpt_analysis 
    DROP CONSTRAINT IF EXISTS gpt_analysis_matching_request_id_fkey,
    ADD CONSTRAINT gpt_analysis_matching_request_id_fkey 
      FOREIGN KEY (matching_request_id) 
      REFERENCES public.matching_requests(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- 6. Set up CASCADE for mail_log if it references matching_requests
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'mail_log'
    AND column_name = 'matching_request_id'
  ) THEN
    ALTER TABLE public.mail_log 
    DROP CONSTRAINT IF EXISTS mail_log_matching_request_id_fkey,
    ADD CONSTRAINT mail_log_matching_request_id_fkey 
      FOREIGN KEY (matching_request_id) 
      REFERENCES public.matching_requests(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- 7. Verify the policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('matching_requests', 'pdf_uploads', 'gpt_analysis')
ORDER BY tablename, policyname;

-- 8. Check foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'matching_requests'
  AND tc.table_schema = 'public';