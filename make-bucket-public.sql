-- business-documents 버킷을 완전히 public으로 만들기
-- 이렇게 하면 정책 없이도 모든 사용자가 접근 가능합니다

-- 1. 기존 정책들 모두 제거
DROP POLICY IF EXISTS "Allow all authenticated users to upload to business-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated users to view business-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated users to update business-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated users to delete business-documents" ON storage.objects;

-- 기타 가능한 정책들도 제거
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view their own company files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to their own company folder" ON storage.objects;

-- 2. 버킷을 public으로 설정
UPDATE storage.buckets 
SET public = true 
WHERE id = 'business-documents';

-- 3. 확인
SELECT id, name, public FROM storage.buckets WHERE id = 'business-documents';

