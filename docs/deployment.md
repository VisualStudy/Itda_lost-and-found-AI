# Genspark Hosted Deployment

## 지원 리소스

`wrangler.jsonc`에는 다음만 선언합니다.

- D1 `DB` × 1
- R2 `R2` × 1
- 정적 assets

## 빌드

```bash
npm install
npm run typecheck
npm test
npm run build
```

## 로컬

```bash
npm run db:migrate:local
pm2 start ecosystem.config.cjs
```

`.dev.vars`는 Git에서 제외하며 로컬 `SESSION_SECRET`을 저장합니다.

## Hosted

Genspark Hosted 승인 배포 후 Worker secret을 설정합니다.

```bash
SESSION_SECRET=$(openssl rand -base64 48)
gsk hosted secret_put --name SESSION_SECRET --value "$SESSION_SECRET"
```

배포 결과의 migration status와 D1 schema를 확인하고 회원가입 → R2 업로드 → Found Report → AI READY 흐름을 smoke test합니다.
