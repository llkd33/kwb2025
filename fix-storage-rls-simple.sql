-- business-documents 버킷에 대한 간단한 업로드 정책 추가

-- 1. 모든 인증된 사용자가 business-documents 버킷에 파일 업로드 가능
CREATE POLICY "Allow authenticated upload to business-documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business-documents');

-- 2. 모든 인증된 사용자가 business-documents 버킷의 파일 조회 가능
CREATE POLICY "Allow authenticated view business-documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'business-documents');

-- 3. 확인: 생성된 정책 확인
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage' 
  AND policyname LIKE '%business-documents%';

