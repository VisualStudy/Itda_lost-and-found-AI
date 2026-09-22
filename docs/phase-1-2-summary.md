# Phase 1·2 Hosted 전환 기록

기존 Next.js/SQLite/로컬 파일 버전은 GitHub 커밋 `e5c3e46`에 보존했습니다.

Hosted 전환:

- Next.js → Hono JSX SSR
- better-sqlite3 → D1
- local image storage/Sharp → browser Canvas + R2
- bcrypt/JWT → Web Crypto PBKDF2 + HMAC cookie
- PM2 Next server → Wrangler Pages local preview
- DB polling process → request-driven `waitUntil` job processing

Phase 1·2 기능은 유지하면서 Genspark Hosted 지원 범위로 전환했습니다.
