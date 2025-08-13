# 📝 KnowWhere Bridge - PDF 리포트 테스트 가이드

## 🎯 테스트 목적
Quram MI ID&SSA PDF 문서를 사용하여 AI 분석 리포트 생성 기능을 테스트합니다.

## 📋 테스트 단계

### 1단계: 테스트 회사 생성 (Admin 페이지)

1. 브라우저에서 http://localhost:8080/admin 접속
2. "대기 중" 탭에서 새 회사 수동 추가 또는 아래 정보 사용:

**회사 정보:**
- 회사명: Quram Technologies (테스트)
- 산업: Technology / AI & Deep Learning
- 본사: 한국, 서울
- 설립년도: 2001
- 주요 제품: MI SSA (신분증 사본판별), MI ID (신분증 OCR 인식)
- 이메일: test@quram.com

### 2단계: 매칭 요청 생성

1. Admin 페이지에서 회사 승인 후
2. "매칭 요청" 탭으로 이동
3. 새 매칭 요청 생성:

**매칭 요청 정보:**
- 진출 희망 국가: 미국, 일본, 싱가포르, UAE
- 비즈니스 목표: Quram MI ID&SSA 솔루션의 해외 진출
- 회사 설명: 18년간 삼성 모바일 이미지 처리 SW 개발, AI 기반 신분증 인식 솔루션
- 제품 정보:
  - MI SSA: 99.53% 정확도 사본판별
  - MI ID: 95% 이상 OCR 인식률
- 시장 정보: 토스, 부산은행, 삼성페이 등 30+ 금융기관 도입

### 3단계: PDF 업로드 및 리포트 생성

#### 옵션 A: UI를 통한 업로드
1. 매칭 요청 페이지에서 PDF 업로드 버튼 클릭
2. `/Users/startuperdaniel/Downloads/큐램 MI ID&SSA(OCR, 사본판별) 6.pdf` 선택
3. 업로드 완료 후 "AI 분석 시작" 클릭

#### 옵션 B: Supabase SQL Editor 사용
1. Supabase Dashboard 접속
2. SQL Editor로 이동
3. `/scripts/insert-test-data.sql` 내용 실행

### 4단계: 리포트 확인

1. Admin 페이지 → "리포트 리뷰" 탭
2. Quram Technologies 리포트 찾기
3. 리포트 내용 확인:
   - AI 분석 결과
   - 시장 조사 데이터
   - 진출 전략 제안

## 🔍 확인 사항

### 성공적인 테스트 지표:
- ✅ PDF 업로드 성공
- ✅ AI 분석 완료 (status: 'completed')
- ✅ 리포트에 다음 내용 포함:
  - 신분증 사본판별 기술 분석
  - 타겟 국가별 시장 기회
  - 금융 규제 및 컴플라이언스 정보
  - 경쟁사 분석
  - 진출 전략 제안

### 예상 리포트 내용:
1. **기술 분석**
   - 99.53% 정확도의 사본판별 기술
   - 딥러닝 기반 이미지 처리
   - 실시간 처리 능력

2. **시장 기회**
   - 미국: 핀테크 시장 성장
   - 일본: 디지털 금융 전환
   - 싱가포르: 동남아 금융 허브
   - UAE: 중동 디지털 전환

3. **경쟁 우위**
   - 삼성과의 18년 협력 경험
   - 한국 주요 금융사 레퍼런스
   - Web Assembly 지원

## ⚠️ 트러블슈팅

### PDF 업로드 실패 시:
- 파일 크기 확인 (10MB 이하)
- 파일 형식 확인 (PDF)
- 네트워크 연결 확인

### AI 분석 실패 시:
1. Supabase Edge Functions 로그 확인
2. OpenAI API 키 설정 확인
3. 함수 재배포: `npx supabase functions deploy`

### 리포트가 표시되지 않을 때:
1. 브라우저 새로고침
2. 콘솔 에러 확인
3. Supabase 데이터베이스 직접 확인

## 📊 테스트 데이터 정리

테스트 완료 후 데이터 정리:
```sql
-- 테스트 데이터 삭제
DELETE FROM pdf_uploads WHERE matching_request_id IN (
  SELECT id FROM matching_requests WHERE company_id IN (
    SELECT id FROM companies WHERE company_name LIKE '%테스트%'
  )
);
DELETE FROM matching_requests WHERE company_id IN (
  SELECT id FROM companies WHERE company_name LIKE '%테스트%'
);
DELETE FROM companies WHERE company_name LIKE '%테스트%';
```

## 🚀 추가 테스트 시나리오

1. **다중 PDF 업로드**: 여러 문서 동시 업로드
2. **대용량 PDF**: 10MB 근처 파일 테스트
3. **다국어 문서**: 영문/일문 문서 테스트
4. **동시 요청**: 여러 매칭 요청 동시 처리

---

테스트 완료 후 결과를 기록하고 개선사항을 문서화하세요.