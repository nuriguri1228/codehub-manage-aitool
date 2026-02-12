새 React 컴포넌트를 생성해줘.

사용자 입력: $ARGUMENTS

다음 규칙을 따라 컴포넌트를 생성:

1. 컴포넌트 이름과 위치를 결정:
   - UI 공통 컴포넌트 → `frontend/src/components/ui/`
   - 기능 컴포넌트 → `frontend/src/components/{feature}/` (application, review, monitoring, layout, common 등)
   - 사용자가 경로를 지정하면 해당 경로에 생성

2. 프로젝트 패턴을 따름:
   - TypeScript (.tsx)
   - `"use client"` 디렉티브 필요 시 추가
   - Props 인터페이스 정의
   - `cn()` 유틸로 className 합성 (`import { cn } from '@/lib/utils'`)
   - Tailwind CSS로 스타일링
   - shadcn/ui 컴포넌트 활용
   - 한국어 UI 텍스트, 영어 코드 식별자

3. 생성 후 관련 파일에서 import 필요 여부 확인
