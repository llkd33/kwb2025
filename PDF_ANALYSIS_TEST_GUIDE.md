# PDF 분석 기능 테스트 가이드

## 🎯 구현 완료 사항

### 1. Admin 페이지 Report Review 섹션
- ✅ **Report Review 탭** - 완료된 AI 분석 리포트 검토 기능
- ✅ **PDF 분석 테스트 버튼** - PDF 업로드 및 분석을 트리거하는 새로운 버튼 추가
- ✅ **리포트 상세 보기** - GPT-4 및 Perplexity AI 분석 결과 표시
- ✅ **관리자 검토 및 승인** - 최종 검토 의견 작성 및 승인 기능

### 2. PDF 분석 프로세스
- ✅ **process-pdf-report** Supabase Function
  - GPT-4를 사용한 종합 비즈니스 분석
  - Perplexity AI를 사용한 실시간 시장 조사
  - 재시도 로직 및 에러 핸들링

## 📋 테스트 순서

### 사전 준비
1. **API 키 설정 확인** (Supabase Dashboard → Edge Functions → Secrets)
   - `OPENAI_API_KEY` - GPT-4 분석용 (필수)
   - `PERPLEXITY_API_KEY` - 시장 조사용 (선택)

2. **Storage 버킷 확인**
   - `pdf-uploads` 버킷이 생성되어 있어야 함
   - Public 접근 권한 설정 필요

### 테스트 단계

#### 1. Admin 페이지 접속
```
http://localhost:5173/admin
```

#### 2. Report Review 탭 선택
- 상단 탭에서 "리포트 리뷰" 클릭
- 우측 상단에 보라색 "📄 PDF 분석 테스트" 버튼 확인

#### 3. PDF 분석 테스트
1. **"📄 PDF 분석 테스트" 버튼 클릭**
2. **PDF 파일 선택**
   - 테스트용 PDF 파일 업로드
   - 파일 크기 및 이름 확인
3. **테스트 기업 선택** (선택사항)
4. **타겟 국가 입력** (기본값: 미국, 일본, 독일)
5. **"분석 시작" 버튼 클릭**

#### 4. 분석 진행 확인
- 로딩 인디케이터 표시
- "PDF 분석 중..." 메시지 확인
- 예상 소요 시간: 1-3분

#### 5. 결과 확인
- 분석 완료 후 자동으로 Report Review 목록 새로고침
- 새로 생성된 분석 리포트 확인
- "리포트 상세 검토" 버튼 클릭

#### 6. 리포트 상세 검토
- **AI 종합 분석 리포트** 섹션
  - 회사 개요
  - 강점 분석
  - 시장 기회 분석
  - 추천사항
- **심층 시장 조사 리포트** 섹션 (Perplexity API 키가 있는 경우)
  - 글로벌 시장 개관
  - 국가별 시장 분석
  - 산업 동향 및 트렌드
- **관리자 검토 의견** 작성
- **"최종 승인 및 배포" 버튼** 클릭

## 🔍 테스트 시나리오

### 시나리오 1: 정상 케이스
- PDF 업로드 → 분석 시작 → 완료 → 리포트 검토 → 승인

### 시나리오 2: API 키 미설정
- OpenAI API 키가 없는 경우 에러 메시지 확인
- "API 키가 설정되지 않았습니다" 메시지 표시

### 시나리오 3: Storage 미설정
- Storage 버킷이 없는 경우 업로드 실패
- "Storage 버킷이 설정되지 않았거나 권한이 없습니다" 메시지

### 시나리오 4: Perplexity 없이 테스트
- Perplexity API 키가 없어도 GPT-4 분석만으로 진행
- 시장 조사 섹션에 "건너뜀" 상태 표시

## 🛠️ 문제 해결

### 1. PDF 업로드 실패
```sql
-- Supabase SQL Editor에서 실행
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdf-uploads', 'pdf-uploads', true);
```

### 2. API 키 설정
```bash
# Supabase CLI 사용
supabase secrets set OPENAI_API_KEY=your-api-key
supabase secrets set PERPLEXITY_API_KEY=your-api-key
```

### 3. Function 배포
```bash
supabase functions deploy process-pdf-report
```

## 📊 예상 결과

### 성공적인 분석 결과 포함 사항:
1. **회사 개요** - 기업의 핵심 정보 요약
2. **강점 분석** - 경쟁 우위 및 차별화 요소
3. **시장 기회** - 타겟 국가별 진출 기회
4. **추천사항** - 구체적인 전략 제안
5. **시장 조사** - 실시간 시장 데이터 (Perplexity)

### 분석 시간:
- GPT-4 분석: 30-60초
- Perplexity 조사: 10-20초
- 총 소요 시간: 1-2분

## 📝 참고사항

1. **테스트 데이터는 실제 DB에 저장됨**
   - matching_requests 테이블에 테스트 레코드 생성
   - 테스트 후 필요시 수동 삭제 필요

2. **API 사용량 주의**
   - 각 분석마다 GPT-4 토큰 약 4000개 소비
   - Perplexity API 호출 1회

3. **에러 핸들링**
   - 모든 에러는 토스트 메시지로 표시
   - 콘솔에 상세 에러 로그 출력

## 🚀 다음 단계

1. **실제 워크플로우 통합**
   - 기업 등록 시 자동 PDF 업로드 연동
   - 이메일 알림 시스템 통합

2. **분석 품질 개선**
   - 프롬프트 템플릿 최적화
   - 산업별 맞춤 분석 로직

3. **성능 최적화**
   - 대용량 PDF 처리
   - 동시 다중 분석 지원