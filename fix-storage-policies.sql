-- business-documents 버킷의 기존 정책들을 모두 삭제
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view their own company files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to their own company folder" ON storage.objects;

-- 모든 인증된 사용자가 business-documents 버킷에 파일 업로드 가능
CREATE POLICY "Allow all authenticated users to upload to business-documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business-documents');

-- 모든 인증된 사용자가 business-documents 버킷의 파일 조회 가능  
CREATE POLICY "Allow all authenticated users to view business-documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'business-documents');

-- 모든 인증된 사용자가 business-documents 버킷의 파일 업데이트 가능
CREATE POLICY "Allow all authenticated users to update business-documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'business-documents')
WITH CHECK (bucket_id = 'business-documents');

-- 모든 인증된 사용자가 business-documents 버킷의 파일 삭제 가능
CREATE POLICY "Allow all authenticated users to delete business-documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'business-documents');

