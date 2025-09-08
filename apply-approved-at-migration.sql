-- Run this SQL in your Supabase SQL Editor to add approved_at field

-- Add approved_at field to companies table for tracking when companies are approved
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITHOUT TIME ZONE;

-- Update existing approved companies to have an approved_at timestamp
UPDATE public.companies 
SET approved_at = created_at 
WHERE is_approved = true AND approved_at IS NULL;

-- Verify the change
SELECT id, company_name, is_approved, approved_at, created_at 
FROM public.companies 
LIMIT 10;