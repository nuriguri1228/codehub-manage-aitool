'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
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
import { usePagination } from '@/hooks/use-pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { mockAuditApi } from '@/lib/mock-api';
import type { AuditAction } from '@/types';

const ACTION_LABELS: Record<AuditAction, string> = {
  LOGIN: '로그인',
  LOGOUT: '로그아웃',
  APPLICATION_CREATE: '신청서 생성',
  APPLICATION_SUBMIT: '신청서 제출',
  APPLICATION_CANCEL: '신청서 취소',
  REVIEW_APPROVE: '검토 승인',
  REVIEW_REJECT: '검토 반려',
  REVIEW_FEEDBACK: '피드백 요청',
  API_KEY_ISSUE: 'Key 발급',
  API_KEY_REVOKE: 'Key 폐기',
  API_KEY_REGENERATE: 'Key 재발급',
  LICENSE_UPDATE: '라이센스 변경',
  TOOL_CREATE: '도구 등록',
  TOOL_UPDATE: '도구 수정',
  USER_ROLE_CHANGE: '역할 변경',
  SETTINGS_CHANGE: '설정 변경',
};

const ACTION_BADGE_COLORS: Record<AuditAction, string> = {
  LOGIN: 'bg-slate-50 text-slate-700 border-slate-200',
  LOGOUT: 'bg-slate-50 text-slate-700 border-slate-200',
  APPLICATION_CREATE: 'bg-blue-50 text-blue-700 border-blue-200',
  APPLICATION_SUBMIT: 'bg-blue-50 text-blue-700 border-blue-200',
  APPLICATION_CANCEL: 'bg-gray-50 text-gray-700 border-gray-200',
  REVIEW_APPROVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REVIEW_REJECT: 'bg-red-50 text-red-700 border-red-200',
  REVIEW_FEEDBACK: 'bg-amber-50 text-amber-700 border-amber-200',
  API_KEY_ISSUE: 'bg-purple-50 text-purple-700 border-purple-200',
  API_KEY_REVOKE: 'bg-red-50 text-red-700 border-red-200',
  API_KEY_REGENERATE: 'bg-purple-50 text-purple-700 border-purple-200',
  LICENSE_UPDATE: 'bg-orange-50 text-orange-700 border-orange-200',
  TOOL_CREATE: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  TOOL_UPDATE: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  USER_ROLE_CHANGE: 'bg-pink-50 text-pink-700 border-pink-200',
  SETTINGS_CHANGE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const ACTION_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'LOGIN', label: '로그인' },
  { value: 'LOGOUT', label: '로그아웃' },
  { value: 'APPLICATION_CREATE', label: '신청서 생성' },
  { value: 'APPLICATION_SUBMIT', label: '신청서 제출' },
  { value: 'APPLICATION_CANCEL', label: '신청서 취소' },
  { value: 'REVIEW_APPROVE', label: '검토 승인' },
  { value: 'REVIEW_REJECT', label: '검토 반려' },
  { value: 'REVIEW_FEEDBACK', label: '피드백 요청' },
  { value: 'API_KEY_ISSUE', label: 'Key 발급' },
  { value: 'API_KEY_REVOKE', label: 'Key 폐기' },
  { value: 'API_KEY_REGENERATE', label: 'Key 재발급' },
  { value: 'LICENSE_UPDATE', label: '라이센스 변경' },
  { value: 'TOOL_CREATE', label: '도구 등록' },
  { value: 'TOOL_UPDATE', label: '도구 수정' },
  { value: 'USER_ROLE_CHANGE', label: '역할 변경' },
  { value: 'SETTINGS_CHANGE', label: '설정 변경' },
];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function AuditLogContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, limit, setPage } = usePagination();

  const actionFilter = searchParams.get('action') || 'all';
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

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', { page, limit, action: actionFilter, search: currentSearch }],
    queryFn: () =>
      mockAuditApi.getAuditLogs({
        page,
        limit,
        action: actionFilter !== 'all' ? (actionFilter as AuditAction) : undefined,
        search: currentSearch || undefined,
      }),
  });

  const items = data?.data ?? [];
  const meta = data?.meta;

  const activeFilters: { key: string; label: string }[] = [];
  if (actionFilter !== 'all') {
    activeFilters.push({ key: 'action', label: ACTION_LABELS[actionFilter as AuditAction] });
  }
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
      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
          <Select value={actionFilter} onValueChange={(v) => updateParams({ action: v })}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="행위 유형" />
            </SelectTrigger>
            <SelectContent>
              {ACTION_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="사용자명, 대상 ID 검색"
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
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <p className="text-lg font-medium">감사 로그가 없습니다</p>
              <p className="text-sm">조건을 변경하여 다시 검색하세요.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>일시</TableHead>
                  <TableHead>사용자 (사번)</TableHead>
                  <TableHead>행위 유형</TableHead>
                  <TableHead>대상</TableHead>
                  <TableHead>상세</TableHead>
                  <TableHead>IP 주소</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDateTime(log.createdAt)}
                    </TableCell>
                    <TableCell>
                      {log.userName}{' '}
                      <span className="font-mono text-xs text-muted-foreground">
                        ({log.employeeId})
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={ACTION_BADGE_COLORS[log.action]}
                      >
                        {ACTION_LABELS[log.action]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.target}
                      {log.targetId && (
                        <span className="ml-1 font-mono text-xs text-muted-foreground">
                          {log.targetId}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm">
                      {log.details}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.ipAddress}
                    </TableCell>
                  </TableRow>
                ))}
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

export default function AuditLogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">감사 로그</h1>
        <p className="text-muted-foreground">
          시스템 활동 이력을 조회합니다
        </p>
      </div>
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        }
      >
        <AuditLogContent />
      </Suspense>
    </div>
  );
}
