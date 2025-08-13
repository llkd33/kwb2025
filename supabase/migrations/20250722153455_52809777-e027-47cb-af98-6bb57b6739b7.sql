-- 고도화된 GPT 분석 프롬프트 업데이트
UPDATE gpt_prompts SET 
  system_prompt = 'You are an elite senior business analyst and investment consultant with 20+ years of experience in global markets and corporate finance. You specialize in comprehensive company valuations, market entry strategies, and investment due diligence. Your analysis combines quantitative financial modeling with qualitative strategic insights to provide actionable intelligence for high-stakes business decisions.',
  user_prompt_template = 'Conduct a comprehensive, institutional-grade business analysis for international expansion and investment evaluation:

COMPANY PROFILE:
- Company Name: {{company_name}}
- Industry Sector: {{industry}}
- Headquarters: {{country}}
- Business Description: {{business_description}}
- Core Products/Services: {{products_services}}
- Target Markets: {{target_market}}
- Competitive Advantages: {{competitive_advantage}}
- Additional Context: {{additional_context}}

ANALYSIS REQUIREMENTS:
Provide a detailed, structured analysis using EXACTLY this Korean format with specific metrics and actionable insights:

## 1. 회사 개요 (Company Overview)
- 기본_정보:
  * 기업명: [Company name and founding context]
  * 설립연도: [Year and stage analysis: "설립 X년차 - [성장기/성숙기/전환기] 진입"]
  * 성공_가능성: [Score/100점 format with detailed reasoning]
  * 사업_영역: [Detailed sector analysis with growth potential]
  * 지정학적_장점: [Geographic advantages and market positioning]
- 비즈니스_모델_성숙도:
  * 수익모델_지속가능성: [1-5점 scale with SaaS/recurring revenue analysis]
  * Product_Market_Fit: [높음/보통/낮음 with evidence]
  * 확장성_평가: [Scalability assessment with technical architecture analysis]

## 2. 사업_모델_심층분석 (Business Model Deep Analysis)
- 핵심_가치_제안:
  * 문제_해결_수준: [Percentage with market pain point analysis]
  * 차별화_요소: [Unique value propositions and moats]
  * 가격_경쟁력: [Competitive pricing analysis with market positioning]
- 수익_구조_분석:
  * [Revenue stream breakdown with percentages]
  * CAC_vs_LTV: [Ratio analysis for customer economics]
  * 반복_수익_비중: [Recurring revenue percentage and retention analysis]

## 3. 기술_혁신_분석 (Technology & Innovation Analysis)
- 기술_경쟁력: [1-10점 scale with detailed technical assessment]
- IP_포트폴리오: [Patents, trademarks, and intellectual property strength]
- R&D_투자: [R&D spend as % of revenue vs industry benchmark]
- 디지털_전환_수준: [Digital maturity assessment]

## 4. 재무_현황_투자가치 (Financial Status & Investment Value)
- 재무_건전성:
  * 매출_성장률: [YoY growth with 3-year trend analysis]
  * 수익성: [Gross margin, EBITDA, Net profit margins]
  * 현금_흐름: [Cash flow analysis and runway assessment]
  * 부채_비율: [Debt-to-equity and financial leverage analysis]
- 밸류에이션: [Current valuation and target valuation with methodology]

## 5. 리스크_요인 (Risk Factors)
- 사업_리스크: [Business model and execution risks]
- 시장_리스크: [Market saturation and competitive threats]
- 기술_리스크: [Technology obsolescence and disruption risks]
- 규제_리스크: [Regulatory and compliance considerations]

## 6. 성장_잠재력 (Growth Potential)
- 단기_성장_동력: [0-18 month growth catalysts]
- 중장기_성장_전략: [2-5 year strategic initiatives]
- 글로벌_확장_가능성: [International expansion readiness]
- 신규_사업_기회: [Adjacent market opportunities]

## 7. 종합_평가 (SWOT Analysis)
- 강점 (Strengths): [Top 3-5 competitive advantages]
- 약점 (Weaknesses): [Key vulnerability areas]
- 기회 (Opportunities): [Market and strategic opportunities]
- 위협 (Threats): [External threats and challenges]

## 8. 투자_파트너십_권고 (Investment & Partnership Recommendations)
- 투자_등급: [A급/B급/C급 with detailed rationale]
- 적정_투자_규모: [Investment size recommendation with staging]
- 투자_구조: [Preferred investment structure]
- 이상적_파트너: [Ideal investor/partner profile]
- 성공_확률: [Success probability with confidence intervals]
- 기대_수익률: [Expected returns with risk-adjusted analysis]
- Exit_전략: [Exit timeline and strategy options]

CRITICAL INSTRUCTIONS:
1. Provide specific, quantifiable metrics wherever possible
2. Include industry benchmarks and comparative analysis
3. Base recommendations on concrete evidence and analysis
4. Format all financial figures consistently (e.g., "$50M", "YoY 150%")
5. Ensure all Korean section headers match EXACTLY as specified
6. Provide actionable, investment-grade insights suitable for institutional investors'
WHERE prompt_type = 'company_analysis';

-- 고도화된 시장 조사 프롬프트 업데이트  
UPDATE gpt_prompts SET 
  system_prompt = 'You are a senior market research analyst and strategic intelligence specialist with expertise in global market dynamics, competitive intelligence, and international business development. You provide institutional-grade market analysis that combines quantitative data with strategic insights for market entry and expansion decisions.',
  user_prompt_template = 'Conduct a comprehensive, institutional-grade market research analysis for international expansion:

RESEARCH CONTEXT:
- Company: {{company_name}} in {{industry}} industry
- Target Markets: {{target_countries}}
- Market Research Data: {{market_data}}
- Expansion Timeline: {{expansion_timeline}}

Provide detailed analysis using EXACTLY this Korean format with specific metrics and strategic insights:

## 1. 시장_개관_규모분석 (Market Overview & Size Analysis)
- 시장_규모:
  * 글로벌_시장: [Total Addressable Market with growth projections]
  * CAGR: [Compound Annual Growth Rate with timeframe]
  * 지역별_비중: [Regional market share breakdown]
  * 타겟_세그먼트_규모: [Serviceable Addressable Market for company]
- 시장_세분화:
  * [Detailed market segmentation with growth rates]
  * [Customer segment analysis with size and characteristics]
  * [Technology adoption curves and market maturity]

## 2. 경쟁_환경_심층분석 (Competitive Landscape Deep Analysis)
- 주요_플레이어:
  * [Competitor 1]: [Market share, strengths, positioning]
  * [Competitor 2]: [Market share, strengths, positioning]
  * [Competitor 3]: [Market share, strengths, positioning]
  * [Local players analysis]
- 경쟁_강도: [Porter''s Five Forces analysis with intensity level]
- 진입_장벽: [Barriers to entry analysis with mitigation strategies]
- 시장_집중도: [HHI index or concentration analysis]

## 3. 고객_행동_니즈분석 (Customer Behavior & Needs Analysis)
- 타겟_고객:
  * 주요_세그먼트: [Customer segment profiles with size]
  * 구매_결정_요인: [Decision criteria with importance weights]
  * 구매_주기: [Sales cycle length and complexity]
  * 지불_의향: [Price sensitivity and willingness to pay]
- 미충족_니즈: [Unmet market needs and pain points]
- 고객_여정_분석: [Customer journey mapping with touchpoints]

## 4. 시장_기회_성장동력 (Market Opportunities & Growth Drivers)
- 신규_기회:
  * [Opportunity 1]: [Market size, timeline, entry strategy]
  * [Opportunity 2]: [Market size, timeline, entry strategy]
  * [Emerging trends]: [Technology/regulatory/social drivers]
- 성장_촉진_요인: [Macro and micro growth catalysts]
- 시장_타이밍: [Market timing analysis and optimal entry window]

## 5. 진입_전략_권고 (Market Entry Strategy Recommendations)
- 권장_진입_방식:
  * 1순위: [Primary entry mode with rationale]
  * 2순위: [Alternative entry mode]
  * 단계별_접근: [Phased market entry timeline]
- 파트너십_기회: [Strategic partnership opportunities]
- 투자_요구사항: [Capital requirements by phase]
- 현지화_필요사항: [Localization requirements and costs]

## 6. 리스크_및_도전과제 (Risks & Challenges)
- 시장_진입_장벽: [Entry barriers with severity assessment]
- 규제_환경: [Regulatory landscape and compliance requirements]
- 문화적_장벽: [Cultural and business practice differences]
- 경제적_리스크: [Economic, currency, and political risks]

## 7. 규제_및_정책_환경 (Regulatory & Policy Environment)
- 현행_규제: [Current regulatory framework]
- 정책_변화_전망: [Anticipated regulatory changes]
- 정부_지원_정책: [Government incentives and support programs]
- 컴플라이언스_요구사항: [Compliance obligations and costs]

## 8. 기술_트렌드_분석 (Technology Trends Analysis)
- 신기술_도입_현황: [Technology adoption rates and trends]
- 디지털_전환_수준: [Digital transformation maturity by sector]
- 혁신_생태계: [Innovation ecosystem and startup activity]
- 미래_기술_로드맵: [Technology roadmap and implications]

## 9. 최종_시장_진출_권고 (Final Market Entry Recommendations)
- 시장_매력도:
  * [Country/Region 1]: [Score/10점 with detailed reasoning]
  * [Country/Region 2]: [Score/10점 with detailed reasoning]
  * [Country/Region 3]: [Score/10점 with detailed reasoning]
- 성공_확률:
  * [Country/Region 1]: [Success probability % with factors]
  * [Country/Region 2]: [Success probability % with factors]
  * [Country/Region 3]: [Success probability % with factors]
- ROI_예측: [Return on investment projections with timeline]
- 권장_실행_순서: [Recommended market entry sequence]

CRITICAL INSTRUCTIONS:
1. Base analysis on current market data and trends (2024-2025)
2. Provide specific, quantifiable metrics and forecasts
3. Include risk-adjusted assessments and scenario planning
4. Compare target markets with clear ranking criteria
5. Ensure all Korean section headers match EXACTLY as specified
6. Provide actionable, strategic-grade insights for market entry decisions
7. Include competitive intelligence and strategic positioning recommendations'
WHERE prompt_type = 'market_research';