-- 테스트용 계정 생성
INSERT INTO public.companies (
  email,
  password,
  company_name,
  ceo_name,
  manager_name,
  manager_position,
  phone_number,
  industry,
  headquarters_country,
  is_approved,
  company_name_en,
  website,
  employee_count
) VALUES (
  'test@company.com',
  'test123456',
  '테스트 컴퍼니',
  '김테스트',
  '이매니저',
  '부장',
  '02-1234-5678',
  'IT',
  '대한민국',
  true,
  'Test Company',
  'https://testcompany.com',
  '10-50명'
);