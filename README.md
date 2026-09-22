# Itda(잇다)

외부 유료 AI API 없이 분실물 설명과 습득물 사진을 비교하는 AI 분실물 매칭 서비스입니다.

## 현재 상태

- Phase 1: Hosted 기반, 디자인, D1 인증 완료
- Phase 2: 습득물 등록, R2 이미지 업로드, 목록/상세 완료
- Phase 3: 로컬 AI Feature Extraction baseline 시작
- Genspark Hosted 운영 배포 완료

## UX 디자인

- 순천대학교 해커톤 레퍼런스를 바탕으로 한 까치 마스코트 `잇까치`
- 전달, 탐색, 발견 축하, 사진 확인의 4가지 상태별 SVG 포즈
- 네이비·민트·코랄·골드 브랜드 팔레트
- 분실물 등록 과정을 한눈에 보여주는 여정 UI
- JavaScript 실패 시에도 동작하는 네이티브 회원가입·로그인·로그아웃 폼
- 비밀번호 표시 전환, 본문 바로가기, 44px 이상 터치 타깃
- 사용자 화면의 기술 중심 문구를 행동 중심 안내 문구로 교체

## Hosted 기술 스택

- Hono + TypeScript + JSX SSR
- Cloudflare Workers for Platform
- D1 SQLite 1개
- R2 bucket 1개
- Web Crypto PBKDF2/HMAC 인증
- PWA + 브라우저 Canvas 이미지 전처리

## 현재 AI 처리

외부 API 호출 없이 다음을 처리합니다.

1. 브라우저에서 공개 이미지 재인코딩(EXIF/GPS 제거)
2. 64차원 grayscale pixel embedding 추출
3. dominant color/palette 추출
4. Worker에서 한국어 사전 기반 category/color/material/feature 추출
5. 64차원 deterministic text hash embedding 생성
6. D1 `ai_features` 저장 및 `ai_status=READY`

향후 `ImageEmbeddingProvider`, `TextEmbeddingProvider`, `OcrProvider` 인터페이스에 OpenCLIP, multilingual-e5/BGE, PaddleOCR self-hosted adapter를 연결합니다.

## 운영 URL

- https://366a9426-30c1-4ae8-93d6-e20cbe78c0a5.vip.gensparksite.com
- 데모 계정: `demo@itda.kr` / `itda1234!`

## 실행

```bash
cd /home/user/webapp
npm install
npm run build
npm run db:migrate:local
pm2 start ecosystem.config.cjs
```

URL: `http://localhost:3000`

## 테스트

```bash
npm run typecheck
npm test
npm audit
npm run build
```

검증된 실제 흐름:

```text
회원가입 → D1 저장 → 로그인 세션
→ R2 original/public-clean/thumbnail 업로드
→ Found Report 생성
→ DB AI Job 처리
→ ai_features 저장
→ 목록/상세 표시
```

## 화면

- `/` 랜딩
- `/login`, `/register`
- `/home`
- `/found`, `/found/new`, `/found/:id`
- `/my/reports`, `/profile`
- `/lost/new` 후속 Phase 안내

## API

- `POST /api/auth/register|login|logout`
- `GET /api/auth/me`
- `POST /api/uploads/images`
- `GET /api/files/*`
- `GET|POST /api/found-reports`
- `GET /api/found-reports/:id`
- `POST /api/found-reports/:id/reprocess`

## 데이터

- `users`
- `found_reports`
- `report_images`
- `ai_jobs`
- `ai_features`

## Production 보안

`SESSION_SECRET`은 Genspark Hosted Worker secret으로 설정합니다. 원본 이미지는 `private/` R2 key에 저장하며 공개 API는 `public/`, `thumb/` key만 제공합니다.

## 다음 구현

1. Lost Report 자연어 입력/구조화
2. Found ↔ Lost 후보 retrieval
3. multimodal scoring/re-ranking
4. rule-based match explanation
5. OpenCLIP/e5/PaddleOCR self-hosted adapter
6. Feedback 및 Connection Request
