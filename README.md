# Itda(잇다)

잇치와 함께 잃어버린 물건과 발견된 물건을 다시 연결하는 AI 보조 분실물 서비스입니다. 특정 학교나 기관에 한정하지 않고 어디서든 사용할 수 있도록 설계했습니다.

## 현재 상태

- Phase 1: Hosted 기반, 디자인, D1 인증 완료
- Phase 2: 습득물 등록, R2 이미지 업로드, 목록/상세 완료
- Phase 3: 로컬 특징 추출 baseline 완료
- Phase 4: 자연어 분실 신고·구조화·D1 저장 완료
- Phase 5: 후보 검색·점수 계산·재정렬·설명 화면 완료
- 공식 까치 마스코트 `잇치(Itchi)` 리브랜드 반영
- Genspark Hosted 잇치 리브랜드 운영 배포 완료

## UX 디자인

- 공식 까치 마스코트 `잇치(Itchi)`와 9가지 UX 포즈
- Palette A `Magpie Nature`: 딥 네이비·민트·코랄·옐로·웜 크림
- 모바일 하단 내비게이션과 데스크톱 히어로/3단계 안내
- 로그인·회원가입의 idle/loading/error/success 상태별 잇치 반응
- JavaScript 실패 시에도 동작하는 네이티브 회원가입·로그인·로그아웃 폼
- 비밀번호 표시 전환, 본문 바로가기, 44px 이상 터치 타깃
- 사용자 화면의 기술 중심 문구를 행동 중심 안내 문구로 교체
- 학교·대중교통·상점·공공시설·주거지역 등 범용 장소 분류

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
7. 분실 설명에서 특징을 추출하고 사용자가 보정한 뒤 `lost_reports` 저장
8. 최대 100개 습득물 후보 검색 후 텍스트·사진 대리 신호·속성·장소·시간·OCR 점수 결합
9. 상위 20개 후보 재정렬 및 규칙 기반 비교 이유 생성

가중치는 `src/matching.ts`의 `MATCHING_CONFIG`에서 관리하며, 점수는 확률이 아닌 비슷한 정도로만 표시합니다.

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
→ 자연어 분실 신고 및 사용자 보정
→ Lost Report embedding/attributes 저장
→ 후보 검색·재정렬·비교 이유 생성
→ 목록/상세 표시
```

## 화면 및 진입 URI

- `/` — 잇치 랜딩, 최근 습득물
- `/login`, `/register` — 네이티브 폼 fallback 및 4단계 상호작용 상태
- `/home` — 로그인 사용자 홈
- `/found`, `/found/new`, `/found/:id` — 습득물 목록·5단계 등록·상세
- `/lost/new`, `/lost/:id` — 자연어 분실 신고·구조화 확인·후보 목록
- `/matches`, `/matches/:id` — 내 매칭 모아보기·후보 상세 비교
- `/my/reports`, `/profile` — 내 신고·프로필

## API

- `POST /api/auth/register|login|logout`
- `GET /api/auth/me`
- `POST /api/uploads/images`
- `GET /api/files/*`
- `GET|POST /api/found-reports`
- `GET /api/found-reports/:id`
- `POST /api/found-reports/:id/reprocess`
- `POST /api/lost-reports/interpret`
- `POST /api/lost-reports`
- `GET /api/lost-reports/:id`
- `GET /api/lost-reports/:id/matches`
- `POST /api/lost-reports/:id/rematch`
- `GET /api/matches/:id`

## 데이터

- `users`
- `found_reports`
- `lost_reports`
- `report_images`
- `ai_jobs`
- `ai_features`
- `candidate_matches`

## Production 보안

`SESSION_SECRET`은 Genspark Hosted Worker secret으로 설정합니다. 원본 이미지는 `private/` R2 key에 저장하며 공개 API는 `public/`, `thumb/` key만 제공합니다.

## 아직 구현하지 않은 기능

1. OpenCLIP/e5/PaddleOCR self-hosted adapter
2. 후보 피드백(내 물건 같아요/아니에요/잘 모르겠어요)
3. 습득자 연결 요청과 비공개 소유권 확인
4. 알림 및 운영자 진단 화면

## 권장 다음 단계

1. Phase 6 후보 피드백과 Phase 7 연결 요청 구현
2. 실제 사용성 테스트를 바탕으로 모바일 대화 흐름 개선
3. OpenCLIP/e5 호환 서비스 연결로 텍스트↔이미지 점수 고도화
4. 접근성 및 저사양 기기 성능 회귀 테스트
