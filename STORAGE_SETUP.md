# PDF Storage Setup Instructions

The PDF upload feature requires a storage bucket named `pdf-uploads` in your Supabase project.

## Quick Setup via Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (ID: oglwwdxqsplqushlnwdh)
3. Navigate to **Storage** in the left sidebar
4. Click **New bucket**
5. Configure the bucket:
   - **Name**: `pdf-uploads`
   - **Public bucket**: ✅ Enable (toggle on)
   - **File size limit**: 50MB (52428800 bytes)
   - **Allowed MIME types**: `application/pdf`
6. Click **Create bucket**

## Alternative: SQL Setup

If you prefer using SQL, run this in the SQL Editor:

1. Go to **SQL Editor** in your Supabase Dashboard
2. Copy and paste the following SQL:

```sql
-- Create pdf-uploads storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdf-uploads',
  'pdf-uploads', 
  true, -- Public bucket
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
```

3. Click **Run** to execute the SQL

## Verification

After creating the bucket:

1. Go to **Storage** in your Supabase Dashboard
2. You should see the `pdf-uploads` bucket listed
3. Click on the bucket to verify:
   - It shows as **Public**
   - File size limit is set to 50MB
   - Only PDF files are allowed

## Troubleshooting

If you encounter issues:

1. **Bucket already exists error**: The bucket might already exist. You can safely ignore this error.
2. **Permission errors**: Make sure you're using an account with admin access to the project.
3. **PDF upload fails**: Verify that:
   - The file is a valid PDF
   - The file size is under 50MB
   - You're authenticated when uploading

## Testing the Setup

Once the bucket is created, you can test PDF uploads through the application:

1. Log into the application
2. Navigate to any page with PDF upload functionality
3. Try uploading a PDF file (must be under 50MB)
4. The file should upload successfully and be accessible via a public URL