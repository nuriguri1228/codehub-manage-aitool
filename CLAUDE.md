# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CodeHub AI Tool Manager — 사내 AI 코딩 도구(Claude Code, Antigravity 등) 도입 신청/검토/라이선스 관리 플랫폼. Next.js App Router 기반 프론트엔드 (현재 Mock API, 백엔드 미구현).

## Commands

All commands run from `frontend/`:

```bash
cd frontend
npm run dev        # Dev server (port 3000)
npm run build      # Production build + TypeScript type check
npm run lint       # ESLint
```

No test framework is configured yet.

## Architecture

### Directory Layout (`frontend/src/`)

- `app/` — Next.js App Router. `(auth)/` for login, `(dashboard)/` for protected pages
- `components/ui/` — shadcn/ui (Radix + Tailwind). Add via `npx shadcn@latest add <component>`
- `components/{feature}/` — Feature components (application, review, monitoring, layout, common)
- `stores/` — Zustand stores (auth, application wizard, ui, notifications). Persisted via `zustand/middleware`
- `hooks/` — React Query wrappers and utility hooks
- `lib/mock-api.ts` / `lib/mock-data.ts` — Mock API layer with simulated delay. All data fetching goes through here
- `lib/validations/` — Zod schemas for form validation
- `types/` — TypeScript types. Barrel exported from `types/index.ts`

### Key Patterns

**State**: Zustand for client state, React Query (`@tanstack/react-query`) for server state. Query defaults: 60s staleTime, 1 retry.

**Application Wizard**: 7-step form stored in `application-store.ts`. Each step has a Zod schema in `lib/validations/application.ts`. Multi-select AI tools (`aiToolIds: string[]`, `aiToolNames: string[]`).

**Roles & Permissions** (역할별 권한 — 2026-02-12 확정):

| Role | 역할 | 핵심 책임 | 검토 단계 |
|------|------|-----------|-----------|
| `APPLICANT` | 신청자 | 신청서 작성, 본인 현황 조회 | — |
| `TEAM_LEAD` | 1차 검토자/팀장 | 소속 팀원 신청 1차 검토 | `TEAM_REVIEW` |
| `SECURITY_REVIEWER` | 보안 검토자 | 보안 관점 검토 | `SECURITY_REVIEW` |
| `IT_ADMIN` | IT 인프라 관리자 | **물리 개발환경(VDI/Notebook)만 관리**, 환경 준비 검토 | `ENV_PREPARATION` |
| `LICENSE_MANAGER` | 라이센스 관리자 | 라이센스 발급 전담 | `LICENSE_ISSUANCE` |
| `SYSTEM_ADMIN` | 시스템 관리자 | **전체 신청 프로세스 현황 관리**, 모니터링·비용·도구·사용자·시스템 설정 전체 관리 | — (검토 없음) |

Sidebar navigation is role-based in `components/layout/sidebar.tsx`:
- `IT_ADMIN`: 대시보드(환경중심), 검토 목록(ENV_PREP), 검토 이력, 환경 관리
- `LICENSE_MANAGER`: 대시보드, 검토 목록(LICENSE_ISSUANCE), 검토 이력, 라이센스 관리
- `SYSTEM_ADMIN`: 대시보드(Admin), 전체 신청 현황, 검토 이력, 라이센스, 사용현황, 비용, 도구, 사용자, 시스템설정, 감사로그

**Review Flow**: Application → `TEAM_REVIEW`(TEAM_LEAD) → `SECURITY_REVIEW`(SECURITY_REVIEWER) → `ENV_PREPARATION`(IT_ADMIN) → `LICENSE_ISSUANCE`(LICENSE_MANAGER) → `KEY_ISSUED`.

**Styling**: Tailwind CSS v4 with OKLCH CSS variables in `globals.css`. Theme accent color is `#50CF94`. Use `cn()` from `lib/utils.ts` for className merging.

### Data Model Notes

- `Application` uses arrays: `aiToolIds: string[]`, `aiToolNames: string[]` (multiple tools per application)
- `License` and `ApiKey` remain singular: `aiToolId: string`, `aiToolName: string` (one tool per license/key)
- `ReviewListItem` uses `aiToolNames: string[]`

### Import Aliases

`@/*` maps to `./src/*` (e.g., `import { Button } from '@/components/ui/button'`).

## Implementation Status Tracking

**필수 정책**: 모든 코딩 작업(기능 추가, 버그 수정, 리팩토링) 완료 후 반드시 `IMPLEMENTATION_STATUS.md` 파일을 업데이트해야 한다. 기획 문서(`docs/`)가 변경된 경우에도 새로운 요구사항을 반영하여 업데이트한다.

- 새 페이지/기능 구현 시: 해당 항목의 상태를 ✅ 완료로 변경하고 비고 업데이트
- 부분 구현 시: ⚠️ 부분으로 표시하고 미완성 내용 기재
- 새 요구사항 추가 시: 해당 섹션에 행 추가 (❌ 미구현)
- 최종 업데이트 날짜 갱신

## Build Rules

`npm run build` 실행 시 반드시 백그라운드(`run_in_background`)로 실행한다. 빌드 완료 후 결과를 확인하여 사용자에게 보고한다.

## Language

UI text and comments are in Korean. Code identifiers, types, and git messages are in English.
