# Implementation Status Checklist

> 문서 기반 기능 요구사항 대비 현재 프론트엔드 구현 현황
> 최종 업데이트: 2026-02-12

---

## 1. 페이지/라우트 구현 현황

### 인증
| 페이지 | 경로 | 상태 | 비고 |
|--------|------|------|------|
| 로그인 | `(auth)/login/page.tsx` | ✅ 완료 | Mock 역할 선택 방식 |

### 신청자 (APPLICANT)
| 페이지 | 경로 | 상태 | 비고 |
|--------|------|------|------|
| 대시보드 | `(dashboard)/dashboard/page.tsx` | ✅ 완료 | 역할별 분기 |
| 신규 신청 (7단계 위자드) | `(dashboard)/applications/new/page.tsx` | ✅ 완료 | |
| 내 신청 목록 | `(dashboard)/applications/page.tsx` | ✅ 완료 | 필터/정렬/페이지네이션 |
| 신청 상세 | `(dashboard)/applications/[id]/page.tsx` | ✅ 완료 | 타임라인 + 취소/복사 버튼 |
| 신청 편집/재제출 | `(dashboard)/applications/[id]/edit/page.tsx` | ✅ 완료 | 피드백 상세 표시 + 재제출 |
| API Key 관리 | `(dashboard)/api-keys/page.tsx` | ✅ 완료 | 재발급/비활성화/복사 |
| 사용자 프로필 | `(dashboard)/profile/page.tsx` | ✅ 완료 | 프로필 조회/수정, 활동 요약, 최근 신청 이력 |
| 사용자 설정 | `(dashboard)/settings/page.tsx` | ✅ 완료 | 알림 채널/유형별 수신 설정 |

### 검토자 (TEAM_LEAD / SECURITY_REVIEWER)
| 페이지 | 경로 | 상태 | 비고 |
|--------|------|------|------|
| 검토 대시보드 | `(dashboard)/dashboard/page.tsx` | ✅ 완료 | ReviewerDashboard 컴포넌트 |
| 검토 목록 | `(dashboard)/reviews/page.tsx` | ✅ 완료 | 필터/SLA/페이지네이션 |
| 검토 상세 | `(dashboard)/reviews/[id]/page.tsx` | ✅ 완료 | 2패널 레이아웃 |
| 검토 이력 | `(dashboard)/reviews/history/page.tsx` | ✅ 완료 | 완료된 검토 목록, 통계 카드, 필터/검색 |

### 관리자 (IT_ADMIN / SYSTEM_ADMIN)
| 페이지 | 경로 | 상태 | 비고 |
|--------|------|------|------|
| 관리자 대시보드 | `(dashboard)/dashboard/page.tsx` | ✅ 완료 | AdminDashboard 컴포넌트 |
| 라이센스 관리 | `(dashboard)/monitoring/licenses/page.tsx` | ✅ 완료 | 차트+테이블+CSV 내보내기 |
| 사용 현황 모니터링 | `(dashboard)/monitoring/usage/page.tsx` | ✅ 완료 | KPI+차트+이상탐지 |
| 비용 관리 | `(dashboard)/monitoring/costs/page.tsx` | ✅ 완료 | KPI+차트 |
| AI 도구 관리 | `(dashboard)/admin/tools/page.tsx` | ✅ 완료 | CRUD |
| 사용자 관리 | `(dashboard)/admin/users/page.tsx` | ✅ 완료 | 역할 변경 |
| 시스템 설정 | `(dashboard)/admin/settings/page.tsx` | ✅ 완료 | SLA/알림/예산 |
| 알림 센터 | `(dashboard)/notifications/page.tsx` | ✅ 완료 | 전체 알림 목록, 읽음/안읽음 필터, 전체 읽음 |
| 감사 로그 | `(dashboard)/admin/audit/page.tsx` | ✅ 완료 | 감사 로그 테이블, 행위 유형 필터, 검색 |

---

## 2. 기능별 구현 현황

### 신청 관련 기능
| 기능 | 요구사항 ID | 상태 | 비고 |
|------|------------|------|------|
| AI 도구 다중 선택 | FR-015 | ✅ 완료 | `aiToolIds[]` |
| 사용 환경 선택 | FR-018 | ✅ 완료 | VDI/NOTEBOOK/OTHER |
| 사용 목적 입력 | - | ✅ 완료 | wizard-step3-purpose.tsx |
| 다중 프로젝트 등록 | FR-026 | ✅ 완료 | 동적 추가/삭제 |
| 프로젝트별 첨부파일 | FR-029 | ✅ 완료 | step4에서 프로젝트 카드 내 |
| 추가 문서 첨부 | FR-029 | ✅ 완료 | step5 |
| 보안 서약 서명 | FR-035 | ✅ 완료 | Canvas 전자서명 |
| 최종 확인 및 제출 | FR-041 | ✅ 완료 | |
| 임시저장 | FR-039 | ✅ 완료 | Zustand persist |
| 신청서 취소 | FR-043 | ✅ 완료 | SUBMITTED 상태에서 취소 가능, AlertDialog+사유 입력 |
| 신청서 복사(재신청) | FR-044 | ✅ 완료 | APPROVED/KEY_ISSUED/REJECTED에서 복사하여 재신청 |
| 피드백 기반 수정/재제출 | FR-053 | ✅ 완료 | 검토자 피드백 상세 표시 + 재제출 |

### 검토 관련 기능
| 기능 | 요구사항 ID | 상태 | 비고 |
|------|------------|------|------|
| 검토 승인 | FR-050 | ✅ 완료 | |
| 검토 반려 | FR-051 | ✅ 완료 | 반려 사유 필수 |
| 보완 요청 (피드백) | FR-052 | ✅ 완료 | |
| 체크리스트 기반 검토 | - | ✅ 완료 | ReviewChecklistItem[] |
| SLA 표시 | FR-056 | ✅ 완료 | NORMAL/WARNING/OVERDUE |
| 검토 이력 조회 | FR-059 | ✅ 완료 | 검토 이력 페이지 구현 완료 |
| 일괄 검토 처리 | FR-055 | ❌ 미구현 | |

### API Key / 라이센스 관리
| 기능 | 요구사항 ID | 상태 | 비고 |
|------|------------|------|------|
| API Key 조회 (마스킹) | FR-063 | ✅ 완료 | |
| API Key 재발급 | FR-066 | ✅ 완료 | |
| API Key 비활성화 | FR-065 | ✅ 완료 | |
| API Key 복사 | FR-064 | ✅ 완료 | 클립보드 복사 + toast + 아이콘 전환 |
| 라이센스 일괄 관리 | - | ❌ 미구현 | 체크박스 선택+일괄 갱신/해지 없음 |

### 모니터링 / 대시보드
| 기능 | 요구사항 ID | 상태 | 비고 |
|------|------------|------|------|
| 라이센스 발급 현황 차트 | FR-077 | ✅ 완료 | 도넛/바 차트 |
| 사용 현황 모니터링 | FR-079 | ✅ 완료 | 일별 차트+TopUsers |
| 비용 관리 대시보드 | FR-083 | ✅ 완료 | 월별 추이+도구별+부서별 |
| 이상 탐지 알림 | FR-087 | ✅ 완료 | 이상 감지+해제 |
| 데이터 내보내기 (CSV/PDF) | FR-078,085 | ✅ 완료 | export-utils.ts, 라이센스 페이지 연결 |
| 통계 리포트 생성 | FR-089 | ❌ 미구현 | 별도 리포트 페이지 없음 |

### 알림 시스템
| 기능 | 요구사항 ID | 상태 | 비고 |
|------|------------|------|------|
| 시스템 내 알림 (인앱) | FR-094 | ✅ 완료 | 헤더 드롭다운 + 알림 센터 페이지 |
| 알림 읽음/안읽음 관리 | FR-094 | ✅ 완료 | 개별/전체 읽음 처리 |
| 알림 설정 (채널별) | FR-095 | ✅ 완료 | 사용자 설정 페이지에서 채널/유형별 설정 |
| 알림 센터 (전체 목록) | FR-094 | ✅ 완료 | /notifications 페이지 |

### 사용자 관리
| 기능 | 요구사항 ID | 상태 | 비고 |
|------|------------|------|------|
| 사용자 목록 관리 | FR-005 | ✅ 완료 | admin/users |
| 역할 변경 | FR-005 | ✅ 완료 | 인라인 드롭다운 |
| 프로필 조회 | FR-010 | ✅ 완료 | /profile 페이지 |
| 프로필 수정 | FR-011 | ✅ 완료 | 이메일/연락처 수정 |
| 마이페이지 (활동 내역) | FR-013 | ✅ 완료 | 활동 요약 카드 + 최근 신청 이력 |

### 시스템 관리
| 기능 | 요구사항 ID | 상태 | 비고 |
|------|------------|------|------|
| AI 도구 CRUD | FR-016 | ✅ 완료 | |
| 시스템 설정 | - | ✅ 완료 | SLA/알림/예산 |
| 감사 로그 조회 | NFR-009 | ✅ 완료 | /admin/audit 페이지 |

---

## 3. 사이드바 네비게이션 vs 실제 라우트 매핑

### APPLICANT
| 메뉴 | 사이드바 경로 | 페이지 존재 | 상태 |
|------|-------------|-----------|------|
| 대시보드 | `/dashboard` | ✅ | ✅ |
| 신규 신청 | `/applications/new` | ✅ | ✅ |
| 내 신청 | `/applications` | ✅ | ✅ |
| API Key 관리 | `/api-keys` | ✅ | ✅ |

### TEAM_LEAD / SECURITY_REVIEWER
| 메뉴 | 사이드바 경로 | 페이지 존재 | 상태 |
|------|-------------|-----------|------|
| 대시보드 | `/dashboard` | ✅ | ✅ |
| 검토 목록 | `/reviews` | ✅ | ✅ |
| 검토 이력 | `/reviews/history` | ✅ | ✅ |

### IT_ADMIN / SYSTEM_ADMIN
| 메뉴 | 사이드바 경로 | 페이지 존재 | 상태 |
|------|-------------|-----------|------|
| 대시보드 | `/dashboard` | ✅ | ✅ |
| 라이센스 관리 | `/monitoring/licenses` | ✅ | ✅ |
| 사용 현황 | `/monitoring/usage` | ✅ | ✅ |
| 도구 관리 | `/admin/tools` | ✅ | ✅ |
| 감사 로그 | `/admin/audit` | ✅ | ✅ |

---

## 4. 남은 미구현 기능 요약

### 미구현 기능 (❌)
1. **일괄 검토 처리 (FR-055)** — 복수 신청 건 선택하여 일괄 승인
2. **라이센스 일괄 관리** — 체크박스 선택 + 일괄 갱신/해지
3. **통계 리포트 생성 (FR-089)** — 별도 리포트 페이지 (정기 리포트 자동 생성)
4. **비용/사용현황 내보내기 연결** — costs/usage 페이지에도 CSV 내보내기 연결 필요

### 향후 고려 사항
- 백엔드 API 연동 (현재 Mock API)
- SSO 인증 연동
- 실제 파일 업로드/다운로드
- 이메일/메신저 알림 발송
- 국제화 (i18n)
