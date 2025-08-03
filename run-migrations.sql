-- Copy and paste this entire SQL into Supabase SQL Editor

-- 프롬프트 템플릿 테이블
CREATE TABLE IF NOT EXISTS public.prompt_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('gpt', 'perplexity')),
  template TEXT NOT NULL,
  variables JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

-- 기본 프롬프트 템플릿 추가
INSERT INTO public.prompt_templates (name, type, template, variables) VALUES
(
  'comprehensive_analysis_gpt',
  'gpt',
  '회사명: {{company_name}}
업종: {{industry}}
타겟 국가: {{target_countries}}
사업 목표: {{business_goals}}
제출 문서: {{documents}}

참조 데이터베이스:
{{excel_reference_data}}

위 정보를 바탕으로 Goldman Sachs급 비즈니스 분석 리포트를 작성해주세요. 다음 섹션을 포함해야 합니다:

1. 경영진 요약 (Executive Summary)
2. 회사 분석 (Company Analysis)
   - 강점과 약점
   - 핵심 역량
   - 시장 포지셔닝
3. 타겟 시장 분석 (Target Market Analysis)
   - 시장 규모와 성장성
   - 경쟁 환경
   - 진입 장벽
4. 매칭 추천 (Partner Recommendations)
   - 추천 파트너 리스트
   - 각 파트너의 장단점
   - 협력 전략
5. 시장 진출 전략 (Market Entry Strategy)
   - 단계별 실행 계획
   - 필요 자원
   - 리스크 관리
6. 재무 전망 (Financial Projections)
   - 예상 매출
   - 투자 요구사항
   - ROI 분석

JSON 형식으로 응답해주세요.',
  '{"company_name": "회사명", "industry": "업종", "target_countries": "타겟 국가", "business_goals": "비즈니스 목표", "documents": "제출 문서 목록", "excel_reference_data": "엑셀 참조 데이터"}'::jsonb
)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.prompt_templates (name, type, template, variables) VALUES
(
  'market_research_perplexity',
  'perplexity',
  '회사: {{company_name}} ({{industry}})
타겟 국가: {{target_countries}}

다음 정보를 실시간으로 검색하여 제공해주세요:
1. {{target_countries}}의 최신 시장 동향 (2024년 기준)
2. {{industry}} 산업의 현지 규제 및 정책
3. 주요 경쟁사 현황
4. 최근 M&A 및 투자 사례
5. 현지 파트너십 기회

참조할 데이터베이스 정보:
{{excel_reference_data}}',
  '{"company_name": "회사명", "industry": "업종", "target_countries": "타겟 국가", "excel_reference_data": "엑셀 참조 데이터"}'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- 보고서 워크플로우 상태 추가
ALTER TABLE public.matching_requests 
ADD COLUMN IF NOT EXISTS workflow_status TEXT DEFAULT 'pending' 
CHECK (workflow_status IN ('pending', 'documents_uploaded', 'ai_processing', 'admin_review', 'admin_approved', 'completed', 'rejected'));

ALTER TABLE public.matching_requests
ADD COLUMN IF NOT EXISTS admin_comments TEXT,
ADD COLUMN IF NOT EXISTS admin_modifications JSONB,
ADD COLUMN IF NOT EXISTS gpt_prompt_used TEXT,
ADD COLUMN IF NOT EXISTS perplexity_prompt_used TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES public.companies(id);

-- PDF 업로드 테이블
CREATE TABLE IF NOT EXISTS public.pdf_uploads (
  id SERIAL PRIMARY KEY,
  matching_request_id INTEGER NOT NULL REFERENCES public.matching_requests(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITHOUT TIME ZONE,
  extracted_text TEXT,
  metadata JSONB
);

-- RLS 정책 추가
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_uploads ENABLE ROW LEVEL SECURITY;

-- 관리자만 프롬프트 템플릿 관리 가능
CREATE POLICY "Admins can manage prompt templates" 
ON public.prompt_templates 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.companies WHERE email = auth.jwt()->>'email' AND is_admin = true));

-- 회사는 자신의 PDF 업로드만 볼 수 있음
CREATE POLICY "Companies can view own PDF uploads" 
ON public.pdf_uploads 
FOR SELECT 
USING (
  matching_request_id IN (
    SELECT id FROM public.matching_requests 
    WHERE company_id IN (
      SELECT id FROM public.companies WHERE email = auth.jwt()->>'email'
    )
  )
);

-- 관리자는 모든 PDF 업로드 관리 가능
CREATE POLICY "Admins can manage all PDF uploads" 
ON public.pdf_uploads 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.companies WHERE email = auth.jwt()->>'email' AND is_admin = true));

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_matching_requests_workflow_status ON public.matching_requests(workflow_status);
CREATE INDEX IF NOT EXISTS idx_pdf_uploads_matching_request_id ON public.pdf_uploads(matching_request_id);