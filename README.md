# Itda(잇다)

잃어버린 것과 발견된 것을 AI로 잇는 분실물 매칭 서비스입니다. 현재 **Phase 1(기반)**과 **Phase 2(습득물 등록 Vertical Slice)**가 구현되어 있습니다.

## 현재 구현 기능

- Next.js 16 App Router + TypeScript strict + Tailwind CSS 4
- 반응형 랜딩, 홈, 로그인, 회원가입, 프로필
- 이메일/비밀번호 인증
  - bcrypt 비밀번호 해시
  - HttpOnly/SameSite 서명 세션 쿠키
  - 보호 경로와 API 소유권 검사
- SQLite migration 및 Repository 계층
- 습득물 등록 전체 흐름
  - 사진 1~5장 업로드/카메라 선택
  - 장소 그룹 및 상세 장소
  - 정확/대략/불명 시간 정밀도
  - 카테고리, 제목, 설명
  - 등록 전 검토
- 이미지 처리
  - 비공개 원본 보관
  - EXIF가 제거된 public-clean WebP
  - 560×420 thumbnail WebP
  - UUID 저장 경로 및 공개 파일 경로 검증
- 습득물 API, 목록, 상세, 내 신고 화면
- AI 장애와 무관한 등록 구조
  - `ai_jobs` DB queue
  - `PENDING/PROCESSING/COMPLETED/FAILED`
  - Report `ai_status`
- 설치 가능한 PWA manifest와 192/512/apple-touch 아이콘
- 잇령이 SVG 마스코트 및 자연 계열 디자인 시스템
- Migration, seed, validation unit test

## 기술 스택

- **UI/API:** Next.js 16, React 19, TypeScript
- **Style:** Tailwind CSS 4 + 프로젝트 디자인 토큰
- **Database:** SQLite + better-sqlite3 (MVP sandbox adapter)
- **Auth:** bcryptjs + jose(JWT session)
- **Image:** Sharp
- **Test:** Vitest
- **Process:** PM2

## 실행 방법

```bash
cd /home/user/webapp
cp .env.example .env.local
# .env.local의 SESSION_SECRET을 32자 이상의 임의 문자열로 변경
npm install
npm run db:reset
npm run build
pm2 start ecosystem.config.cjs
```

개발 URL: `http://localhost:3000`

### 데모 계정

- 이메일: `demo@itda.kr`
- 비밀번호: `itda1234!`

### 검사 명령

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm audit --omit=dev
```

## 주요 화면 경로

| 경로 | 설명 | 인증 |
|---|---|---|
| `/` | 랜딩 | 공개 |
| `/login` | 로그인 | 공개 |
| `/register` | 회원가입 | 공개 |
| `/home` | 사용자 홈 | 필요 |
| `/found` | 습득물 목록 | 공개 |
| `/found/new` | 5단계 습득물 등록 | 필요 |
| `/found/[id]` | 습득물 상세 | 공개 |
| `/my/reports` | 내가 등록한 신고 | 필요 |
| `/profile` | 프로필 | 필요 |
| `/lost/new` | Phase 4 안내 화면 | 필요 |

## API

| Method | URI | 설명 |
|---|---|---|
| `POST` | `/api/auth/register` | 회원가입 및 세션 생성 |
| `POST` | `/api/auth/login` | 로그인 |
| `POST` | `/api/auth/logout` | 로그아웃 |
| `GET` | `/api/auth/me` | 현재 사용자 |
| `POST` | `/api/uploads/images` | 인증 사용자 이미지 업로드 |
| `GET` | `/api/uploads/[...path]` | public-clean/thumbnail만 제공 |
| `GET` | `/api/found-reports` | 공개 습득물 목록 |
| `GET` | `/api/found-reports?mine=true` | 내 습득물 목록 |
| `POST` | `/api/found-reports` | 습득물 생성 및 AI job 등록 |
| `GET` | `/api/found-reports/[id]` | 상세 조회 |
| `PATCH` | `/api/found-reports/[id]` | 소유자 수정 |

## 데이터 구조

현재 migration에는 Vertical Slice에 필요한 다음 테이블이 있습니다.

- `users`
- `found_reports`
- `report_images`
- `ai_jobs`
- `schema_migrations`

이미지는 `original`, `public-clean`, `thumbnail` 3종 storage key로 관리됩니다. 이후 Phase에서 `lost_reports`, `ai_features`, `candidate_matches`, `match_feedback`, `notifications`, `connection_requests`를 별도 migration으로 추가합니다.

## 아직 구현하지 않은 기능

- Phase 3: OpenCLIP/SigLIP 이미지 임베딩, multilingual-e5/BGE 텍스트 임베딩, OCR, 속성 추출 worker
- Phase 4: 자연어 분실 신고와 구조화 결과 수정
- Phase 5: 후보 검색, 점수 계산, 재정렬, 규칙 기반 설명
- Feedback, Connection Request, 알림, 관리자 진단
- Service Worker 오프라인 전략 고도화
- Capacitor Android/iOS 패키징
- 운영 DB/객체 스토리지 adapter

## 다음 개발 순서

1. Python 로컬 AI service와 `ai_jobs` polling worker 구현
2. `ai_features` migration과 모델 버전 관리
3. Found Report 이미지 전처리 → embedding/OCR/attribute 추출 연결
4. Lost Report 자연어 구조화와 임베딩
5. 후보 retrieval/re-ranking 및 설명 UI

## 배포 상태

- **Sandbox Preview:** 동작 확인 완료
- **Production:** 미배포
- **중요:** Next.js + SQLite + 로컬 파일 + 상주 AI worker는 Genspark 기본 Hono/Cloudflare Hosted 원클릭 런타임과 직접 호환되지 않습니다. 현재 코드는 Linux sandbox에서 실행되는 Full-Stack MVP입니다. 운영 배포 전 DB를 D1 또는 PostgreSQL로, 이미지를 R2 등 객체 스토리지로 교체하고 AI worker를 별도 self-hosted compute에 배치해야 합니다.

자세한 내용은 [`docs/architecture.md`](docs/architecture.md), [`docs/ai-matching.md`](docs/ai-matching.md), [`docs/deployment.md`](docs/deployment.md)를 참고하세요.
