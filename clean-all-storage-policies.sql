-- ===== business-documents 관련 모든 정책 완전 삭제 =====

-- 1. business-documents 관련 모든 기존 정책들 삭제
DROP POLICY IF EXISTS "Admins can view all business documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated users to delete business-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated users to update business-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated users to upload to business-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated users to view business-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to own company folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow view of own company files" ON storage.objects;
DROP POLICY IF EXISTS "Companies can delete their own business documents" ON storage.objects;
DROP POLICY IF EXISTS "Companies can update their own business documents" ON storage.objects;
DROP POLICY IF EXISTS "Companies can upload their own business documents" ON storage.objects;
DROP POLICY IF EXISTS "Companies can view their own business documents" ON storage.objects;
DROP POLICY IF EXISTS "TEMP DEBUG Allow any authenticated user to upload" ON storage.objects;
DROP POLICY IF EXISTS "TEMP: Allow any logged-in user to upload" ON storage.objects;
DROP POLICY IF EXISTS "TEMP: Allow any logged-in user to view all files" ON storage.objects;

-- 2. business-documents 버킷을 완전히 public으로 설정
UPDATE storage.buckets 
SET public = true 
WHERE id = 'business-documents';

-- 3. 확인: 남은 business-documents 관련 정책이 있는지 체크
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage' 
  AND (policyname ILIKE '%business-documents%' OR policyname ILIKE '%business%');

-- 4. 버킷 상태 확인
SELECT id, name, public FROM storage.buckets WHERE id = 'business-documents';

