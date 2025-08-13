-- Create companies table
CREATE TABLE public.companies (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  business_number TEXT UNIQUE NOT NULL,
  industry TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  representative_name TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

-- Create matching_requests table
CREATE TABLE public.matching_requests (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  target_countries TEXT[] NOT NULL,
  company_description TEXT,
  additional_questions TEXT,
  product_info TEXT,
  market_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  workflow_status TEXT DEFAULT 'pending',
  admin_comments TEXT,
  ai_analysis JSONB,
  market_research JSONB,
  final_report JSONB,
  error_details JSONB,
  completed_at TIMESTAMP WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_companies_email ON public.companies(email);
CREATE INDEX idx_companies_business_number ON public.companies(business_number);
CREATE INDEX idx_matching_requests_company_id ON public.matching_requests(company_id);
CREATE INDEX idx_matching_requests_status ON public.matching_requests(status);