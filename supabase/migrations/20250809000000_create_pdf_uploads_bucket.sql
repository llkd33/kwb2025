-- Create pdf-uploads storage bucket for PDF file uploads
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'pdf-uploads',
  'pdf-uploads', 
  true, -- Public bucket
  false, -- No AVIF auto-detection needed for PDFs
  52428800, -- 50MB file size limit
  ARRAY['application/pdf']::text[] -- Only allow PDF files
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf']::text[];

-- Create RLS policies for the bucket
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload PDFs" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pdf-uploads');

-- Allow authenticated users to update their own files
CREATE POLICY "Allow users to update their own PDFs" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'pdf-uploads' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'pdf-uploads');

-- Allow authenticated users to delete their own files  
CREATE POLICY "Allow users to delete their own PDFs" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'pdf-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access since it's a public bucket
CREATE POLICY "Allow public to read PDFs" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'pdf-uploads');