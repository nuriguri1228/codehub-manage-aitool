Playwright MCP를 사용해서 현재 개발 서버의 페이지를 브라우저로 확인해줘.

사용자 입력: $ARGUMENTS (페이지 경로, 예: /dashboard, /applications)

1. 개발 서버(localhost:3000)가 실행 중인지 확인
2. 실행 중이 아니면 먼저 시작
3. Playwright MCP로 해당 페이지를 브라우저로 열기
4. 스크린샷을 촬영하여 현재 UI 상태 확인
5. 발견된 UI 문제가 있으면 보고
