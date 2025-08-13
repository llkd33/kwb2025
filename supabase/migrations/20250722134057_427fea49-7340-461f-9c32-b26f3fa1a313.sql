-- Create storage bucket for business documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-documents', 'business-documents', false);

-- Create storage policies for business documents
CREATE POLICY "Companies can upload their own business documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'business-documents' AND 
  auth.jwt() IS NOT NULL AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM public.companies 
    WHERE email = auth.jwt()->>'email'
  )
);

CREATE POLICY "Companies can view their own business documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'business-documents' AND 
  auth.jwt() IS NOT NULL AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM public.companies 
    WHERE email = auth.jwt()->>'email'
  )
);

CREATE POLICY "Admins can view all business documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'business-documents' AND 
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE email = auth.jwt()->>'email' AND is_admin = true
  )
);

CREATE POLICY "Companies can update their own business documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'business-documents' AND 
  auth.jwt() IS NOT NULL AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM public.companies 
    WHERE email = auth.jwt()->>'email'
  )
);

CREATE POLICY "Companies can delete their own business documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'business-documents' AND 
  auth.jwt() IS NOT NULL AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM public.companies 
    WHERE email = auth.jwt()->>'email'
  )
);