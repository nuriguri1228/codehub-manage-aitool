'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge, DataTable, SearchBar, Pagination, type Column } from '@/components/common';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth-store';
import { useApplications } from '@/hooks/use-application';
import { APPLICATION_STATUS_LABELS } from '@/lib/constants';
import type { Application, ApplicationStatus } from '@/types';

const columns: Column<Application>[] = [
  {
    key: 'applicationNumber',
    header: '신청번호',
    sortable: true,
    className: 'font-medium',
  },
  {
    key: 'aiToolName',
    header: 'AI 도구',
    sortable: true,
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
    sortable: true,
    render: (row) => new Date(row.createdAt).toLocaleDateString('ko-KR'),
  },
  {
    key: 'updatedAt',
    header: '최종 수정일',
    render: (row) => new Date(row.updatedAt).toLocaleDateString('ko-KR'),
  },
];

const STATUS_OPTIONS = Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function ApplicationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = useApplications({
    userId: user?.id,
    page,
    limit: 10,
    search,
    status: statusFilter || undefined,
    sortBy,
    sortOrder,
  });

  const applications = data?.data ?? [];
  const meta = data?.meta;

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">나의 신청 목록</h1>
          <p className="text-muted-foreground">AI 도구 사용 신청 현황을 확인하세요.</p>
        </div>
        <Button asChild>
          <Link href="/applications/new">
            <Plus className="mr-1.5 h-4 w-4" />
            새 신청하기
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="신청번호, AI 도구명 검색..."
          className="sm:max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={applications}
            keyField="id"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onRowClick={(row) => router.push(`/applications/${row.id}`)}
            emptyMessage="신청 내역이 없습니다."
            emptyAction={
              <Button variant="outline" size="sm" asChild>
                <Link href="/applications/new">첫 신청하기</Link>
              </Button>
            }
          />

          {meta && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
