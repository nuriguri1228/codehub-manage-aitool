'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KpiCard } from '@/components/monitoring/kpi-card';

// --- Inline Mock Data ---
const mockMonthlyCosts = [
  { month: '7월', claudeCode: 1200, copilot: 800, cursorAI: 400 },
  { month: '8월', claudeCode: 1500, copilot: 900, cursorAI: 500 },
  { month: '9월', claudeCode: 1800, copilot: 1100, cursorAI: 600 },
  { month: '10월', claudeCode: 2100, copilot: 1200, cursorAI: 750 },
  { month: '11월', claudeCode: 2500, copilot: 1400, cursorAI: 850 },
  { month: '12월', claudeCode: 2800, copilot: 1500, cursorAI: 950 },
];

const mockToolCosts = [
  { name: 'Claude Code', value: 2800, color: '#1E40AF' },
  { name: 'Antigravity', value: 1500, color: '#22c55e' },
  { name: 'Cursor AI', value: 950, color: '#f59e0b' },
];

const mockDeptCosts = [
  { department: '플랫폼개발팀', cost: 2450, budget: 3000 },
  { department: '서비스개발팀', cost: 1280, budget: 2000 },
  { department: '데이터팀', cost: 980, budget: 1500 },
  { department: 'IT운영팀', cost: 420, budget: 1000 },
  { department: '보안팀', cost: 120, budget: 500 },
];

type ViewTab = 'monthly' | 'tool' | 'department';

export default function CostsPage() {
  const [view, setView] = useState<ViewTab>('monthly');

  const totalCost = mockToolCosts.reduce((sum, t) => sum + t.value, 0);
  const totalBudget = 15000;
  const budgetPercent = Math.round((totalCost / totalBudget) * 100);
  const lastMonthTotal = 4750;
  const costChange = Math.round(((totalCost - lastMonthTotal) / lastMonthTotal) * 100 * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">비용 관리</h1>
        <p className="text-muted-foreground">
          AI 도구 사용 비용을 분석하고 예산을 관리하세요
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="이번 달 총 비용"
          value={`$${totalCost.toLocaleString()}`}
          change={costChange}
          icon={DollarSign}
          iconColor="text-blue-600"
        />
        <KpiCard
          title="예산 대비 사용률"
          value={`${budgetPercent}%`}
          icon={Target}
          iconColor="text-emerald-600"
          budgetBar={{ used: totalCost, total: totalBudget }}
        />
        <KpiCard
          title="전월 대비 증감"
          value={costChange >= 0 ? `+${costChange}%` : `${costChange}%`}
          icon={costChange >= 0 ? TrendingUp : TrendingDown}
          iconColor={costChange >= 0 ? 'text-red-600' : 'text-emerald-600'}
          secondaryLabel={`전월: $${lastMonthTotal.toLocaleString()}`}
        />
        <KpiCard
          title="예산 잔액"
          value={`$${(totalBudget - totalCost).toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-gray-700"
          secondaryLabel={`월 예산: $${totalBudget.toLocaleString()}`}
        />
      </div>

      {/* View Tabs */}
      <Tabs value={view} onValueChange={(v) => setView(v as ViewTab)}>
        <TabsList>
          <TabsTrigger value="monthly">월별 추이</TabsTrigger>
          <TabsTrigger value="tool">도구별 분석</TabsTrigger>
          <TabsTrigger value="department">부서별 분석</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Monthly Cost Trend */}
      {view === 'monthly' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">월별 비용 추이 (최근 6개월)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockMonthlyCosts}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '13px',
                    }}
                    formatter={(value?: number, name?: string) => {
                      const labels: Record<string, string> = {
                        claudeCode: 'Claude Code',
                        copilot: 'Antigravity',
                        cursorAI: 'Cursor AI',
                      };
                      return [`$${(value ?? 0).toLocaleString()}`, labels[name ?? ''] ?? name];
                    }}
                  />
                  <Legend
                    formatter={(value: string) => {
                      const labels: Record<string, string> = {
                        claudeCode: 'Claude Code',
                        copilot: 'Antigravity',
                        cursorAI: 'Cursor AI',
                      };
                      return labels[value] ?? value;
                    }}
                  />
                  <Bar
                    dataKey="claudeCode"
                    stackId="a"
                    fill="#1E40AF"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="copilot"
                    stackId="a"
                    fill="#22c55e"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="cursorAI"
                    stackId="a"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tool Cost Analysis */}
      {view === 'tool' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">도구별 비용 비율</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockToolCosts}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {mockToolCosts.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value?: number) => [
                        `$${(value ?? 0).toLocaleString()}`,
                        '비용',
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">도구별 비용 상세</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockToolCosts.map((tool) => (
                  <div key={tool.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: tool.color }}
                        />
                        <span className="font-medium">{tool.name}</span>
                      </div>
                      <span className="font-semibold">
                        ${tool.value.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={(tool.value / totalCost) * 100}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      전체 비용의 {Math.round((tool.value / totalCost) * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Department Cost Analysis */}
      {view === 'department' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">부서별 비용 및 예산 사용률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {mockDeptCosts.map((dept) => {
                const percent = Math.round((dept.cost / dept.budget) * 100);
                return (
                  <div key={dept.department} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {dept.department}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ${dept.cost.toLocaleString()} / $
                        {dept.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={percent}
                        className={`h-2.5 flex-1 ${
                          percent > 90
                            ? '[&>div]:bg-red-500'
                            : percent > 70
                              ? '[&>div]:bg-amber-500'
                              : '[&>div]:bg-blue-600'
                        }`}
                      />
                      <span
                        className={`w-12 text-right text-sm font-medium ${
                          percent > 90
                            ? 'text-red-600'
                            : percent > 70
                              ? 'text-amber-600'
                              : 'text-blue-600'
                        }`}
                      >
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
