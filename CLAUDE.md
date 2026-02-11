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

**Roles**: APPLICANT, TEAM_LEAD, SECURITY_REVIEWER, IT_ADMIN, SYSTEM_ADMIN. Sidebar navigation is role-based in `components/layout/sidebar.tsx`.

**Review Flow**: Application → TEAM_REVIEW → SECURITY_REVIEW → ENV_PREPARATION → FINAL_APPROVAL → KEY_ISSUED.

**Styling**: Tailwind CSS v4 with OKLCH CSS variables in `globals.css`. Theme accent color is `#50CF94`. Use `cn()` from `lib/utils.ts` for className merging.

### Data Model Notes

- `Application` uses arrays: `aiToolIds: string[]`, `aiToolNames: string[]` (multiple tools per application)
- `License` and `ApiKey` remain singular: `aiToolId: string`, `aiToolName: string` (one tool per license/key)
- `ReviewListItem` uses `aiToolNames: string[]`

### Import Aliases

`@/*` maps to `./src/*` (e.g., `import { Button } from '@/components/ui/button'`).

## Language

UI text and comments are in Korean. Code identifiers, types, and git messages are in English.
