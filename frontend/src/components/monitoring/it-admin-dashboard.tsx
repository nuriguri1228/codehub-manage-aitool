'use client';

import {
  Monitor,
  Laptop,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Server,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KpiCard } from './kpi-card';

// --- Mock Data ---
interface EnvStats {
  totalVdi: number;
  activeVdi: number;
  totalNotebook: number;
  activeNotebook: number;
  pendingProvisions: number;
  completedToday: number;
}

const mockEnvStats: EnvStats = {
  totalVdi: 85,
  activeVdi: 72,
  totalNotebook: 43,
  activeNotebook: 38,
  pendingProvisions: 3,
  completedToday: 2,
};

interface ProvisionItem {
  id: string;
  applicantName: string;
  envType: 'VDI' | 'NOTEBOOK';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  requestedAt: string;
  toolName: string;
}

const mockProvisions: ProvisionItem[] = [
  {
    id: 'prov-1',
    applicantName: '오백엔드',
    envType: 'VDI',
    status: 'PENDING',
    requestedAt: '2시간 전',
    toolName: 'Claude Code',
  },
  {
    id: 'prov-2',
    applicantName: '김개발',
    envType: 'NOTEBOOK',
    status: 'IN_PROGRESS',
    requestedAt: '4시간 전',
    toolName: 'Antigravity',
  },
  {
    id: 'prov-3',
    applicantName: '이모바일',
    envType: 'VDI',
    status: 'PENDING',
    requestedAt: '5시간 전',
    toolName: 'Claude Code',
  },
  {
    id: 'prov-4',
    applicantName: '박프론트',
    envType: 'NOTEBOOK',
    status: 'COMPLETED',
    requestedAt: '어제',
    toolName: 'Claude Code',
  },
  {
    id: 'prov-5',
    applicantName: '정데옵스',
    envType: 'VDI',
    status: 'COMPLETED',
    requestedAt: '어제',
    toolName: 'Antigravity',
  },
];

const statusConfig: Record<
  ProvisionItem['status'],
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  PENDING: { label: '대기', variant: 'outline' },
  IN_PROGRESS: { label: '진행중', variant: 'secondary' },
  COMPLETED: { label: '완료', variant: 'default' },
};

export function ItAdminDashboard() {
  const stats = mockEnvStats;
  const provisions = mockProvisions;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">환경 관리 대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">
          VDI/Notebook 개발환경 현황 및 프로비저닝 상태
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="VDI 현황"
          value={`${stats.activeVdi}/${stats.totalVdi}`}
          icon={Server}
          iconColor="text-blue-600"
          change={Math.round((stats.activeVdi / stats.totalVdi) * 100)}
          changeLabel="가동률"
        />
        <KpiCard
          title="Notebook 현황"
          value={`${stats.activeNotebook}/${stats.totalNotebook}`}
          icon={Laptop}
          iconColor="text-purple-600"
          change={Math.round((stats.activeNotebook / stats.totalNotebook) * 100)}
          changeLabel="가동률"
        />
        <KpiCard
          title="프로비저닝 대기"
          value={String(stats.pendingProvisions)}
          icon={Clock}
          iconColor="text-amber-600"
          changeLabel="환경 준비 대기 건"
        />
        <KpiCard
          title="오늘 완료"
          value={String(stats.completedToday)}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          changeLabel="오늘 환경 준비 완료"
        />
      </div>

      {/* Environment Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">환경 유형별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-blue-600" />
                    <span>VDI</span>
                  </div>
                  <span className="font-medium">{stats.activeVdi}대 활성</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${(stats.activeVdi / stats.totalVdi) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">전체 {stats.totalVdi}대 중 {stats.totalVdi - stats.activeVdi}대 미사용</p>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Laptop className="h-4 w-4 text-purple-600" />
                    <span>Notebook</span>
                  </div>
                  <span className="font-medium">{stats.activeNotebook}대 활성</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-purple-500"
                    style={{ width: `${(stats.activeNotebook / stats.totalNotebook) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">전체 {stats.totalNotebook}대 중 {stats.totalNotebook - stats.activeNotebook}대 미사용</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ENV_PREPARATION Review Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              환경 준비 검토 대기
            </CardTitle>
          </CardHeader>
          <CardContent>
            {provisions.filter((p) => p.status !== 'COMPLETED').length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                대기 중인 환경 준비 건이 없습니다.
              </p>
            ) : (
              <div className="space-y-3">
                {provisions
                  .filter((p) => p.status !== 'COMPLETED')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        {item.envType === 'VDI' ? (
                          <Server className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Laptop className="h-4 w-4 text-purple-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {item.applicantName} — {item.toolName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.envType} · {item.requestedAt}
                          </p>
                        </div>
                      </div>
                      <Badge variant={statusConfig[item.status].variant}>
                        {statusConfig[item.status].label}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Provisions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            최근 프로비저닝 이력
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">신청자</th>
                  <th className="pb-2 font-medium">도구</th>
                  <th className="pb-2 font-medium">환경</th>
                  <th className="pb-2 font-medium">상태</th>
                  <th className="pb-2 font-medium">요청 시간</th>
                </tr>
              </thead>
              <tbody>
                {provisions.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-2.5">{item.applicantName}</td>
                    <td className="py-2.5">{item.toolName}</td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-1">
                        {item.envType === 'VDI' ? (
                          <Server className="h-3.5 w-3.5 text-blue-500" />
                        ) : (
                          <Laptop className="h-3.5 w-3.5 text-purple-500" />
                        )}
                        {item.envType}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <Badge variant={statusConfig[item.status].variant}>
                        {statusConfig[item.status].label}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-gray-500">{item.requestedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
