'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Clock,
  CheckCircle,
  Key,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge, DataTable, type Column } from '@/components/common';
import { useAuthStore } from '@/stores/auth-store';
import { useApplications, useApplicationStats } from '@/hooks/use-application';
import { useApiKeys } from '@/hooks/use-api-key';
import type { Application, ApiKey } from '@/types';

function StatCard({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <Card className="gap-4 py-4">
      <CardContent className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-3xl font-bold ${accent}`}>{value}</span>
            <span className="text-sm text-muted-foreground">건</span>
          </div>
        </div>
        <div className="rounded-lg bg-muted p-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatsLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="gap-4 py-4">
          <CardContent>
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const recentColumns: Column<Application>[] = [
  {
    key: 'applicationNumber',
    header: '신청번호',
    className: 'font-medium',
  },
  {
    key: 'aiToolName',
    header: 'AI 도구',
  },
  {
    key: 'environment',
    header: '환경',
  },
  {
    key: 'status',
    header: '상태',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'createdAt',
    header: '신청일',
    render: (row) => new Date(row.createdAt).toLocaleDateString('ko-KR'),
  },
];

function ApiKeyMiniCard({ apiKey }: { apiKey: ApiKey }) {
  const usagePercent = Math.round((apiKey.quotaUsed / apiKey.quotaLimit) * 100);

  return (
    <div className="flex items-center justify-between rounded-lg border bg-white p-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">{apiKey.aiToolName}</p>
        <p className="text-xs text-gray-500">{apiKey.maskedKey}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">{usagePercent}%</p>
        <p className="text-xs text-gray-500">사용량</p>
      </div>
    </div>
  );
}

export default function ApplicantDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const userId = user?.id ?? '';

  const { data: statsResult, isLoading: statsLoading } = useApplicationStats(userId);
  const { data: appsResult, isLoading: appsLoading } = useApplications({
    userId,
    page: 1,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const { data: keysResult, isLoading: keysLoading } = useApiKeys(userId);

  const stats = statsResult?.data;
  const recentApps = appsResult?.data ?? [];
  const apiKeys = keysResult?.data ?? [];
  const activeKeys = apiKeys.filter((k) => k.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">나의 대시보드</h1>
          <p className="text-muted-foreground">
            안녕하세요, {user?.name}님. AI 도구 신청 현황을 확인하세요.
          </p>
        </div>
        <Button asChild>
          <Link href="/applications/new">
            <Plus className="mr-1.5 h-4 w-4" />
            새 신청하기
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      {statsLoading ? (
        <StatsLoading />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="전체 신청"
            value={stats?.total ?? 0}
            icon={FileText}
            accent="text-[#50CF94]"
          />
          <StatCard
            title="진행 중"
            value={stats?.inReview ?? 0}
            icon={Clock}
            accent="text-amber-600"
          />
          <StatCard
            title="승인 완료"
            value={stats?.approved ?? 0}
            icon={CheckCircle}
            accent="text-emerald-600"
          />
          <StatCard
            title="발급된 Key"
            value={stats?.keyIssued ?? 0}
            icon={Key}
            accent="text-purple-600"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Applications */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">최근 신청</CardTitle>
            <CardAction>
              <Button variant="link" asChild className="gap-1 px-0">
                <Link href="/applications">
                  전체보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {appsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <DataTable
                columns={recentColumns}
                data={recentApps}
                keyField="id"
                onRowClick={(row) => router.push(`/applications/${row.id}`)}
                emptyMessage="아직 신청 내역이 없습니다."
                emptyAction={
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/applications/new">첫 신청하기</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        {/* API Keys Mini */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">나의 라이센스</CardTitle>
            <CardAction>
              <Button variant="link" asChild className="gap-1 px-0">
                <Link href="/api-keys">
                  관리
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {keysLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : activeKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Key className="mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">발급된 라이센스가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeKeys.map((key) => (
                  <ApiKeyMiniCard key={key.id} apiKey={key} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
