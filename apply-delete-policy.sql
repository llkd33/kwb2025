-- Run this SQL in your Supabase SQL Editor to add delete permissions for admins

-- 1. Enable RLS on matching_requests and related tables
ALTER TABLE public.matching_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

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

-- 3. Create admin policies for related tables
DROP POLICY IF EXISTS "Admins can manage all pdf_uploads" ON public.pdf_uploads;
CREATE POLICY "Admins can manage all pdf_uploads" 
ON public.pdf_uploads 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.companies WHERE email = auth.jwt()->>'email' AND is_admin = true));

DROP POLICY IF EXISTS "Admins can manage all ai_insights" ON public.ai_insights;
CREATE POLICY "Admins can manage all ai_insights" 
ON public.ai_insights 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.companies WHERE email = auth.jwt()->>'email' AND is_admin = true));

-- 4. Ensure CASCADE DELETE is set up properly
ALTER TABLE public.pdf_uploads 
DROP CONSTRAINT IF EXISTS pdf_uploads_matching_request_id_fkey,
ADD CONSTRAINT pdf_uploads_matching_request_id_fkey 
  FOREIGN KEY (matching_request_id) 
  REFERENCES public.matching_requests(id) 
  ON DELETE CASCADE;

ALTER TABLE public.ai_insights 
DROP CONSTRAINT IF EXISTS ai_insights_matching_request_id_fkey,
ADD CONSTRAINT ai_insights_matching_request_id_fkey 
  FOREIGN KEY (matching_request_id) 
  REFERENCES public.matching_requests(id) 
  ON DELETE CASCADE;

-- 5. Verify the policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('matching_requests', 'pdf_uploads', 'ai_insights')
ORDER BY tablename, policyname;