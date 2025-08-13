-- 1. business-documents 버킷이 존재하는지 확인
SELECT * FROM storage.buckets WHERE id = 'business-documents';

-- 2. 현재 storage.objects에 설정된 정책들 확인
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- 3. 버킷이 없다면 생성 (public 접근 허용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-documents', 'business-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 4. 버킷을 public으로 설정 (이미 존재하는 경우)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'business-documents';

