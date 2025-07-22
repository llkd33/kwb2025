-- Update GPT prompts with more detailed and structured prompts
UPDATE gpt_prompts SET 
  system_prompt = 'You are a senior business analyst and investment consultant with 15+ years of experience in global market analysis. You specialize in comprehensive company evaluations for cross-border investments and strategic partnerships. Your analysis must be data-driven, actionable, and structured according to international investment standards.',
  user_prompt_template = 'Conduct a comprehensive business analysis of the following company for potential international expansion and investment opportunities:

**Company Profile:**
- Company Name: {{company_name}}
- Industry: {{industry}}
- Country: {{headquarters_country}}
- Business Description: {{business_description}}
- Products/Services: {{products_services}}
- Target Market: {{target_market}}
- Competitive Advantage: {{competitive_advantage}}

**Analysis Requirements:**
Please provide a detailed analysis following this exact structure with specific metrics, data points, and actionable insights:

## 1. 회사 개요 (Executive Company Overview)
### 기본 정보
- 기업명 및 설립배경 (성공 가능성 분석 포함)
- 주요 사업 영역 및 핵심 역량
- 본사 위치의 지정학적 장점/단점
- 조직 규모 및 성장 단계 평가

### 비즈니스 모델 성숙도
- 수익 모델의 지속가능성 (5점 척도 평가)
- 시장 적합성 (Product-Market Fit) 수준
- 확장성 (Scalability) 평가

## 2. 사업 모델 심층 분석 (Business Model Deep Dive)
### 핵심 가치 제안
- 고객 문제 해결 수준 (Pain Point Analysis)
- 기존 솔루션 대비 차별화 요소
- 가격 경쟁력 및 수익 마진 분석

### 수익 구조 분석
- 주요 수익원별 기여도 (%)
- 고객 획득 비용 (CAC) vs 고객 생애 가치 (LTV) 비율
- 수익 예측 가능성 및 반복 수익 비중

### 운영 효율성
- 핵심 운영 지표 (KPI) 평가
- 자동화 수준 및 확장 가능성
- 품질 관리 체계

## 3. 시장 환경 및 경쟁 분석 (Market & Competitive Intelligence)
### 시장 기회 분석
- TAM (Total Addressable Market) 규모 추정
- SAM (Serviceable Available Market) 분석
- SOM (Serviceable Obtainable Market) 현실적 목표
- 시장 성장률 및 성장 동력

### 경쟁 환경
- 직접/간접 경쟁사 SWOT 분석
- 시장 점유율 현황 및 예상 변화
- 진입 장벽 높이 (High/Medium/Low)
- 경쟁 우위 지속 가능성

### 시장 트렌드
- 관련 기술/산업 트렌드 영향도
- 고객 행동 변화 패턴
- 규제 환경 변화 전망

## 4. 기술 혁신 및 지적재산권 (Technology & IP Analysis)
### 기술 경쟁력
- 핵심 기술의 차별화 수준 (1-10점 평가)
- 기술 개발 로드맵 및 실현 가능성
- R&D 투자 효율성 분석

### 지적재산권 포트폴리오
- 특허, 상표, 저작권 현황
- IP 보호 전략의 적절성
- 기술 유출 위험도 평가

### 디지털 전환 수준
- 디지털 인프라 성숙도
- 데이터 활용 능력
- AI/자동화 도입 수준

## 5. 재무 현황 및 투자 가치 (Financial Analysis & Valuation)
### 재무 건전성
- 매출 성장률 (YoY, 3년 평균)
- 수익성 지표 (Gross Margin, EBITDA, Net Profit)
- 현금 흐름 안정성
- 부채 비율 및 유동성 분석

### 투자 효율성
- ROI (Return on Investment) 분석
- 자본 효율성 지표
- 투자 회수 기간 예측

### 밸류에이션
- 동종 업계 대비 밸류에이션 수준
- 성장 잠재력 기반 목표 가치
- 투자 위험 대비 기대 수익률

## 6. 위험 요인 및 완화 방안 (Risk Assessment & Mitigation)
### 사업 위험
- 핵심 인력 의존도 위험
- 고객 집중도 위험
- 공급망 위험
- 기술 변화 대응 위험

### 시장 위험
- 경기 변동 민감도
- 환율 변동 영향
- 정치적/규제적 위험
- 경쟁 심화 위험

### 완화 전략
- 각 위험 요인별 구체적 대응 방안
- 위험 모니터링 체계 제안
- 보험/헤징 전략 권고

## 7. 성장 잠재력 및 확장 전략 (Growth Potential & Expansion Strategy)
### 단기 성장 동력 (1-2년)
- 기존 시장에서의 점유율 확대 방안
- 신제품/서비스 출시 계획
- 운영 효율성 개선 기회

### 중장기 성장 전략 (3-5년)
- 신규 시장 진출 우선순위
- 인수합병 (M&A) 기회
- 전략적 파트너십 가능성

### 글로벌 확장
- 해외 진출 적합 시장 순위
- 현지화 요구사항 분석
- 국제적 규제 준수 방안

## 8. SWOT 종합 평가 (Comprehensive SWOT Analysis)
### Strengths (강점) - 정량적 근거 포함
- 측정 가능한 경쟁 우위 요소
- 독특한 자산 및 역량
- 시장에서의 차별화 포인트

### Weaknesses (약점) - 개선 방안 포함
- 현재 한계점 및 취약 영역
- 경쟁사 대비 부족한 부분
- 개선 우선순위 및 방법

### Opportunities (기회) - 실현 확률 포함
- 시장 기회의 크기 및 접근성
- 기술 트렌드 활용 가능성
- 규제 변화로 인한 기회

### Threats (위협) - 대응 시급성 포함
- 즉각적 위험 요소
- 장기적 도전 과제
- 업계 판도 변화 위험

## 9. 투자 및 파트너십 권고사항 (Investment & Partnership Recommendations)
### 투자 적격성 평가
- 투자 등급 (A/B/C/D) 및 근거
- 적정 투자 규모 및 조건
- 투자 구조 제안 (지분/채권/컨버터블)

### 이상적 파트너 프로필
- 전략적 투자자 vs 재무적 투자자 적합성
- 업종별 파트너 우선순위
- 지역별 파트너 추천

### 성공 요인 및 KPI
- 핵심 성공 지표 설정
- 모니터링 주기 및 방법
- Exit 전략 및 시점

**Important Instructions:**
- Provide specific numbers, percentages, and metrics wherever possible
- Include risk ratings (High/Medium/Low) for each risk factor
- Give actionable recommendations with clear timelines
- Compare with industry benchmarks when available
- Conclude with a clear investment recommendation and confidence level (1-10)'
WHERE prompt_type = 'company_analysis';

UPDATE gpt_prompts SET 
  system_prompt = 'You are a senior market research analyst specializing in global market intelligence and competitive analysis. You have access to comprehensive market data and excel at identifying market opportunities, competitive threats, and strategic insights for international expansion. Your analysis should be data-driven, forward-looking, and actionable for strategic decision-making.',
  user_prompt_template = 'Conduct a comprehensive market research analysis based on the following information:

**Research Context:**
- Market Data: {{market_data}}
- Company: {{company_name}}
- Industry: {{industry}}
- Target Countries: {{target_countries}}

**Analysis Framework:**
Provide detailed market intelligence following this structure with specific data, trends, and strategic insights:

## 1. 시장 개관 및 규모 분석 (Market Overview & Sizing)
### 시장 규모 및 성장성
- 현재 시장 규모 (USD 기준, 최신 연도)
- 과거 3년간 성장률 (CAGR) 및 성장 동력 분석
- 향후 5년 성장 예측 및 근거
- 지역별 시장 규모 분포 및 성장률 차이

### 시장 세분화 (Market Segmentation)
- 제품/서비스별 세그먼트 크기 및 성장률
- 고객 유형별 시장 분할 (B2B/B2C/B2G)
- 가격대별 시장 분포
- 채널별 시장 점유율

### 시장 성숙도 및 발전 단계
- 시장 생명주기 단계 (도입/성장/성숙/쇠퇴)
- 기술 채택 곡선상 위치
- 시장 포화도 및 여유 공간

## 2. 경쟁 환경 심층 분석 (Competitive Landscape Deep Dive)
### 주요 플레이어 분석
- 시장 리더 TOP 5 및 각각의 시장 점유율
- 각 경쟁사의 핵심 강점 및 약점
- 가격 정책 및 차별화 전략 비교
- 최근 2년간 M&A 및 전략적 움직임

### 경쟁 강도 분석 (Porter의 5 Forces)
- 기존 경쟁자 간의 경쟁 정도 (High/Medium/Low)
- 신규 진입자의 위협 수준
- 대체재의 위협 정도
- 공급업체의 협상력
- 구매자의 협상력

### 시장 진입 장벽
- 자본 요구사항 및 초기 투자 규모
- 규제 및 인증 요구사항
- 기술적 진입 장벽
- 브랜드 인지도 및 고객 충성도 벽
- 유통 채널 접근의 어려움

## 3. 고객 행동 및 니즈 분석 (Customer Behavior & Needs Analysis)
### 타겟 고객 프로필
- 주요 고객 세그먼트별 인구통계학적 특성
- 고객의 구매 결정 요인 순위 (가격/품질/브랜드/편의성)
- 구매 주기 및 의사결정 프로세스
- 고객 획득 비용 (CAC) 벤치마크

### 구매 패턴 및 트렌드
- 온라인 vs 오프라인 구매 비율 변화
- 모바일 구매 증가율 및 선호도
- 구독 경제 모델 수용도
- 지속가능성 및 ESG 요소 중요도

### 미충족 고객 니즈
- 현재 솔루션의 한계점 및 불만 사항
- 고객이 원하지만 제공되지 않는 서비스
- 새로운 고객 니즈 출현 트렌드
- 고객 경험 개선 기회

## 4. 시장 기회 및 성장 동력 (Market Opportunities & Growth Drivers)
### 신규 시장 기회
- 블루오션 영역 식별 및 크기 추정
- 틈새 시장 (Niche Market) 기회
- 크로스셀링/업셀링 기회
- 신기술 도입으로 인한 새로운 시장 창출

### 성장 촉진 요인
- 정부 정책 및 규제 변화의 긍정적 영향
- 기술 발전이 시장에 미치는 영향
- 사회적 트렌드 변화 (고령화, 도시화 등)
- 경제적 요인 (소득 증가, 투자 증가)

### 디지털 전환 기회
- 디지털화로 인한 새로운 비즈니스 모델
- AI/빅데이터 활용 기회
- 플랫폼 경제 참여 가능성
- 옴니채널 전략 필요성

## 5. 진입 전략 및 Go-to-Market (Market Entry & GTM Strategy)
### 권장 진입 방식
- 직접 진출 vs 파트너십 vs 라이선싱 비교
- 단계적 진입 로드맵 (1년/3년/5년)
- 필요 투자 규모 및 회수 기간
- 현지화 요구사항 및 전략

### 파트너십 및 얼라이언스 기회
- 전략적 파트너 후보 리스트
- 유통 파트너 및 채널 파트너 옵션
- 기술 파트너십 기회
- 조인트벤처 설립 검토 필요성

### 마케팅 및 영업 전략
- 효과적인 마케팅 채널 및 예산 배분
- 브랜드 포지셔닝 전략
- 가격 전략 (프리미엄/미들/저가)
- 영업 조직 구축 방안

## 6. 리스크 및 도전과제 (Market Risks & Challenges)
### 시장 진입 리스크
- 경쟁 반응 및 가격 전쟁 가능성
- 규제 변화 위험
- 경제 침체 영향도
- 환율 변동 리스크

### 운영 도전과제
- 인재 확보 및 현지 조직 구축
- 공급망 구축 및 관리
- 품질 관리 및 고객 서비스
- 문화적 차이 및 현지화 이슈

### 완화 전략
- 각 리스크별 구체적 대응 방안
- 보험 및 헤징 전략
- 파트너십을 통한 리스크 분산
- 단계적 투자로 리스크 최소화

## 7. 규제 환경 및 정책 분석 (Regulatory Environment & Policy Analysis)
### 현재 규제 프레임워크
- 업종별 주요 규제 사항
- 라이선스 및 인증 요구사항
- 세제 혜택 및 부담 사항
- 외국인 투자 제한 사항

### 정책 변화 전망
- 예정된 규제 변화 및 영향
- 정부 지원 정책 활용 가능성
- 무역 정책 변화 영향
- 환경 규제 강화 트렌드

## 8. 기술 트렌드 및 혁신 동향 (Technology Trends & Innovation)
### 핵심 기술 트렌드
- 업계 게임체인저 기술 식별
- 기술 도입 및 확산 속도
- 표준화 진행 상황
- 특허 및 IP 동향

### 스타트업 생태계
- 관련 분야 스타트업 활동 수준
- 벤처캐피털 투자 동향
- 기업 액셀러레이터 프로그램
- 정부 스타트업 지원 정책

## 9. 최종 시장 진출 권고사항 (Final Market Entry Recommendations)
### 시장 매력도 평가
- 시장 점수 (1-10점) 및 평가 근거
- 경쟁 용이성 평가
- 수익성 전망
- 전략적 중요도

### 우선순위 및 타이밍
- 진출 우선순위 국가/지역 랭킹
- 최적 진출 타이밍 및 근거
- 성공 확률 예측 (%)
- 필요 투자 대비 기대 수익률

### 성공 지표 및 모니터링
- 핵심 성과 지표 (KPI) 설정
- 시장 모니터링 체계
- 전략 수정 트리거 포인트
- Exit 전략 고려사항

**Important Instructions:**
- Cite specific data sources and publication dates when available
- Provide quantitative metrics and percentages wherever possible
- Include confidence levels for predictions and forecasts
- Compare multiple target countries if applicable
- Conclude with clear action items and next steps
- Rate each opportunity/risk on a scale (High/Medium/Low impact and probability)'
WHERE prompt_type = 'market_research';