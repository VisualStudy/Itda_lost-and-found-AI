# Itda Hosted Architecture

```text
Browser / PWA
  ├─ Hono JSX SSR UI
  ├─ Canvas EXIF-clean image generation
  └─ local pixel feature extraction
        │
        ▼
Genspark Hosted Cloudflare Worker
  ├─ Auth: PBKDF2 + signed HttpOnly cookie
  ├─ Found/Lost Report API
  ├─ Rule-based natural-language attribute extraction
  ├─ deterministic text embedding
  ├─ D1 candidate retrieval + multimodal re-ranking
  ├─ rule-based match explanation
  └─ lazy DB AI job / rematch processing
        ├─ D1: users/reports/jobs/features/matches
        └─ R2: private original/public-clean/thumbnail
```

Hosted가 지원하는 D1 1개와 R2 1개만 사용합니다. KV, cron, queue, Vectorize, 외부 AI binding을 사용하지 않습니다.

## AI Job

Cron 대신 요청이 들어올 때 `PENDING` 작업 하나를 `waitUntil()`에서 처리합니다. Found 특징 처리가 끝나면 최근 OPEN Lost Report를 다시 비교합니다. 외부 AI 장애가 신고 CRUD를 막지 않습니다.

## Phase 4·5 데이터 흐름

```text
자연어 분실 설명
  → dictionary/regex 구조화
  → 사용자 보정
  → lost_reports + ai_features
  → Found 후보 최대 100개 조회
  → 6개 신호 점수 계산
  → Top 20 candidate_matches 저장
  → 후보 목록 / 상세 비교
```

`lost_reports`와 `candidate_matches`는 `migrations/0003_lost_reports_and_matches.sql`에서 생성합니다.

## 확장

`src/providers.ts`의 인터페이스를 유지하고 별도 Linux self-hosted AI service에서 OpenCLIP, multilingual-e5/BGE, PaddleOCR를 실행할 수 있습니다.
