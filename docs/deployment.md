# Deployment Guide

## 현재 Sandbox 실행

```bash
cd /home/user/webapp
cp .env.example .env.local
npm install
npm run db:reset
npm run build
pm2 start ecosystem.config.cjs
curl http://localhost:3000/api/found-reports
```

PM2 로그:

```bash
pm2 logs itda --nostream
```

## 필수 환경 변수

- `SESSION_SECRET`: production 필수, 32자 이상 임의 문자열
- `DATABASE_PATH`: 로컬 SQLite 경로
- `UPLOAD_DIR`: 로컬 이미지 경로
- `NEXT_PUBLIC_APP_URL`: 공개 origin

비밀값은 Git에 커밋하지 않습니다.

## Genspark Hosting 제약

현재 구현은 명세의 Next.js 우선 요구를 따르는 Node 기반 앱입니다. Genspark의 기본 인앱 Preview/Hosted Deploy는 Hono + Cloudflare Workers 경로에 최적화되어 있어 다음 요소는 그대로 production 배포할 수 없습니다.

- `better-sqlite3` 네이티브 모듈
- 런타임 로컬 파일 저장
- Sharp 네이티브 이미지 처리
- 상주 Python AI polling worker
- 표준 Next.js Node server

Next.js Cloudflare 변환을 사용할 경우 반드시 Linux sandbox/CI에서 빌드해야 하며 Windows에서 OpenNext artifact를 만들면 런타임 오류 위험이 있습니다.

## 운영 전환 체크리스트

1. `FoundReportRepository` SQLite 구현을 D1 또는 PostgreSQL adapter로 교체
2. Local image storage를 R2/object storage adapter로 교체
3. 이미지 EXIF 제거는 업로드 전 브라우저 처리 또는 별도 self-hosted media service로 이동
4. AI worker는 CPU/GPU 가능한 별도 self-hosted 환경에 배치
5. DB queue를 공유 DB에서 polling
6. production `SESSION_SECRET` 설정
7. migration 적용 후 smoke test
8. 배포 경로에 맞춘 실제 PWA origin 확인

## 권장 배포 분리

- **Genspark Hosted Web/API:** Hono Worker + D1 + R2로 이식
- **AI Worker:** 별도 self-hosted Linux compute
- **대안:** Next.js 전체를 Node 컨테이너 플랫폼에 배포하고 PostgreSQL/R2 사용

실제 Hosted Deploy를 수행하기 전, Genspark 관리형 경로와 사용자 Cloudflare 계정(BYOK) 중 하나를 확정해야 합니다. 본 프로젝트 요구사항은 Genspark 관리형을 우선합니다.
