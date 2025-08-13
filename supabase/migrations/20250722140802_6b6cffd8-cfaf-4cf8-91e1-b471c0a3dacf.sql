-- Create gpt_prompts table for managing GPT prompts
CREATE TABLE public.gpt_prompts (
  id SERIAL PRIMARY KEY,
  prompt_type TEXT NOT NULL UNIQUE, -- 'company_analysis', 'market_research', 'final_report'
  prompt_title TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  created_by INTEGER REFERENCES public.companies(id)
);

-- Create market_data table for storing Excel reference data
CREATE TABLE public.market_data (
  id SERIAL PRIMARY KEY,
  data_category TEXT NOT NULL, -- 'countries', 'industries', 'partners', 'regulations'
  country TEXT,
  industry TEXT,
  data_content JSONB NOT NULL,
  source_file TEXT,
  uploaded_by INTEGER REFERENCES public.companies(id),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.gpt_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for gpt_prompts (admin only)
CREATE POLICY "Admins can manage GPT prompts" 
ON public.gpt_prompts 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.companies WHERE email = auth.jwt()->>'email' AND is_admin = true));

-- Create RLS policies for market_data (admin only)
CREATE POLICY "Admins can manage market data" 
ON public.market_data 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.companies WHERE email = auth.jwt()->>'email' AND is_admin = true));

-- Insert default GPT prompts
INSERT INTO public.gpt_prompts (prompt_type, prompt_title, system_prompt, user_prompt_template) VALUES
(
  'company_analysis',
  '기업 분석 프롬프트',
  'You are a world-class business analyst specializing in international market expansion. Analyze companies with the precision and depth of Goldman Sachs research reports.',
  'Analyze the following company for international expansion:

Company: {company_name}
Industry: {industry}
Target Countries: {target_countries}
Company Description: {company_description}
Products/Services: {product_info}
Market Experience: {market_info}

Provide a comprehensive analysis including:
1. Company Strengths & Competitive Advantages
2. Market Readiness Assessment
3. Potential Challenges & Risks
4. Strategic Recommendations

Format the response in Korean with clear sections and actionable insights.'
),
(
  'market_research',
  '시장 조사 프롬프트', 
  'You are a senior market research analyst with expertise in global markets. Provide detailed market intelligence for international business expansion.',
  'Conduct detailed market research for:

Company: {company_name}
Target Countries: {target_countries}
Industry: {industry}
Additional Questions: {additional_questions}

Using current market data, provide:
1. Market Size & Growth Projections
2. Competitive Landscape
3. Regulatory Environment
4. Entry Barriers & Opportunities
5. Local Partnership Opportunities

Ensure all information is current and actionable. Format in Korean.'
),
(
  'final_report',
  '최종 리포트 프롬프트',
  'You are creating a comprehensive international expansion report combining company analysis, market research, and strategic recommendations. This should be Goldman Sachs quality.',
  'Create a comprehensive international expansion report:

COMPANY ANALYSIS:
{company_analysis}

MARKET RESEARCH:
{market_research}

REFERENCE DATA:
{reference_data}

Create a final executive summary report in Korean including:
1. Executive Summary
2. Market Entry Strategy
3. Risk Assessment & Mitigation
4. Investment Requirements
5. Timeline & Milestones
6. Partner & Investor Recommendations
7. Success Metrics

Format as a professional consulting report with clear action items.'
);

-- Create indexes for better performance
CREATE INDEX idx_gpt_prompts_type ON public.gpt_prompts(prompt_type);
CREATE INDEX idx_gpt_prompts_active ON public.gpt_prompts(is_active);
CREATE INDEX idx_market_data_category ON public.market_data(data_category);
CREATE INDEX idx_market_data_country ON public.market_data(country);
CREATE INDEX idx_market_data_industry ON public.market_data(industry);

-- Create trigger for updating timestamps
CREATE TRIGGER update_gpt_prompts_updated_at
BEFORE UPDATE ON public.gpt_prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_data_updated_at
BEFORE UPDATE ON public.market_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();