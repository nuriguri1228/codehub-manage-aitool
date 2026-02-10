'use client';

import {
  KeyRound,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  Key,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from './kpi-card';
import { LicenseDonutChart } from './license-donut-chart';
import { MonthlyTrendChart } from './monthly-trend-chart';
import type {
  DashboardStats,
  ToolDistribution,
  MonthlyTrend,
} from '@/types';

// --- Mock Data ---
const mockStats: DashboardStats = {
  totalLicenses: 127,
  activeUsers: 98,
  monthlyCost: 12450,
  budgetLimit: 15000,
  avgProcessingDays: 1.8,
  slaRate: 96.5,
  licenseChange: 12,
  userChange: 8,
};

const mockToolDistribution: ToolDistribution[] = [
  { toolName: 'Claude Code', count: 68, color: '#1E40AF' },
  { toolName: 'Antigravity', count: 42, color: '#7C3AED' },
  { toolName: '기타', count: 17, color: '#D97706' },
];

const mockMonthlyTrend: MonthlyTrend[] = [
  { month: '9월', claudeCode: 120, antigravity: 80 },
  { month: '10월', claudeCode: 145, antigravity: 90 },
  { month: '11월', claudeCode: 180, antigravity: 110 },
  { month: '12월', claudeCode: 210, antigravity: 115 },
  { month: '1월', claudeCode: 250, antigravity: 140 },
  { month: '2월', claudeCode: 280, antigravity: 160 },
];

interface ActivityItem {
  id: string;
  type: 'approval' | 'issuance' | 'anomaly';
  message: string;
  highlight: string;
  time: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'approval',
    message: '김개발의 Claude Code 신청이',
    highlight: '최종 승인',
    time: '10분 전',
  },
  {
    id: '2',
    type: 'issuance',
    message: '박프론트의 Antigravity API Key가',
    highlight: '발급',
    time: '32분 전',
  },
  {
    id: '3',
    type: 'anomaly',
    message: '이상 사용 탐지:',
    highlight: '홍테스트의 사용량이 일일 한도의 150%를 초과했습니다',
    time: '1시간 전',
  },
  {
    id: '4',
    type: 'approval',
    message: '이모바일의 Claude Code 신청이',
    highlight: '팀장 승인',
    time: '2시간 전',
  },
  {
    id: '5',
    type: 'issuance',
    message: '정데옵스의 Claude Code API Key가',
    highlight: '갱신',
    time: '3시간 전',
  },
];

const activityConfig: Record<
  ActivityItem['type'],
  { color: string; icon: typeof CheckCircle2 }
> = {
  approval: { color: 'bg-emerald-500', icon: CheckCircle2 },
  issuance: { color: 'bg-blue-700', icon: Key },
  anomaly: { color: 'bg-red-600', icon: AlertTriangle },
};

export function AdminDashboard() {
  const stats = mockStats;
  const toolDistribution = mockToolDistribution;
  const monthlyTrend = mockMonthlyTrend;
  const activities = mockActivities;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">관리자 대시보드</h1>
        <p className="text-muted-foreground">
          전사 AI 도구 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="총 활성 라이센스"
          value={stats.totalLicenses.toLocaleString()}
          change={stats.licenseChange}
          icon={KeyRound}
          iconColor="text-blue-600"
        />
        <KpiCard
          title="활성 사용자"
          value={stats.activeUsers.toLocaleString()}
          change={stats.userChange}
          icon={Users}
          iconColor="text-emerald-600"
        />
        <KpiCard
          title="이번 달 총 비용"
          value={`$${stats.monthlyCost.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-gray-700"
          budgetBar={{ used: stats.monthlyCost, total: stats.budgetLimit }}
        />
        <KpiCard
          title="평균 처리 시간 / SLA 달성율"
          value={`${stats.avgProcessingDays}일`}
          secondaryValue={`${stats.slaRate}%`}
          secondaryLabel="목표: 2일 이내"
          icon={Clock}
          iconColor="text-gray-700"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <LicenseDonutChart data={toolDistribution} />
        <MonthlyTrendChart
          data={monthlyTrend}
          title="월별 사용 추이 (최근 6개월)"
          lines={[
            { key: 'claudeCode', name: 'Claude Code', color: '#1E40AF' },
            { key: 'antigravity', name: 'Antigravity', color: '#7C3AED' },
          ]}
        />
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">최근 활동</CardTitle>
          <button className="text-sm text-blue-700 hover:underline">
            전체보기 &gt;
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => {
              const config = activityConfig[activity.type];
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${config.color}`}
                  />
                  <span className="flex-1">
                    {activity.message}{' '}
                    <span
                      className={`font-semibold ${
                        activity.type === 'anomaly' ? 'text-red-600' : ''
                      }`}
                    >
                      {activity.highlight}
                    </span>
                    {activity.type !== 'anomaly' && '되었습니다'}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
