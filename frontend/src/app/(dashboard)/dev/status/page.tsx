'use client';

import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  AlertTriangle,
  MinusCircle,
  Monitor,
  Server,
  Search,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// ── 상태 타입 ──
type ImplStatus = 'done' | 'partial' | 'not-started' | 'not-applicable';

interface StatusItem {
  name: string;
  reqId?: string;
  frontend: ImplStatus;
  backend: ImplStatus;
  note?: string;
}

interface FeatureGroup {
  name: string;
  icon?: string;
  items: StatusItem[];
  children?: FeatureGroup[];
}

// ── 상태 데이터 ──
const statusData: FeatureGroup[] = [
  {
    name: '인증 및 사용자 관리',
    icon: '🔐',
    items: [],
    children: [
      {
        name: '인증/로그인',
        items: [
          { name: 'SSO 연동 로그인', reqId: 'FR-001', frontend: 'done', backend: 'not-started', note: 'Mock 역할 선택 방식' },
          { name: '자동 사용자 프로비저닝', reqId: 'FR-002', frontend: 'not-applicable', backend: 'not-started' },
          { name: '세션 관리', reqId: 'FR-003', frontend: 'done', backend: 'not-started', note: 'Zustand persist' },
          { name: '로그인 이력 관리', reqId: 'FR-004', frontend: 'not-started', backend: 'not-started' },
        ],
      },
      {
        name: '역할 기반 접근 제어 (RBAC)',
        items: [
          { name: '역할 정의 및 관리', reqId: 'FR-005', frontend: 'done', backend: 'not-started', note: '5개 역할 정의' },
          { name: '역할별 메뉴/기능 접근 제어', reqId: 'FR-006', frontend: 'done', backend: 'not-started', note: 'sidebar.tsx' },
          { name: '다중 역할 부여', reqId: 'FR-007', frontend: 'not-started', backend: 'not-started' },
          { name: '역할 위임', reqId: 'FR-008', frontend: 'not-started', backend: 'not-started' },
        ],
      },
      {
        name: '사용자 프로필 관리',
        items: [
          { name: '프로필 조회', reqId: 'FR-010', frontend: 'done', backend: 'not-started', note: '/profile 페이지' },
          { name: '프로필 수정', reqId: 'FR-011', frontend: 'done', backend: 'not-started', note: '이메일/연락처 수정' },
          { name: '알림 설정 관리', reqId: 'FR-012', frontend: 'done', backend: 'not-started', note: '/settings 페이지' },
          { name: '나의 활동 내역 조회', reqId: 'FR-013', frontend: 'done', backend: 'not-started', note: '활동 요약+최근 신청' },
        ],
      },
    ],
  },
  {
    name: '도구 신청 프로세스',
    icon: '📝',
    items: [],
    children: [
      {
        name: 'AI 도구 선택',
        items: [
          { name: 'AI 도구 목록 조회', reqId: 'FR-014', frontend: 'done', backend: 'not-started', note: '카드형 UI' },
          { name: 'AI 도구 선택 (복수)', reqId: 'FR-015', frontend: 'done', backend: 'not-started', note: 'aiToolIds[]' },
          { name: 'AI 도구 관리 (관리자)', reqId: 'FR-016', frontend: 'done', backend: 'not-started', note: '/admin/tools CRUD' },
          { name: '도구별 안내 페이지', reqId: 'FR-017', frontend: 'not-started', backend: 'not-started' },
        ],
      },
      {
        name: '사용 환경 / 인적정보',
        items: [
          { name: '사용 환경 선택', reqId: 'FR-018', frontend: 'done', backend: 'not-started', note: 'VDI/NOTEBOOK/OTHER' },
          { name: '인적정보 자동 입력', reqId: 'FR-022', frontend: 'done', backend: 'not-started', note: 'HR 연동 Mock' },
          { name: '사용 목적 입력', reqId: '-', frontend: 'done', backend: 'not-started', note: 'wizard step3' },
        ],
      },
      {
        name: '프로젝트 정보 & 문서',
        items: [
          { name: '프로젝트 정보 입력', reqId: 'FR-025', frontend: 'done', backend: 'not-started', note: '동적 추가/삭제' },
          { name: '다중 프로젝트 등록', reqId: 'FR-026', frontend: 'done', backend: 'not-started' },
          { name: '프로젝트별 첨부파일', reqId: 'FR-029', frontend: 'done', backend: 'not-started', note: 'step4 카드 내' },
          { name: '추가 문서 첨부', reqId: 'FR-029', frontend: 'done', backend: 'not-started', note: 'step5' },
          { name: '첨부 파일 미리보기', reqId: 'FR-033', frontend: 'not-started', backend: 'not-started' },
        ],
      },
      {
        name: '보안 서약',
        items: [
          { name: '보안 서약서 표시', reqId: 'FR-034', frontend: 'done', backend: 'not-started', note: '스크롤 영역' },
          { name: '전자 서약 동의', reqId: 'FR-035', frontend: 'done', backend: 'not-started', note: 'Canvas 전자서명' },
          { name: '보안 서약서 버전 관리', reqId: 'FR-036', frontend: 'not-started', backend: 'not-started' },
          { name: '주기적 재서약', reqId: 'FR-038', frontend: 'not-started', backend: 'not-started' },
        ],
      },
      {
        name: '신청서 관리',
        items: [
          { name: '신청서 임시저장', reqId: 'FR-039', frontend: 'done', backend: 'not-started', note: 'Zustand persist' },
          { name: '신청서 제출', reqId: 'FR-041', frontend: 'done', backend: 'not-started' },
          { name: '신청서 수정', reqId: 'FR-042', frontend: 'done', backend: 'not-started', note: '편집 페이지' },
          { name: '신청서 취소', reqId: 'FR-043', frontend: 'done', backend: 'not-started', note: 'SUBMITTED 상태에서 취소' },
          { name: '신청서 복사 (재신청)', reqId: 'FR-044', frontend: 'done', backend: 'not-started', note: '복사하여 재신청' },
          { name: '피드백 기반 수정/재제출', reqId: 'FR-053', frontend: 'done', backend: 'not-started', note: '피드백 상세 표시' },
        ],
      },
    ],
  },
  {
    name: '검토 워크플로우',
    icon: '✅',
    items: [],
    children: [
      {
        name: '검토 처리',
        items: [
          { name: '검토 대시보드', reqId: 'FR-049', frontend: 'done', backend: 'not-started', note: 'ReviewerDashboard' },
          { name: '검토 승인', reqId: 'FR-050', frontend: 'done', backend: 'not-started' },
          { name: '검토 반려', reqId: 'FR-051', frontend: 'done', backend: 'not-started', note: '반려 사유 필수' },
          { name: '보완 요청 (피드백)', reqId: 'FR-052', frontend: 'done', backend: 'not-started' },
          { name: '체크리스트 기반 검토', reqId: '-', frontend: 'done', backend: 'not-started', note: 'ReviewChecklistItem[]' },
          { name: '일괄 검토 처리', reqId: 'FR-055', frontend: 'not-started', backend: 'not-started' },
        ],
      },
      {
        name: 'SLA 및 이력 관리',
        items: [
          { name: 'SLA 상태 표시', reqId: 'FR-056', frontend: 'done', backend: 'not-started', note: 'NORMAL/WARNING/OVERDUE' },
          { name: 'SLA 초과 알림', reqId: 'FR-057', frontend: 'partial', backend: 'not-started', note: '뱃지 표시만' },
          { name: '검토 이력 조회', reqId: 'FR-059', frontend: 'done', backend: 'not-started', note: '/reviews/history' },
          { name: '검토 통계', reqId: 'FR-060', frontend: 'done', backend: 'not-started', note: '이력 페이지 상단 카드' },
        ],
      },
    ],
  },
  {
    name: 'API Key & 라이센스 관리',
    icon: '🔑',
    items: [],
    children: [
      {
        name: 'API Key 관리',
        items: [
          { name: 'API Key 조회 (마스킹)', reqId: 'FR-063', frontend: 'done', backend: 'not-started' },
          { name: 'API Key 복사', reqId: 'FR-064', frontend: 'done', backend: 'not-started', note: '클립보드+toast' },
          { name: 'API Key 리셋', reqId: 'FR-065', frontend: 'done', backend: 'not-started' },
          { name: 'API Key 재발급', reqId: 'FR-066', frontend: 'done', backend: 'not-started' },
          { name: '긴급 키 비활성화', reqId: 'FR-067', frontend: 'done', backend: 'not-started' },
        ],
      },
      {
        name: '라이센스 관리',
        items: [
          { name: '라이센스 유효기간 관리', reqId: 'FR-068', frontend: 'partial', backend: 'not-started', note: '조회만 가능' },
          { name: '사용량 쿼터 조회', reqId: 'FR-071', frontend: 'done', backend: 'not-started', note: '프로그레스바' },
          { name: '라이센스 갱신 신청', reqId: 'FR-072', frontend: 'not-started', backend: 'not-started' },
          { name: '라이센스 해지', reqId: 'FR-074', frontend: 'not-started', backend: 'not-started' },
          { name: '라이센스 일괄 관리', reqId: '-', frontend: 'not-started', backend: 'not-started' },
        ],
      },
    ],
  },
  {
    name: '모니터링 & 대시보드',
    icon: '📊',
    items: [],
    children: [
      {
        name: '대시보드',
        items: [
          { name: '신청자 대시보드', reqId: '-', frontend: 'done', backend: 'not-started', note: 'ApplicantDashboard' },
          { name: '검토자 대시보드', reqId: '-', frontend: 'done', backend: 'not-started', note: 'ReviewerDashboard' },
          { name: '관리자 대시보드', reqId: '-', frontend: 'done', backend: 'not-started', note: 'AdminDashboard' },
        ],
      },
      {
        name: '라이센스 발급 현황',
        items: [
          { name: '발급 현황 대시보드', reqId: 'FR-076', frontend: 'done', backend: 'not-started', note: '차트+테이블' },
          { name: '발급 현황 시각화', reqId: 'FR-077', frontend: 'done', backend: 'not-started', note: '도넛/바 차트' },
          { name: '발급 현황 필터링/검색', reqId: 'FR-078', frontend: 'done', backend: 'not-started' },
        ],
      },
      {
        name: '사용 현황 모니터링',
        items: [
          { name: '실시간 사용 현황', reqId: 'FR-079', frontend: 'done', backend: 'not-started', note: 'KPI 카드' },
          { name: '사용자별 사용 현황', reqId: 'FR-080', frontend: 'done', backend: 'not-started', note: 'Top Users' },
          { name: '이상 사용 탐지', reqId: 'FR-086', frontend: 'done', backend: 'not-started', note: 'Anomaly Alerts' },
        ],
      },
      {
        name: '비용 관리',
        items: [
          { name: '비용 추적', reqId: 'FR-083', frontend: 'done', backend: 'not-started', note: '월별+도구별+부서별' },
          { name: '비용 예산 관리', reqId: 'FR-084', frontend: 'done', backend: 'not-started', note: '예산 대비 비율' },
          { name: '비용 리포트 생성', reqId: 'FR-085', frontend: 'partial', backend: 'not-started', note: 'CSV 내보내기만' },
        ],
      },
      {
        name: '내보내기 & 리포트',
        items: [
          { name: 'CSV 내보내기', reqId: 'FR-078', frontend: 'done', backend: 'not-applicable', note: 'export-utils.ts' },
          { name: 'PDF 내보내기', reqId: 'FR-085', frontend: 'done', backend: 'not-applicable', note: 'window.print()' },
          { name: '통계 리포트 페이지', reqId: 'FR-089', frontend: 'not-started', backend: 'not-started' },
        ],
      },
    ],
  },
  {
    name: '알림 시스템',
    icon: '🔔',
    items: [],
    children: [
      {
        name: '알림 채널',
        items: [
          { name: '시스템 내 알림 (인앱)', reqId: 'FR-094', frontend: 'done', backend: 'not-started', note: '헤더+알림센터' },
          { name: '이메일 알림', reqId: 'FR-092', frontend: 'not-applicable', backend: 'not-started' },
          { name: '사내 메신저 알림', reqId: 'FR-093', frontend: 'not-applicable', backend: 'not-started' },
          { name: '알림 채널 설정', reqId: 'FR-095', frontend: 'done', backend: 'not-started', note: '/settings 페이지' },
        ],
      },
      {
        name: '알림 UI',
        items: [
          { name: '알림 벨 아이콘 (헤더)', reqId: 'FR-094', frontend: 'done', backend: 'not-started', note: '미읽음 뱃지' },
          { name: '알림 센터 페이지', reqId: 'FR-094', frontend: 'done', backend: 'not-started', note: '/notifications' },
          { name: '읽음/안읽음 관리', reqId: 'FR-094', frontend: 'done', backend: 'not-started' },
        ],
      },
    ],
  },
  {
    name: '시스템 관리',
    icon: '⚙️',
    items: [],
    children: [
      {
        name: '관리 기능',
        items: [
          { name: 'AI 도구 등록/관리', reqId: 'FR-016', frontend: 'done', backend: 'not-started', note: '/admin/tools' },
          { name: '사용자 관리', reqId: 'FR-005', frontend: 'done', backend: 'not-started', note: '/admin/users' },
          { name: '시스템 설정', reqId: '-', frontend: 'done', backend: 'not-started', note: '/admin/settings' },
          { name: '감사 로그 조회', reqId: 'NFR-009', frontend: 'done', backend: 'not-started', note: '/admin/audit' },
        ],
      },
    ],
  },
];

// ── 유틸 함수 ──
const statusConfig: Record<ImplStatus, { label: string; color: string; icon: typeof CheckCircle2; bg: string }> = {
  done: { label: '완료', color: 'text-emerald-600', icon: CheckCircle2, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  partial: { label: '부분', color: 'text-amber-600', icon: AlertTriangle, bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  'not-started': { label: '미구현', color: 'text-gray-400', icon: Circle, bg: 'bg-gray-50 text-gray-500 border-gray-200' },
  'not-applicable': { label: 'N/A', color: 'text-gray-300', icon: MinusCircle, bg: 'bg-gray-50 text-gray-400 border-gray-200' },
};

function StatusBadge({ status }: { status: ImplStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', config.bg)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function countStatuses(groups: FeatureGroup[]): { done: number; partial: number; notStarted: number; total: number } {
  let done = 0, partial = 0, notStarted = 0, total = 0;
  for (const group of groups) {
    for (const item of group.items) {
      if (item.frontend !== 'not-applicable') {
        total++;
        if (item.frontend === 'done') done++;
        else if (item.frontend === 'partial') partial++;
        else notStarted++;
      }
    }
    if (group.children) {
      const child = countStatuses(group.children);
      done += child.done;
      partial += child.partial;
      notStarted += child.notStarted;
      total += child.total;
    }
  }
  return { done, partial, notStarted, total };
}

function countBackendStatuses(groups: FeatureGroup[]): { done: number; total: number } {
  let done = 0, total = 0;
  for (const group of groups) {
    for (const item of group.items) {
      if (item.backend !== 'not-applicable') {
        total++;
        if (item.backend === 'done') done++;
      }
    }
    if (group.children) {
      const child = countBackendStatuses(group.children);
      done += child.done;
      total += child.total;
    }
  }
  return { done, total };
}

function filterGroups(groups: FeatureGroup[], query: string): FeatureGroup[] {
  if (!query) return groups;
  const q = query.toLowerCase();
  return groups
    .map((group) => {
      const filteredItems = group.items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.reqId?.toLowerCase().includes(q) ||
          item.note?.toLowerCase().includes(q)
      );
      const filteredChildren = group.children ? filterGroups(group.children, query) : undefined;
      const hasResults = filteredItems.length > 0 || (filteredChildren && filteredChildren.length > 0);
      if (!hasResults) return null;
      return { ...group, items: filteredItems, children: filteredChildren ?? undefined };
    })
    .filter(Boolean) as FeatureGroup[];
}

// ── 컴포넌트 ──
function TreeNode({ group, depth = 0 }: { group: FeatureGroup; depth?: number }) {
  const [open, setOpen] = useState(true);
  const hasChildren = (group.children && group.children.length > 0) || group.items.length > 0;

  return (
    <div className={cn(depth > 0 && 'ml-4 border-l border-gray-200 pl-3')}>
      {/* 그룹 헤더 */}
      <button
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-gray-50"
        onClick={() => setOpen(!open)}
      >
        {hasChildren ? (
          open ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />
        ) : (
          <span className="w-4" />
        )}
        {group.icon && <span className="text-base">{group.icon}</span>}
        <span className={cn('font-medium', depth === 0 ? 'text-sm text-gray-900' : 'text-sm text-gray-700')}>
          {group.name}
        </span>
      </button>

      {/* 하위 항목 */}
      {open && (
        <div className="mt-1">
          {/* 아이템 테이블 */}
          {group.items.length > 0 && (
            <div className="ml-6 mb-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-500">
                    <th className="py-1.5 pr-3 text-left font-medium">기능</th>
                    <th className="w-20 py-1.5 text-center font-medium">요구사항</th>
                    <th className="w-24 py-1.5 text-center font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Monitor className="h-3 w-3" /> Frontend
                      </span>
                    </th>
                    <th className="w-24 py-1.5 text-center font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Server className="h-3 w-3" /> Backend
                      </span>
                    </th>
                    <th className="py-1.5 pl-3 text-left font-medium">비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {group.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-1.5 pr-3 text-gray-700">{item.name}</td>
                      <td className="py-1.5 text-center">
                        {item.reqId && item.reqId !== '-' ? (
                          <span className="text-xs text-gray-400">{item.reqId}</span>
                        ) : (
                          <span className="text-xs text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-1.5 text-center">
                        <StatusBadge status={item.frontend} />
                      </td>
                      <td className="py-1.5 text-center">
                        <StatusBadge status={item.backend} />
                      </td>
                      <td className="py-1.5 pl-3 text-xs text-gray-500">{item.note || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 자식 그룹 */}
          {group.children?.map((child, idx) => (
            <TreeNode key={idx} group={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ImplementationStatusPage() {
  const [search, setSearch] = useState('');

  const filtered = filterGroups(statusData, search);
  const feStats = countStatuses(statusData);
  const beStats = countBackendStatuses(statusData);
  const fePercent = feStats.total > 0 ? Math.round((feStats.done / feStats.total) * 100) : 0;
  const bePercent = beStats.total > 0 ? Math.round((beStats.done / beStats.total) * 100) : 0;

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">구현 현황 대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">
          문서 기반 기능 요구사항 대비 Frontend / Backend 구현 현황을 트리 형태로 확인합니다.
        </p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Frontend 진행률 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Frontend 진행률</CardTitle>
            <Monitor className="h-4 w-4 text-[#50CF94]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{fePercent}%</div>
            <Progress value={fePercent} className="mt-2 h-2" />
            <p className="mt-2 text-xs text-gray-500">
              {feStats.done} 완료 / {feStats.partial} 부분 / {feStats.notStarted} 미구현 (총 {feStats.total})
            </p>
          </CardContent>
        </Card>

        {/* Backend 진행률 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Backend 진행률</CardTitle>
            <Server className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{bePercent}%</div>
            <Progress value={bePercent} className="mt-2 h-2" />
            <p className="mt-2 text-xs text-gray-500">
              {beStats.done} 완료 / {beStats.total - beStats.done} 미구현 (총 {beStats.total})
            </p>
          </CardContent>
        </Card>

        {/* Frontend 상태별 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Frontend 상태별</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 완료
                </span>
                <span className="font-semibold text-emerald-600">{feStats.done}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> 부분 구현
                </span>
                <span className="font-semibold text-amber-600">{feStats.partial}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm">
                  <Circle className="h-4 w-4 text-gray-400" /> 미구현
                </span>
                <span className="font-semibold text-gray-500">{feStats.notStarted}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 카테고리 요약 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">카테고리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {statusData.map((group, idx) => {
                const gs = countStatuses([group]);
                const pct = gs.total > 0 ? Math.round((gs.done / gs.total) * 100) : 0;
                return (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 truncate">
                      <span>{group.icon}</span>
                      <span className="truncate text-gray-700">{group.name}</span>
                    </span>
                    <Badge variant={pct === 100 ? 'default' : pct > 50 ? 'secondary' : 'outline'} className="text-xs">
                      {pct}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="기능명, 요구사항 ID로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="text-gray-500">범례:</span>
        {Object.entries(statusConfig).map(([key, config]) => (
          <span key={key} className="flex items-center gap-1">
            <StatusBadge status={key as ImplStatus} />
          </span>
        ))}
      </div>

      {/* 트리 */}
      <Card>
        <CardContent className="p-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">검색 결과가 없습니다.</div>
          ) : (
            <div className="space-y-1">
              {filtered.map((group, idx) => (
                <TreeNode key={idx} group={group} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
