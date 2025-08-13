-- Test Data for Quram MI ID&SSA PDF Report Generation
-- Execute this SQL in Supabase SQL Editor to create test data

-- 1. Insert test company (Quram Technologies)
INSERT INTO public.companies (
  company_name,
  ceo_name,
  manager_name,
  manager_position,
  email,
  phone_number,
  industry,
  headquarters_country,
  headquarters_city,
  founding_year,
  employee_count,
  revenue_scale,
  main_products,
  target_market,
  competitive_advantage,
  company_vision,
  website,
  is_approved,
  approved_at,
  created_at
) VALUES (
  'Quram Technologies (테스트)',
  'CEO Name',
  'Manager Name',
  'Business Development Manager',
  'test@quram.com',
  '010-1234-5678',
  'Technology / AI & Deep Learning',
  '한국',
  '서울',
  2001,
  '50-100',
  '10억-50억',
  'MI SSA (신분증 사본판별), MI ID (신분증 OCR 인식)',
  '금융기관, 핀테크, 정부기관',
  '18년간 삼성 모바일 이미지 처리 SW 개발, 99.53% 정확도의 신분증 사본판별 기술',
  'Smaller, Faster & Smarter for Developers - AI 기반 신분증 인식 및 사본판별 솔루션 글로벌 리더',
  'https://www.quram.com',
  true,
  NOW(),
  NOW()
) RETURNING id;

-- Note the company ID from above query and use it below (replace [COMPANY_ID])

-- 2. Insert matching request
INSERT INTO public.matching_requests (
  company_id,
  target_countries,
  business_goals,
  company_description,
  product_info,
  market_info,
  additional_questions,
  status,
  created_at
) VALUES (
  (SELECT id FROM public.companies WHERE company_name = 'Quram Technologies (테스트)' LIMIT 1),
  ARRAY['미국', '일본', '싱가포르', 'UAE'],
  'Quram MI ID&SSA 솔루션의 해외 진출을 위한 파트너 발굴 및 시장 진입 전략 수립',
  'Quram은 18년간 삼성 모바일 단말기의 이미지 처리 SW를 담당해온 기업으로, AI 기반 신분증 사본판별(MI SSA) 및 OCR 인식(MI ID) 솔루션을 제공합니다. 99.53%의 정확도로 실물/사본을 판별하며, 토스, 부산은행, 삼성페이 등 주요 금융사에서 사용 중입니다.',
  '1. MI SSA (신분증 사본판별): 비대면 금융거래 시 신분증 사본 도용 방지, 99.53% 정확도
2. MI ID (신분증 OCR 인식): 신분증 정보 자동 추출, 95% 이상 인식률
3. 지원: 주민등록증, 운전면허증, 여권, 외국인등록증
4. 제공 방식: Client (Android/iOS), Server (Linux/Unix), Web Assembly',
  '- 토스, 부산은행, 삼성페이 등 국내 30+ 금융기관 도입
- 금융위 비대면 금융 가이드라인 준수
- 보이스피싱 및 금융사기 방지 핵심 기술
- 글로벌 시장 진출 준비 (5월 중 미국/일본 시장 오픈 예정)',
  '1. 각 국가별 신분증 인식 규제 및 표준은?
2. 현지 금융기관 파트너십 구축 방안은?
3. 경쟁사 대비 기술적 차별화 포인트 강조 방법은?',
  'pending',
  NOW()
) RETURNING id;

-- 3. Insert PDF upload record
INSERT INTO public.pdf_uploads (
  matching_request_id,
  file_name,
  file_path,
  file_size,
  mime_type,
  uploaded_at
) VALUES (
  (SELECT id FROM public.matching_requests WHERE company_id = (SELECT id FROM public.companies WHERE company_name = 'Quram Technologies (테스트)' LIMIT 1) LIMIT 1),
  '큐램 MI ID&SSA(OCR, 사본판별) 6.pdf',
  'test-company/quram-mi-solution.pdf',
  2621440,
  'application/pdf',
  NOW()
) RETURNING id;

-- 4. Query to verify the test data
SELECT 
  c.id as company_id,
  c.company_name,
  mr.id as request_id,
  mr.target_countries,
  mr.status,
  pu.file_name
FROM companies c
JOIN matching_requests mr ON mr.company_id = c.id
LEFT JOIN pdf_uploads pu ON pu.matching_request_id = mr.id
WHERE c.company_name = 'Quram Technologies (테스트)';