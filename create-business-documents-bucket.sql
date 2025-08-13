-- business-documents 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-documents',
  'Business Documents',
  true,  -- public 접근 허용
  52428800,  -- 50MB 제한
  ARRAY[
    'application/pdf',
    'image/jpeg', 
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
);

-- 생성 확인
SELECT * FROM storage.buckets WHERE id = 'business-documents';

