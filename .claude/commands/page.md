새 Next.js 페이지를 생성해줘.

사용자 입력: $ARGUMENTS

다음 규칙을 따라 페이지를 생성:

1. 페이지 경로 결정:
   - 인증 필요 페이지 → `frontend/src/app/(dashboard)/` 하위
   - 인증 불필요 → `frontend/src/app/(auth)/` 하위
   - App Router 규칙: `page.tsx` 파일 생성

2. 프로젝트 패턴을 따름:
   - `"use client"` 필요 시 추가
   - 한국어 UI 텍스트
   - Tailwind CSS + shadcn/ui 컴포넌트
   - 데이터는 React Query 훅 사용 (`frontend/src/hooks/`)
   - Mock API 연동 (`frontend/src/lib/mock-api.ts`)

3. 페이지 생성 후:
   - 사이드바 네비게이션에 추가 필요 여부 확인 (`components/layout/sidebar.tsx`)
   - 역할 기반 접근 제어 확인
   - IMPLEMENTATION_STATUS.md 업데이트
