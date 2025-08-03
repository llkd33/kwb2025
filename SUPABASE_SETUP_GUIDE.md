# Supabase Edge Functions 환경 변수 설정 가이드

## ⚠️ 보안 경고
API 키를 절대 코드나 채팅에 직접 입력하지 마세요! 노출되면 즉시 재발급 받으셔야 합니다.

## 필수 환경 변수

### 1. OpenAI API Key (필수)
- **용도**: GPT-4 기반 AI 분석
- **설정 위치**: Supabase Edge Functions Settings

### 2. Perplexity API Key (선택)
- **용도**: 실시간 시장 조사 및 최신 정보 검색
- **설정 위치**: Supabase Edge Functions Settings
- **참고**: 없어도 기본 분석은 작동하며, 실시간 정보만 제외됩니다

## Supabase Dashboard에서 설정하기

### 방법 1: Supabase Dashboard UI 사용

1. Supabase 프로젝트 대시보드 접속
   ```
   https://supabase.com/dashboard/project/gqcruitsupinmhrvygql
   ```

2. 왼쪽 메뉴에서 **Edge Functions** 클릭

3. **Settings** 탭 클릭

4. **Environment Variables** 섹션에서 **Add new secret** 클릭

5. 다음 환경 변수 추가:
   - Name: `OPENAI_API_KEY`
   - Value: `새로 발급받은 OpenAI API 키`
   - ✅ **Add to all functions** 체크

6. (선택) Perplexity 사용 시:
   - Name: `PERPLEXITY_API_KEY`
   - Value: `Perplexity API 키`
   - ✅ **Add to all functions** 체크

7. **Save** 클릭

### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI 설치 (이미 설치되어 있다면 스킵)
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref gqcruitsupinmhrvygql

# 환경 변수 설정
supabase secrets set OPENAI_API_KEY="your_new_openai_api_key"
supabase secrets set PERPLEXITY_API_KEY="your_perplexity_api_key" # 선택사항

# Edge Functions 배포
supabase functions deploy process-pdf-report
supabase functions deploy comprehensive-analysis
supabase functions deploy minimal-analysis
supabase functions deploy test-openai
```

## 설정 확인하기

### 1. Test Function으로 확인
```bash
curl -X POST https://gqcruitsupinmhrvygql.supabase.co/functions/v1/test-openai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxY3J1aXRzdXBpbm1ocnZ5Z3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjE3MTEsImV4cCI6MjA2NjM5NzcxMX0.3ExwSxdRbD_W1Dq6uN90vjVRk6uSDHhCaxOK1rmwnaM"
```

성공 응답 예시:
```json
{
  "success": true,
  "message": "OpenAI API test successful",
  "response": "안녕하세요",
  "model": "gpt-4o-mini"
}
```

### 2. Supabase Dashboard에서 확인
1. Edge Functions → Functions 탭
2. 각 함수 클릭
3. Logs 탭에서 실행 로그 확인

## 데이터베이스 마이그레이션 실행

환경 변수 설정 후 데이터베이스 마이그레이션을 실행해야 합니다:

```bash
# 마이그레이션 파일 실행
supabase db push

# 또는 SQL Editor에서 직접 실행
# 1. Supabase Dashboard → SQL Editor
# 2. /supabase/migrations/20250801-add-report-workflow.sql 내용 복사
# 3. Run 클릭
```

## Storage 버킷 생성

1. Supabase Dashboard → Storage
2. **New bucket** 클릭
3. 다음 버킷 생성:
   - `business-documents` (사업자등록증용)
   - `pdf-documents` (PDF 분석 문서용)
4. 각 버킷 설정:
   - Public: OFF (비공개)
   - File size limit: 50MB
   - Allowed MIME types: application/pdf, image/jpeg, image/png

## 문제 해결

### "OpenAI API key not found" 오류
- Edge Functions Settings에서 환경 변수가 제대로 설정되었는지 확인
- 변수 이름이 정확히 `OPENAI_API_KEY`인지 확인

### "Invalid API key" 오류
- API 키가 유효한지 확인 (sk-proj-로 시작해야 함)
- OpenAI 대시보드에서 키가 활성화되어 있는지 확인

### Perplexity 없이도 작동하나요?
- 네, Perplexity API 키는 선택사항입니다
- 없으면 실시간 시장 조사 부분만 건너뛰고 GPT 분석만 수행됩니다

## 보안 베스트 프랙티스

1. **절대 하지 말아야 할 것**:
   - API 키를 코드에 하드코딩
   - 채팅이나 포럼에 API 키 공유
   - 프론트엔드 코드에 API 키 포함

2. **항상 해야 할 것**:
   - 정기적으로 API 키 교체 (90일마다)
   - 사용량 모니터링
   - 예산 한도 설정

## 지원

문제가 있으시면:
1. Supabase 로그 확인
2. Edge Functions 로그 확인
3. 카카오톡 오픈채팅방 문의: https://open.kakao.com/o/sNxhm3he