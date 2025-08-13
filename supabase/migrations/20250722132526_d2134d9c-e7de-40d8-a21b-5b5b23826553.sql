-- Create business_registration table for storing business registration documents
CREATE TABLE public.business_registration (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  document_url TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITHOUT TIME ZONE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_notes TEXT
);

-- Create gpt_analysis table for storing AI analysis results
CREATE TABLE public.gpt_analysis (
  id SERIAL PRIMARY KEY,
  matching_request_id INTEGER NOT NULL REFERENCES public.matching_requests(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL, -- 'company_analysis', 'market_research', 'final_report'
  prompt_used TEXT,
  raw_response TEXT,
  structured_data JSONB,
  tokens_used INTEGER,
  processing_time INTEGER, -- in milliseconds
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

-- Create excel_reference table for storing Excel data references
CREATE TABLE public.excel_reference (
  id SERIAL PRIMARY KEY,
  file_name TEXT NOT NULL,
  sheet_name TEXT NOT NULL,
  data_type TEXT NOT NULL, -- 'partners', 'countries', 'industries'
  data_content JSONB NOT NULL,
  last_updated TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create mail_log table for tracking email communications
CREATE TABLE public.mail_log (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES public.companies(id) ON DELETE SET NULL,
  matching_request_id INTEGER REFERENCES public.matching_requests(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL, -- 'welcome', 'analysis_complete', 'admin_notification'
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT,
  sent_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  delivery_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  template_used TEXT
);

-- Enable Row Level Security
ALTER TABLE public.business_registration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpt_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excel_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business_registration
CREATE POLICY "Companies can view their own business registration" 
ON public.business_registration 
FOR SELECT 
USING (company_id IN (SELECT id FROM public.companies WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Companies can insert their own business registration" 
ON public.business_registration 
FOR INSERT 
WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE email = auth.jwt()->>'email'));

-- Admin policies for business_registration
CREATE POLICY "Admins can view all business registrations" 
ON public.business_registration 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.companies WHERE email = auth.jwt()->>'email' AND is_admin = true));

-- Create RLS policies for gpt_analysis (admin only)
CREATE POLICY "Admins can manage gpt_analysis" 
ON public.gpt_analysis 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.companies WHERE email = auth.jwt()->>'email' AND is_admin = true));

-- Create RLS policies for excel_reference (admin only)
CREATE POLICY "Admins can manage excel_reference" 
ON public.excel_reference 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.companies WHERE email = auth.jwt()->>'email' AND is_admin = true));

-- Create RLS policies for mail_log
CREATE POLICY "Companies can view their own mail logs" 
ON public.mail_log 
FOR SELECT 
USING (company_id IN (SELECT id FROM public.companies WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Admins can view all mail logs" 
ON public.mail_log 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.companies WHERE email = auth.jwt()->>'email' AND is_admin = true));

-- Create indexes for better performance
CREATE INDEX idx_business_registration_company_id ON public.business_registration(company_id);
CREATE INDEX idx_gpt_analysis_matching_request_id ON public.gpt_analysis(matching_request_id);
CREATE INDEX idx_gpt_analysis_type ON public.gpt_analysis(analysis_type);
CREATE INDEX idx_excel_reference_data_type ON public.excel_reference(data_type);
CREATE INDEX idx_mail_log_company_id ON public.mail_log(company_id);
CREATE INDEX idx_mail_log_email_type ON public.mail_log(email_type);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for gpt_analysis
CREATE TRIGGER update_gpt_analysis_updated_at
BEFORE UPDATE ON public.gpt_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();