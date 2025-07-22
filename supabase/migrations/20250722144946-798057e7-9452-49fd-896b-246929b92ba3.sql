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