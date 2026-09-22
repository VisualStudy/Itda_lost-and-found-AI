# Phase 1·2 완료 기록

## Phase 1

- Next.js/TypeScript/Tailwind 프로젝트 생성
- 자연 계열 디자인 시스템과 잇령이 SVG
- SQLite migration/Repository 구조
- 회원가입/로그인/로그아웃/현재 사용자 API
- HttpOnly 세션 및 보호 경로
- 반응형 Web/PWA manifest와 icon
- PM2 sandbox 실행 구성

## Phase 2

- 5단계 Found Report 등록 화면
- 1~5장 이미지 업로드 및 미리보기
- original/public-clean/thumbnail 저장
- EXIF 제거 및 WebP 변환
- 위치·시간·설명·카테고리 저장
- Found Report 생성/조회/수정 API
- 공개 목록/상세/내 신고 UI
- AI job queue 생성과 상태 표시
- seed 및 실제 API 통합 검증

## DB 변경

Migration `0001_found_reports.sql`:

- `schema_migrations`
- `users`
- `found_reports`
- `report_images`
- `ai_jobs`

## 검증 결과

- TypeScript: 통과
- Vitest: 3 tests 통과
- Production dependency audit: 취약점 0
- Next production build: 통과
- Auth → upload → report create → detail API: 통과
- Unauthorized create: HTTP 401 확인
