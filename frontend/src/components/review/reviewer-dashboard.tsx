'use client';

import Link from 'next/link';
import {
  ClipboardCheck,
  Clock,
  AlertTriangle,
  Timer,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useReviews,
  useReviewStats,
  getSlaLabel,
  getSlaColorClass,
  calculateSlaStatus,
} from '@/hooks/use-review';

function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  accent,
  extra,
}: {
  title: string;
  value: number | string;
  unit: string;
  icon: React.ElementType;
  accent: string;
  extra?: React.ReactNode;
}) {
  return (
    <Card className="gap-4 py-4">
      <CardContent className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-3xl font-bold ${accent}`}>{value}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {extra}
          <div className="rounded-lg bg-muted p-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
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

function ReviewQueueTable() {
  const { data, isLoading } = useReviews({ limit: 5, sortBy: 'dueDate', sortOrder: 'asc' });

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  const items = data?.data ?? [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <ClipboardCheck className="mb-2 h-10 w-10" />
        <p>현재 검토 대기 건이 없습니다.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>신청번호</TableHead>
          <TableHead>신청자</TableHead>
          <TableHead>AI 도구</TableHead>
          <TableHead>신청일</TableHead>
          <TableHead>검토 단계</TableHead>
          <TableHead>SLA 잔여</TableHead>
          <TableHead className="text-right">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const sla = calculateSlaStatus(item.dueDate);
          const slaColor = getSlaColorClass(sla);
          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.applicationNumber}</TableCell>
              <TableCell>
                {item.applicantName}{' '}
                <span className="text-muted-foreground">({item.applicantDepartment})</span>
              </TableCell>
              <TableCell>{item.aiToolName}</TableCell>
              <TableCell>{item.submittedAt}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={
                    item.stageName === '재제출'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-[#50CF94]/15 text-[#2d8a5e]'
                  }
                >
                  {item.stageName}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`${slaColor} border-0`}>
                  {getSlaLabel(item.dueDate)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm">
                  <Link href={`/reviews/${item.applicationId}`}>검토하기</Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default function ReviewerDashboard() {
  const { data: stats, isLoading: statsLoading } = useReviewStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">검토 대시보드</h1>
        <p className="text-muted-foreground">안녕하세요. 검토 현황을 확인하세요.</p>
      </div>

      {/* Summary Cards */}
      {statsLoading ? (
        <StatsLoading />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="검토 대기"
            value={stats?.pending ?? 0}
            unit="건"
            icon={ClipboardCheck}
            accent="text-red-600"
            extra={
              stats && stats.pending > 0 ? (
                <Badge className="bg-red-100 text-red-600 border-0">
                  +{stats.pending}
                </Badge>
              ) : undefined
            }
          />
          <StatCard
            title="피드백 대기 (재제출)"
            value={2}
            unit="건"
            icon={MessageSquare}
            accent="text-amber-600"
          />
          <StatCard
            title="금일 처리"
            value={stats?.completedToday ?? 0}
            unit="건"
            icon={Clock}
            accent="text-emerald-600"
          />
          <StatCard
            title="평균 처리 시간"
            value={stats?.avgProcessingDays ?? 0}
            unit="시간"
            icon={Timer}
            accent="text-[#50CF94]"
          />
        </div>
      )}

      {/* Review Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">검토 대기 목록</CardTitle>
          <CardAction>
            <Button variant="link" asChild className="gap-1 px-0">
              <Link href="/reviews">
                전체보기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ReviewQueueTable />
        </CardContent>
      </Card>
    </div>
  );
}
