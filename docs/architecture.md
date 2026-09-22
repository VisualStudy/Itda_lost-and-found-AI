# Itda Architecture

## 현재 Phase 1·2 구조

```text
Browser / PWA
  └─ Next.js App Router
      ├─ Server Components (목록/상세/홈)
      ├─ Route Handlers (Auth/Upload/Found Report)
      ├─ Session Auth (HttpOnly JWT cookie)
      ├─ Repository Layer
      │   └─ SQLite adapter
      └─ Image Storage Layer
          └─ Local adapter + Sharp(EXIF 제거/리사이즈)

SQLite
  ├─ users
  ├─ found_reports
  ├─ report_images
  └─ ai_jobs
```

## 설계 결정

### Vertical Slice

Phase 2는 습득물 하나의 흐름을 UI → API → DB → Image Storage까지 완성했습니다. 구현되지 않은 분실물/매칭 테이블을 미리 한 번에 만들지 않고 후속 Phase migration으로 추가합니다.

### 인증

- 이메일은 정규화 후 unique 저장
- bcrypt cost 12
- 7일 만료 HS256 세션
- HttpOnly, SameSite=Lax, production Secure cookie
- `SESSION_SECRET`은 production에서 필수
- UI 보호 경로와 별도로 모든 변경 API가 세션/소유권을 다시 검사

### 이미지 개인정보

1. 원본은 공개되지 않는 storage key에 저장
2. Sharp `rotate()`를 거쳐 방향을 정규화
3. metadata를 복사하지 않고 WebP로 재인코딩하여 EXIF/GPS 제거
4. 공개 API는 `public-clean.webp`, `thumbnail.webp`만 허용
5. path traversal을 정규화와 root-prefix 검사로 차단

### AI 실패 격리

Found Report transaction은 신고와 이미지 연결, `ai_jobs` 생성을 함께 처리합니다. AI는 후처리이며 신고 생성 성공 여부를 막지 않습니다. Phase 3 worker가 job을 처리하고 `found_reports.ai_status`를 갱신합니다.

## 운영 목표 구조

```text
Next.js Web/PWA or Hono edge frontend
  ├─ Auth/API
  ├─ PostgreSQL + pgvector 또는 D1 repository
  └─ R2/object storage adapter

Self-hosted AI Worker
  ├─ OpenCLIP/SigLIP
  ├─ multilingual-e5/BGE
  ├─ PaddleOCR/Tesseract
  └─ DB job polling
```

외부 유료 AI API는 핵심 경로에 필요하지 않습니다.

## 모바일

현재 반응형 UI, 44px 이상 터치 타깃, camera capture input, PWA manifest/icon을 제공합니다. Phase 9에서 service worker/offline 정책을 완성하고 Phase 10에서 Capacitor wrapper를 추가합니다.
