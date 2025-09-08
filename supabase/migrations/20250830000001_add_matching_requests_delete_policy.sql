-- Enable RLS on matching_requests if not already enabled
ALTER TABLE public.matching_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Companies can view their own matching requests" ON public.matching_requests;
DROP POLICY IF EXISTS "Companies can insert their own matching requests" ON public.matching_requests;
DROP POLICY IF EXISTS "Companies can update their own matching requests" ON public.matching_requests;
DROP POLICY IF EXISTS "Admins can manage all matching requests" ON public.matching_requests;

-- Create policy for companies to view their own matching requests
CREATE POLICY "Companies can view their own matching requests" 
ON public.matching_requests 
FOR SELECT 
USING (
  company_id IN (
    SELECT id FROM public.companies 
    WHERE email = auth.jwt()->>'email'
  )
);

-- Create policy for companies to insert their own matching requests
CREATE POLICY "Companies can insert their own matching requests" 
ON public.matching_requests 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT id FROM public.companies 
    WHERE email = auth.jwt()->>'email'
  )
);

-- Create policy for companies to update their own matching requests
CREATE POLICY "Companies can update their own matching requests" 
ON public.matching_requests 
FOR UPDATE 
USING (
  company_id IN (
    SELECT id FROM public.companies 
    WHERE email = auth.jwt()->>'email'
  )
)
WITH CHECK (
  company_id IN (
    SELECT id FROM public.companies 
    WHERE email = auth.jwt()->>'email'
  )
);

-- Create comprehensive policy for admins to manage all matching requests
-- This includes SELECT, INSERT, UPDATE, and DELETE operations
CREATE POLICY "Admins can manage all matching requests" 
ON public.matching_requests 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE email = auth.jwt()->>'email' 
    AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE email = auth.jwt()->>'email' 
    AND is_admin = true
  )
);

-- Also ensure RLS is enabled on related tables
ALTER TABLE public.pdf_uploads ENABLE ROW LEVEL SECURITY;

-- Create admin delete policies for related tables if they don't exist
DROP POLICY IF EXISTS "Admins can manage all pdf_uploads" ON public.pdf_uploads;
CREATE POLICY "Admins can manage all pdf_uploads" 
ON public.pdf_uploads 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE email = auth.jwt()->>'email' 
    AND is_admin = true
  )
);


-- Add cascade delete constraint if not already present
-- This ensures related data is automatically deleted when a matching_request is deleted
ALTER TABLE public.pdf_uploads 
DROP CONSTRAINT IF EXISTS pdf_uploads_matching_request_id_fkey,
ADD CONSTRAINT pdf_uploads_matching_request_id_fkey 
  FOREIGN KEY (matching_request_id) 
  REFERENCES public.matching_requests(id) 
  ON DELETE CASCADE;

