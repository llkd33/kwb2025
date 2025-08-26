-- Script to fix RLS policies and database structure issues
-- Run this in your Supabase SQL Editor

-- 1. Remove password field from companies table (using Supabase Auth instead)
ALTER TABLE public.companies DROP COLUMN IF EXISTS password;

-- 2. Add missing columns to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS ceo_name TEXT,
ADD COLUMN IF NOT EXISTS manager_name TEXT,
ADD COLUMN IF NOT EXISTS manager_position TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS headquarters_country TEXT,
ADD COLUMN IF NOT EXISTS headquarters_city TEXT,
ADD COLUMN IF NOT EXISTS founding_year INTEGER,
ADD COLUMN IF NOT EXISTS employee_count TEXT,
ADD COLUMN IF NOT EXISTS revenue_scale TEXT,
ADD COLUMN IF NOT EXISTS main_products TEXT,
ADD COLUMN IF NOT EXISTS target_market TEXT,
ADD COLUMN IF NOT EXISTS competitive_advantage TEXT,
ADD COLUMN IF NOT EXISTS company_vision TEXT;

-- 3. Drop existing RLS policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON public.companies;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.companies;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.companies;
DROP POLICY IF EXISTS "Enable delete for admin users" ON public.companies;
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON public.companies;
DROP POLICY IF EXISTS "Enable companies to register" ON public.companies;
DROP POLICY IF EXISTS "Companies can update own data" ON public.companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON public.companies;

-- 4. Enable RLS on companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 5. Create new RLS policies for companies table

-- Allow public read access to company information
CREATE POLICY "Companies are viewable by everyone"
  ON public.companies FOR SELECT
  USING (true);

-- Allow new companies to register (anonymous users need to insert)
CREATE POLICY "Enable companies to register"
  ON public.companies FOR INSERT
  WITH CHECK (true);

-- Allow companies to update their own information based on auth email
CREATE POLICY "Companies can update own data"
  ON public.companies FOR UPDATE
  USING (
    auth.email() = email OR
    is_admin = true
  )
  WITH CHECK (
    auth.email() = email OR
    is_admin = true
  );

-- Allow admins to delete companies
CREATE POLICY "Admins can delete companies"
  ON public.companies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE email = auth.email() AND is_admin = true
    )
  );

-- 6. Create business_registration table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.business_registration (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  document_url TEXT,
  document_name TEXT,
  file_size BIGINT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Drop existing RLS policies for business_registration if any
DROP POLICY IF EXISTS "Business registrations are viewable by company owners and admins" ON public.business_registration;
DROP POLICY IF EXISTS "Companies can insert their own business registration" ON public.business_registration;
DROP POLICY IF EXISTS "Companies can update their own business registration" ON public.business_registration;
DROP POLICY IF EXISTS "Admins can delete business registrations" ON public.business_registration;

-- 8. Enable RLS on business_registration table
ALTER TABLE public.business_registration ENABLE ROW LEVEL SECURITY;

-- 9. RLS policies for business_registration table
CREATE POLICY "Business registrations are viewable by company owners and admins"
  ON public.business_registration FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE id = business_registration.company_id
      AND (email = auth.email() OR is_admin = true)
    )
  );

-- Allow any authenticated user to insert (will be linked to their company during signup)
CREATE POLICY "Companies can insert their own business registration"
  ON public.business_registration FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Companies can update their own business registration"
  ON public.business_registration FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE id = business_registration.company_id
      AND email = auth.email()
    )
  );

CREATE POLICY "Admins can delete business registrations"
  ON public.business_registration FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE email = auth.email() AND is_admin = true
    )
  );

-- 10. Create storage bucket for business documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'business-documents', 
  'business-documents', 
  false,
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 11. Drop existing storage policies if any
DROP POLICY IF EXISTS "Authenticated users can upload business documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view business documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete business documents" ON storage.objects;

-- 12. Storage policies for business-documents bucket
CREATE POLICY "Authenticated users can upload business documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'business-documents' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can view business documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'business-documents' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Admins can delete business documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'business-documents' AND
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE email = auth.email() AND is_admin = true
    )
  );