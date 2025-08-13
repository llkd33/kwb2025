-- matching_requests 테이블의 기존 정책들 확인 및 수정

-- 모든 인증된 사용자가 매칭 요청을 생성할 수 있도록 허용
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.matching_requests;
CREATE POLICY "Allow authenticated users to insert matching requests"
ON public.matching_requests FOR INSERT
TO authenticated
WITH CHECK (true);

-- 모든 인증된 사용자가 매칭 요청을 조회할 수 있도록 허용 (관리자 페이지용)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.matching_requests;
CREATE POLICY "Allow authenticated users to view matching requests"
ON public.matching_requests FOR SELECT
TO authenticated
USING (true);

-- 모든 인증된 사용자가 매칭 요청을 업데이트할 수 있도록 허용 (관리자 기능용)
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.matching_requests;
CREATE POLICY "Allow authenticated users to update matching requests"
ON public.matching_requests FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

