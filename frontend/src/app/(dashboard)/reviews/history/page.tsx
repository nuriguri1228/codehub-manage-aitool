'use client';

import { Suspense, useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  TrendingUp,
  Timer,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePagination } from '@/hooks/use-pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { mockReviewApi } from '@/lib/mock-api';
import { cn } from '@/lib/utils';
import type { ReviewResult } from '@/types';

// --- Mock completed review data ---

interface CompletedReview {
  id: string;
  applicationId: string;
  applicationNumber: string;
  applicantName: string;
  applicantDepartment: string;
  aiToolNames: string[];
  result: ReviewResult;
  reviewerName: string;
  reviewedAt: string;
  submittedAt: string;
  processingDays: number;
}

const MOCK_COMPLETED_REVIEWS: CompletedReview[] = [
  {
    id: 'rev-h-001',
    applicationId: 'app-001',
    applicationNumber: 'APP-2024-0001',
    applicantName: '김개발',
    applicantDepartment: '플랫폼개발팀',
    aiToolNames: ['Claude Code'],
    result: 'APPROVED',
    reviewerName: '박팀장',
    reviewedAt: '2024-10-01',
    submittedAt: '2024-09-15',
    processingDays: 16,
  },
  {
    id: 'rev-h-002',
    applicationId: 'app-007',
    applicationNumber: 'APP-2024-0007',
    applicantName: '오백엔드',
    applicantDepartment: '서비스개발팀',
    aiToolNames: ['Antigravity'],
    result: 'REJECTED',
    reviewerName: '최보안',
    reviewedAt: '2024-09-20',
    submittedAt: '2024-09-05',
    processingDays: 15,
  },
  {
    id: 'rev-h-003',
    applicationId: 'app-008',
    applicationNumber: 'APP-2024-0008',
    applicantName: '이프론트',
    applicantDepartment: '플랫폼개발팀',
    aiToolNames: ['Claude Code'],
    result: 'FEEDBACK_REQUESTED',
    reviewerName: '박팀장',
    reviewedAt: '2024-10-23',
    submittedAt: '2024-10-20',
    processingDays: 3,
  },
  {
    id: 'rev-h-004',
    applicationId: 'app-006',
    applicationNumber: 'APP-2024-0006',
    applicantName: '유데이터',
    applicantDepartment: '데이터팀',
    aiToolNames: ['Claude Code'],
    result: 'APPROVED',
    reviewerName: '한시스템',
    reviewedAt: '2024-09-01',
    submittedAt: '2024-08-10',
    processingDays: 22,
  },
  {
    id: 'rev-h-005',
    applicationId: 'app-011',
    applicationNumber: 'APP-2024-0011',
    applicantName: '이프론트',
    applicantDepartment: '플랫폼개발팀',
    aiToolNames: ['Antigravity'],
    result: 'APPROVED',
    reviewerName: '한시스템',
    reviewedAt: '2024-08-15',
    submittedAt: '2024-07-20',
    processingDays: 26,
  },
  {
    id: 'rev-h-006',
    applicationId: 'app-002',
    applicationNumber: 'APP-2024-0002',
    applicantName: '김개발',
    applicantDepartment: '플랫폼개발팀',
    aiToolNames: ['Antigravity'],
    result: 'APPROVED',
    reviewerName: '박팀장',
    reviewedAt: '2024-11-03',
    submittedAt: '2024-11-01',
    processingDays: 2,
  },
  {
    id: 'rev-h-007',
    applicationId: 'app-009',
    applicationNumber: 'APP-2024-0009',
    applicantName: '유데이터',
    applicantDepartment: '데이터팀',
    aiToolNames: ['Cursor AI'],
    result: 'APPROVED',
    reviewerName: '송보안',
    reviewedAt: '2024-11-15',
    submittedAt: '2024-11-05',
    processingDays: 10,
  },
  {
    id: 'rev-h-008',
    applicationId: 'app-010',
    applicationNumber: 'APP-2024-0010',
    applicantName: '김개발',
    applicantDepartment: '플랫폼개발팀',
    aiToolNames: ['Claude Code'],
    result: 'APPROVED',
    reviewerName: '정관리',
    reviewedAt: '2024-12-08',
    submittedAt: '2024-12-02',
    processingDays: 6,
  },
];

const RESULT_TABS = [
  { value: 'all', label: '전체' },
  { value: 'APPROVED', label: '승인' },
  { value: 'REJECTED', label: '반려' },
  { value: 'FEEDBACK_REQUESTED', label: '피드백' },
];

const AI_TOOLS = [
  { value: 'all', label: '전체' },
  { value: 'Claude Code', label: 'Claude Code' },
  { value: 'Antigravity', label: 'Antigravity' },
  { value: 'Cursor AI', label: 'Cursor AI' },
  { value: 'Tabnine', label: 'Tabnine' },
];

const DEPARTMENTS = [
  { value: 'all', label: '전체' },
  { value: '플랫폼개발팀', label: '플랫폼개발팀' },
  { value: '서비스개발팀', label: '서비스개발팀' },
  { value: '데이터팀', label: '데이터팀' },
  { value: 'AI연구팀', label: 'AI연구팀' },
  { value: '보안팀', label: '보안팀' },
];

const RESULT_BADGE_CONFIG: Record<ReviewResult, { label: string; className: string }> = {
  APPROVED: { label: '승인', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: '반려', className: 'bg-red-50 text-red-700 border-red-200' },
  FEEDBACK_REQUESTED: { label: '피드백', className: 'bg-amber-50 text-amber-700 border-amber-200' },
};

function ReviewHistoryContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, limit, setPage } = usePagination();

  const resultFilter = searchParams.get('result') || 'all';
  const toolFilter = searchParams.get('tool') || 'all';
  const deptFilter = searchParams.get('department') || 'all';
  const currentSearch = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(currentSearch);
  const debouncedSearch = useDebounce(searchInput, 300);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  useEffect(() => {
    if (debouncedSearch !== currentSearch) {
      updateParams({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  // Filter and paginate data
  const { filteredData, stats } = useMemo(() => {
    let filtered = [...MOCK_COMPLETED_REVIEWS];

    if (resultFilter !== 'all') {
      filtered = filtered.filter((r) => r.result === resultFilter);
    }
    if (toolFilter !== 'all') {
      filtered = filtered.filter((r) => r.aiToolNames.includes(toolFilter));
    }
    if (deptFilter !== 'all') {
      filtered = filtered.filter((r) => r.applicantDepartment === deptFilter);
    }
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.applicationNumber.toLowerCase().includes(q) ||
          r.applicantName.toLowerCase().includes(q)
      );
    }

    // Sort by reviewedAt desc
    filtered.sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt));

    const all = MOCK_COMPLETED_REVIEWS;
    const approved = all.filter((r) => r.result === 'APPROVED').length;
    const avgDays = all.reduce((sum, r) => sum + r.processingDays, 0) / all.length;
    const slaCompliant = all.filter((r) => r.processingDays <= 14).length;

    return {
      filteredData: filtered,
      stats: {
        total: all.length,
        approvalRate: all.length > 0 ? Math.round((approved / all.length) * 100) : 0,
        avgProcessingDays: Math.round(avgDays * 10) / 10,
        slaRate: all.length > 0 ? Math.round((slaCompliant / all.length) * 100) : 0,
      },
    };
  }, [resultFilter, toolFilter, deptFilter, currentSearch]);

  const total = filteredData.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const items = filteredData.slice(start, start + limit);

  const activeFilters: { key: string; label: string }[] = [];
  if (toolFilter !== 'all') activeFilters.push({ key: 'tool', label: toolFilter });
  if (deptFilter !== 'all') activeFilters.push({ key: 'department', label: deptFilter });
  if (currentSearch) activeFilters.push({ key: 'search', label: `"${currentSearch}"` });

  const clearAllFilters = () => {
    setSearchInput('');
    router.push(pathname);
  };

  const removeFilter = (key: string) => {
    if (key === 'search') setSearchInput('');
    updateParams({ [key]: '' });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">총 처리건</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">승인율</p>
              <p className="text-2xl font-bold">{stats.approvalRate}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Timer className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">평균 처리시간</p>
              <p className="text-2xl font-bold">{stats.avgProcessingDays}일</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <ShieldCheck className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">SLA 준수율</p>
              <p className="text-2xl font-bold">{stats.slaRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <Tabs value={resultFilter} onValueChange={(v) => updateParams({ result: v })}>
          <TabsList>
            {RESULT_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
          <Select value={toolFilter} onValueChange={(v) => updateParams({ tool: v })}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="AI 도구" />
            </SelectTrigger>
            <SelectContent>
              {AI_TOOLS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={deptFilter} onValueChange={(v) => updateParams({ department: v })}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="부서" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="신청자명, 신청번호 검색"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
            <span className="text-sm text-muted-foreground">적용 필터:</span>
            {activeFilters.map((f) => (
              <Badge
                key={f.key}
                variant="secondary"
                className="gap-1 bg-[#50CF94]/15 text-[#2d8a5e]"
              >
                {f.label}
                <button
                  onClick={() => removeFilter(f.key)}
                  className="ml-0.5 rounded-full hover:bg-[#50CF94]/25"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="link"
              size="sm"
              onClick={clearAllFilters}
              className="h-auto p-0 text-[#50CF94]"
            >
              필터 초기화
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <p className="text-lg font-medium">검토 이력이 없습니다</p>
              <p className="text-sm">조건을 변경하여 다시 검색하세요.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>신청번호</TableHead>
                  <TableHead>신청자 (부서)</TableHead>
                  <TableHead>AI 도구</TableHead>
                  <TableHead>처리 결과</TableHead>
                  <TableHead>처리일</TableHead>
                  <TableHead>소요 시간</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const badgeConfig = RESULT_BADGE_CONFIG[item.result];
                  return (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/reviews/${item.applicationId}`)}
                    >
                      <TableCell className="font-medium">
                        {item.applicationNumber}
                      </TableCell>
                      <TableCell>
                        {item.applicantName}{' '}
                        <span className="text-muted-foreground">
                          ({item.applicantDepartment})
                        </span>
                      </TableCell>
                      <TableCell>{item.aiToolNames.join(', ')}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={badgeConfig.className}>
                          {item.result === 'APPROVED' && (
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                          )}
                          {item.result === 'REJECTED' && (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {item.result === 'FEEDBACK_REQUESTED' && (
                            <MessageSquare className="mr-1 h-3 w-3" />
                          )}
                          {badgeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.reviewedAt}</TableCell>
                      <TableCell>{item.processingDays}일</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">총 {total}건</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">{limit}건</span>
        </div>
      )}
    </div>
  );
}

export default function ReviewHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">검토 이력</h1>
        <p className="text-muted-foreground">
          완료된 검토 건의 이력을 조회합니다
        </p>
      </div>
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[88px] w-full" />
              ))}
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        }
      >
        <ReviewHistoryContent />
      </Suspense>
    </div>
  );
}
