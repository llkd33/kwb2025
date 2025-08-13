-- business-documents 버킷을 완전히 삭제하고 깨끗하게 다시 생성

-- 1. 기존 버킷의 모든 파일 삭제 (선택사항)
DELETE FROM storage.objects WHERE bucket_id = 'business-documents';

-- 2. 버킷 삭제
DELETE FROM storage.buckets WHERE id = 'business-documents';

-- 3. 새로운 버킷 생성 (public = true)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-documents', 
  'business-documents', 
  true,  -- public 접근 허용
  10485760,  -- 10MB 제한
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- 4. 확인
SELECT * FROM storage.buckets WHERE id = 'business-documents';

