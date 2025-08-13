-- Update GPT prompts to match the standard report format
UPDATE gpt_prompts SET 
  system_prompt = 'You are an expert business analyst specializing in comprehensive company analysis and market research. Your task is to analyze companies and provide detailed, structured reports that help with business matching and investment decisions.',
  user_prompt_template = 'Analyze the following company data and provide a comprehensive report in the exact format specified below:

Company Information:
- Company Name: {{company_name}}
- Industry: {{industry}}
- Country: {{country}}
- Business Description: {{business_description}}
- Products/Services: {{products_services}}
- Target Market: {{target_market}}
- Competitive Advantage: {{competitive_advantage}}

Please provide your analysis in the following structured format:

## 1. 회사 개요 (Company Overview)
- 기업명 및 설립연도
- 주요 사업 분야
- 본사 위치 및 규모

## 2. 사업 모델 분석 (Business Model Analysis)
- 핵심 제품/서비스
- 수익 구조
- 고객 세그먼트
- 가치 제안

## 3. 시장 환경 분석 (Market Environment Analysis)
- 목표 시장 규모 및 성장성
- 주요 경쟁사 분석
- 시장 내 포지셔닝
- 진입 장벽 및 기회 요인

## 4. 기술 및 혁신 (Technology & Innovation)
- 핵심 기술 역량
- 특허 및 지적재산권
- 연구개발 투자
- 기술적 차별화 요소

## 5. 재무 현황 (Financial Status)
- 매출 규모 및 성장률
- 수익성 지표
- 자금 조달 현황
- 투자 유치 이력

## 6. 리스크 요인 (Risk Factors)
- 사업 리스크
- 시장 리스크
- 기술 리스크
- 규제 리스크

## 7. 성장 잠재력 (Growth Potential)
- 단기 성장 동력
- 중장기 성장 전략
- 글로벌 확장 가능성
- 신규 사업 기회

## 8. 종합 평가 (Overall Assessment)
- 강점 (Strengths)
- 약점 (Weaknesses)
- 기회 (Opportunities)
- 위협 (Threats)

## 9. 투자 및 파트너십 권고사항 (Investment & Partnership Recommendations)
- 적합한 투자자 유형
- 권장 파트너십 형태
- 투자 시점 및 규모
- 기대 수익률 및 리스크 수준

Provide detailed, actionable insights for each section.'
WHERE prompt_type = 'company_analysis';

UPDATE gpt_prompts SET 
  system_prompt = 'You are a market research specialist who creates comprehensive market analysis reports. Focus on providing data-driven insights and actionable market intelligence.',
  user_prompt_template = 'Based on the following market research data, create a detailed market analysis report:

Market Data: {{market_data}}
Company Context: {{company_name}} in {{industry}} industry
Target Countries: {{target_countries}}

Structure your analysis as follows:

## 1. 시장 개관 (Market Overview)
- 시장 규모 및 성장률
- 주요 트렌드
- 시장 세분화

## 2. 경쟁 환경 (Competitive Landscape)  
- 주요 플레이어 분석
- 시장 점유율
- 경쟁 강도

## 3. 고객 분석 (Customer Analysis)
- 타겟 고객 프로필
- 구매 패턴
- 고객 요구사항

## 4. 시장 기회 (Market Opportunities)
- 신규 시장 기회
- 미충족 고객 니즈
- 성장 동력

## 5. 진입 전략 (Market Entry Strategy)
- 권장 진입 방식
- 파트너십 기회
- 투자 요구사항

## 6. 리스크 및 도전과제 (Risks & Challenges)
- 시장 진입 장벽
- 규제 환경
- 잠재적 위험요소

Provide specific, actionable recommendations for market entry.'
WHERE prompt_type = 'market_research';

-- Insert or update Perplexity prompts with the standard format
INSERT INTO gpt_prompts (prompt_type, prompt_title, system_prompt, user_prompt_template, is_active, created_at)
VALUES (
  'perplexity_market_research',
  'Perplexity 시장 조사',
  'You are a market research analyst who provides real-time market intelligence using web search capabilities. Focus on current market data, trends, and competitive intelligence.',
  'Research the current market conditions for {{industry}} industry in {{target_countries}}. 

Provide a comprehensive market analysis covering:

## 1. 최신 시장 동향 (Latest Market Trends)
- 현재 시장 규모 및 성장률
- 최근 6개월 내 주요 변화
- 신기술 및 혁신 트렌드

## 2. 주요 경쟁사 현황 (Key Competitors Status)
- 시장 리더 및 신규 진입자
- 최근 투자 및 인수합병 동향
- 경쟁사 전략 변화

## 3. 규제 및 정책 환경 (Regulatory Environment)
- 최신 규제 변화
- 정부 정책 및 지원책
- 컴플라이언스 요구사항

## 4. 투자 및 펀딩 동향 (Investment & Funding Trends)
- 최근 투자 라운드
- 주요 투자자 관심 분야
- 펀딩 규모 및 밸류에이션 트렌드

## 5. 기술 혁신 및 특허 동향 (Technology & Patent Trends)
- 신기술 개발 현황
- 주요 특허 출원 동향
- 기술 표준화 움직임

Use only current, verifiable information from reliable sources. Include specific data points, dates, and source references where possible.',
  true,
  NOW()
)
ON CONFLICT (prompt_type) DO UPDATE SET
  prompt_title = EXCLUDED.prompt_title,
  system_prompt = EXCLUDED.system_prompt,
  user_prompt_template = EXCLUDED.user_prompt_template,
  updated_at = now();

-- Insert final report synthesis prompt
INSERT INTO gpt_prompts (prompt_type, prompt_title, system_prompt, user_prompt_template, is_active, created_at)
VALUES (
  'final_report_synthesis',
  '최종 리포트 통합',
  'You are a senior business consultant who synthesizes multiple analysis reports into a comprehensive final report for investment and partnership decisions.',
  'Synthesize the following analyses into a comprehensive final report:

Company Analysis: {{company_analysis}}
Market Research: {{market_research}}
Perplexity Market Intelligence: {{perplexity_research}}

Create a unified report with the following structure:

## 경영진 요약 (Executive Summary)
- 핵심 발견사항 3-5개
- 주요 권고사항
- 투자 또는 파트너십 적합성 평가

## 1. 기업 및 시장 종합 분석 (Comprehensive Company & Market Analysis)
### 1.1 기업 경쟁력 평가
### 1.2 시장 포지셔닝 분석
### 1.3 성장 잠재력 평가

## 2. 전략적 기회 및 위험 (Strategic Opportunities & Risks)
### 2.1 핵심 기회 요인
### 2.2 주요 위험 요소
### 2.3 리스크 완화 방안

## 3. 재무 및 투자 전망 (Financial & Investment Outlook)
### 3.1 수익성 전망
### 3.2 자금 조달 계획
### 3.3 투자 수익률 예측

## 4. 파트너십 및 협력 방안 (Partnership & Collaboration Strategy)
### 4.1 최적 파트너 유형
### 4.2 협력 구조 제안
### 4.3 성공 요인 및 KPI

## 5. 실행 계획 (Implementation Plan)
### 5.1 단계별 실행 방안
### 5.2 타임라인 및 마일스톤
### 5.3 필요 자원 및 지원

## 6. 최종 권고사항 (Final Recommendations)
- 투자 또는 파트너십 추천 여부
- 조건 및 구조 제안
- 후속 조치 사항

Ensure all recommendations are specific, actionable, and backed by data from the analyses.',
  true,
  NOW()
)
ON CONFLICT (prompt_type) DO UPDATE SET
  prompt_title = EXCLUDED.prompt_title,
  system_prompt = EXCLUDED.system_prompt,
  user_prompt_template = EXCLUDED.user_prompt_template,
  updated_at = now();