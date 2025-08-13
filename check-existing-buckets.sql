-- 현재 존재하는 모든 Storage 버킷 확인
SELECT id, name, public, created_at, updated_at 
FROM storage.buckets 
ORDER BY created_at DESC;

-- business-documents 버킷이 존재하는지 구체적으로 확인
SELECT * FROM storage.buckets WHERE id = 'business-documents';

