'use client';

import { useState } from 'react';
import {
  Phone,
  Coins,
  DollarSign,
  Users,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KpiCard } from '@/components/monitoring/kpi-card';
import { TopUsersList } from '@/components/monitoring/top-users-list';
import { AnomalyAlerts } from '@/components/monitoring/anomaly-alerts';
import type { DailyUsage, TopUser, AnomalyAlert, MonitoringStats } from '@/types';

// --- Inline Mock Data ---
const mockStats: MonitoringStats = {
  totalApiCalls: 1341,
  totalTokensUsed: 492000,
  totalCost: 7380,
  activeUsers: 3,
  totalUsers: 5,
  changePercent: {
    apiCalls: 12.5,
    tokens: 8.3,
    cost: 10.2,
  },
};

const mockDailyUsage: DailyUsage[] = [
  { date: '12/01', tokens: 45000, cost: 675, apiCalls: 120 },
  { date: '12/02', tokens: 52000, cost: 780, apiCalls: 145 },
  { date: '12/03', tokens: 38000, cost: 570, apiCalls: 98 },
  { date: '12/04', tokens: 61000, cost: 915, apiCalls: 167 },
  { date: '12/05', tokens: 48000, cost: 720, apiCalls: 132 },
  { date: '12/06', tokens: 55000, cost: 825, apiCalls: 151 },
  { date: '12/07', tokens: 42000, cost: 630, apiCalls: 115 },
  { date: '12/08', tokens: 30000, cost: 450, apiCalls: 82 },
  { date: '12/09', tokens: 58000, cost: 870, apiCalls: 159 },
  { date: '12/10', tokens: 63000, cost: 945, apiCalls: 172 },
];

const mockTopUsers: TopUser[] = [
  { userId: 'user-001', userName: '김개발', department: '플랫폼개발팀', tokensUsed: 456789, percentage: 35.2 },
  { userId: 'user-008', userName: '유데이터', department: '데이터팀', tokensUsed: 234567, percentage: 18.1 },
  { userId: 'user-002', userName: '이프론트', department: '플랫폼개발팀', tokensUsed: 189000, percentage: 14.6 },
  { userId: 'user-007', userName: '오백엔드', department: '서비스개발팀', tokensUsed: 145200, percentage: 11.2 },
  { userId: 'user-009', userName: '강팀장', department: '서비스개발팀', tokensUsed: 98500, percentage: 7.6 },
];

const mockAlerts: AnomalyAlert[] = [
  {
    id: 'alert-001',
    userId: 'user-008',
    userName: '유데이터',
    department: '데이터팀',
    type: 'HIGH_USAGE',
    description: '일일 토큰 사용량이 평균 대비 200% 초과',
    severity: 'HIGH',
    detectedAt: '2024-12-10T11:30:00Z',
    resolved: false,
  },
  {
    id: 'alert-002',
    userId: 'user-001',
    userName: '김개발',
    department: '플랫폼개발팀',
    type: 'UNUSUAL_TIME',
    description: '비업무 시간(23:00-06:00) API 호출 감지',
    severity: 'MEDIUM',
    detectedAt: '2024-12-09T02:15:00Z',
    resolved: true,
  },
  {
    id: 'alert-003',
    userId: 'user-002',
    userName: '이프론트',
    department: '플랫폼개발팀',
    type: 'QUOTA_WARNING',
    description: '월간 쿼터 사용량 80% 도달',
    severity: 'LOW',
    detectedAt: '2024-12-08T09:00:00Z',
    resolved: false,
  },
];

type PeriodTab = '7d' | '30d' | '90d' | 'custom';
type ToolTab = 'all' | 'claude' | 'antigravity';

export default function UsageMonitoringPage() {
  const [period, setPeriod] = useState<PeriodTab>('7d');
  const [toolFilter, setToolFilter] = useState<ToolTab>('all');
  const [alerts, setAlerts] = useState(mockAlerts);

  const handleResolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">사용 현황 모니터링</h1>
        <p className="text-muted-foreground">
          AI 도구 사용량과 비용을 실시간으로 모니터링하세요
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-4">
        <Tabs
          value={period}
          onValueChange={(v) => setPeriod(v as PeriodTab)}
        >
          <TabsList>
            <TabsTrigger value="7d">7일</TabsTrigger>
            <TabsTrigger value="30d">30일</TabsTrigger>
            <TabsTrigger value="90d">90일</TabsTrigger>
            <TabsTrigger value="custom">사용자 지정</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs
          value={toolFilter}
          onValueChange={(v) => setToolFilter(v as ToolTab)}
        >
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="claude">Claude Code</TabsTrigger>
            <TabsTrigger value="antigravity">Antigravity</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="총 API 호출"
          value={mockStats.totalApiCalls.toLocaleString()}
          change={mockStats.changePercent.apiCalls}
          icon={Phone}
          iconColor="text-blue-600"
        />
        <KpiCard
          title="총 토큰 사용량"
          value={`${(mockStats.totalTokensUsed / 1000).toFixed(0)}K`}
          change={mockStats.changePercent.tokens}
          icon={Coins}
          iconColor="text-purple-600"
        />
        <KpiCard
          title="총 비용"
          value={`$${mockStats.totalCost.toLocaleString()}`}
          change={mockStats.changePercent.cost}
          icon={DollarSign}
          iconColor="text-emerald-600"
        />
        <KpiCard
          title="활성 사용자"
          value={`${mockStats.activeUsers}명`}
          secondaryValue={`/ ${mockStats.totalUsers}명`}
          secondaryLabel="전체 사용자 대비"
          icon={Users}
          iconColor="text-orange-600"
        />
      </div>

      {/* Daily Usage Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">일별 사용량 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mockDailyUsage}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="usageTokenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1E40AF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="usageCallGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
                  }
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                  }}
                  formatter={(value?: number, name?: string) => {
                    if (name === 'tokens')
                      return [`${(value ?? 0).toLocaleString()} 토큰`, '토큰 사용량'];
                    return [`${(value ?? 0).toLocaleString()} 회`, 'API 호출'];
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="tokens"
                  stroke="#1E40AF"
                  strokeWidth={2.5}
                  fill="url(#usageTokenGradient)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="apiCalls"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  fill="url(#usageCallGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bottom row: Top Users + Anomaly Alerts */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <TopUsersList data={mockTopUsers} />
        <AnomalyAlerts data={alerts} onResolve={handleResolveAlert} />
      </div>
    </div>
  );
}
