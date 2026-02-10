'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ReviewListFilters from '@/components/review/review-list-filters';
import {
  useReviews,
  getSlaLabel,
  getSlaColorClass,
  calculateSlaStatus,
} from '@/hooks/use-review';
import { usePagination } from '@/hooks/use-pagination';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function ReviewListContent() {
  const searchParams = useSearchParams();
  const { page, limit, setPage } = usePagination();

  const status = searchParams.get('status') || 'all';
  const search = searchParams.get('search') || '';
  const tool = searchParams.get('tool') || '';
  const department = searchParams.get('department') || '';
  const sortBy = searchParams.get('sortBy') || 'dueDate';

  const { data, isLoading } = useReviews({
    page,
    limit,
    status,
    search,
    tool,
    department,
    sortBy,
    sortOrder: 'asc',
  });

  const items = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <ReviewListFilters />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <p className="text-lg font-medium">검토 대기 건이 없습니다</p>
              <p className="text-sm">조건을 변경하여 다시 검색하세요.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>신청번호</TableHead>
                  <TableHead>신청자 (부서)</TableHead>
                  <TableHead>AI 도구</TableHead>
                  <TableHead>신청일</TableHead>
                  <TableHead>현재 단계</TableHead>
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
                        <span className="text-muted-foreground">
                          ({item.applicantDepartment})
                        </span>
                      </TableCell>
                      <TableCell>{item.aiToolName}</TableCell>
                      <TableCell>{item.submittedAt}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            item.stageName === '재제출'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
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
                        <Button asChild variant="link" size="sm" className="px-0 text-blue-700">
                          <Link href={`/reviews/${item.applicationId}`}>검토</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">총 {meta.total}건</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(p)}
                className="min-w-8"
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">{meta.limit}건</span>
        </div>
      )}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">검토 대기 목록</h1>
      </div>
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        }
      >
        <ReviewListContent />
      </Suspense>
    </div>
  );
}
