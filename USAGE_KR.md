# 사용방법 (KnowWhere Bridge Insights)

아래 단계로 로컬에서 바로 실행하고 테스트할 수 있습니다. 데모 계정이 포함되어 있어 별도 DB 설정 없이 화면/흐름을 확인할 수 있습니다.

## 빠른 시작

사전 요구사항
- Node.js 18+ (권장: 20+) / npm

설치 및 실행
```
npm install
npm run dev
```
- 기본 접속: http://localhost:5173

빌드/프리뷰
```
npm run build
npm run preview   # http://localhost:4173
```

## 데모 로그인 계정 (DB 없이 바로 사용)
- 관리자(Admin)
  - 이메일: admin@example.com
  - 비밀번호: admin123
  - 접속 후 /admin 대시보드 접근 가능
- 일반 사용자(User)
  - 이메일: user@example.com
  - 비밀번호: user123
  - 접속 후 /dashboard 접근

접속 경로 예시
- 로그인: http://localhost:5173/auth
- 관리자 대시보드: http://localhost:5173/admin
- 사용자 대시보드: http://localhost:5173/dashboard

자세한 데모 안내는 `DEMO_LOGIN_GUIDE.md`를 참고하세요.

## 주요 스크립트
- 개발 서버: `npm run dev`
- 린트: `npm run lint`
- 프로덕션 빌드: `npm run build`
- 빌드 프리뷰: `npm run preview`

## 테스트 (선택)
Playwright 기반 E2E 테스트가 포함되어 있습니다.
```
npx playwright install
npx playwright test
```
- 리포트는 `playwright-report` 폴더에 생성됩니다.

## Supabase/외부 연동 (선택)
- 기본 데모 모드는 내장 설정으로 동작합니다. 실환경 연동(엣지 함수, 이메일 발송, OpenAI/Perplexity 등)을 사용하려면 아래 문서를 참고해 환경변수를 설정하세요.
  - `SUPABASE_SETUP_GUIDE.md`
  - `OPENAI_SETUP.md`
  - `PDF_ANALYSIS_SETUP_GUIDE.md`
  - `SYSTEM_TEST_GUIDE.md`

## 문제 해결
- 서버가 뜨지 않거나 빈 화면인 경우: 의존성 재설치 후 재실행
  - `rm -rf node_modules package-lock.json && npm install && npm run dev`
- 포트 충돌 시: `npm run dev -- --port 8080` 등으로 포트 변경 가능
- 빌드 실패: `npm run build` 출력 로그 확인 후 누락된 환경변수나 타입 에러 확인

이 문서에 추가/수정이 필요하면 말씀해주세요. 🙌

