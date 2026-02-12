'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Search,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockApplicationApi } from '@/lib/mock-api';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  REVIEW_STAGES,
} from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { ApplicationStatus } from '@/types';

const PIPELINE_STAGES: { key: ApplicationStatus; label: string; color: string }[] = [
  { key: 'SUBMITTED', label: '제출완료', color: 'bg-emerald-500' },
  { key: 'TEAM_REVIEW', label: '팀장 검토', color: 'bg-indigo-500' },
  { key: 'SECURITY_REVIEW', label: '보안 검토', color: 'bg-purple-500' },
  { key: 'ENV_PREPARATION', label: '환경 준비', color: 'bg-yellow-500' },
  { key: 'LICENSE_ISSUANCE', label: '라이센스 발급', color: 'bg-orange-500' },
  { key: 'APPROVED', label: '승인 완료', color: 'bg-[#50CF94]' },
  { key: 'KEY_ISSUED', label: '발급 완료', color: 'bg-[#3DAF7A]' },
];

export default function AdminApplicationsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications', search, statusFilter, page],
    queryFn: () =>
      mockApplicationApi.getApplications({
        page,
        limit: 15,
        search: search || undefined,
        status: statusFilter !== 'all' ? (statusFilter as ApplicationStatus) : undefined,
      }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['admin-application-stats'],
    queryFn: () => mockApplicationApi.getApplicationStats(),
  });

  // 파이프라인뷰를 위해 전체 데이터를 가져옴
  const { data: allData } = useQuery({
    queryKey: ['admin-applications-all'],
    queryFn: () =>
      mockApplicationApi.getApplications({ page: 1, limit: 100 }),
  });

  const stats = statsData?.data;
  const applications = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const allApplications = allData?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">전체 신청 현황</h1>
        <p className="mt-1 text-sm text-gray-500">
          모든 신청자의 프로세스 진행 상태를 관리합니다.
        </p>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid gap-3 md:grid-cols-6">
          {[
            { label: '전체', value: stats.total, color: 'text-gray-900' },
            { label: '임시저장', value: stats.draft, color: 'text-gray-500' },
            { label: '검토중', value: stats.inReview, color: 'text-blue-600' },
            { label: '승인', value: stats.approved, color: 'text-emerald-600' },
            { label: '반려', value: stats.rejected, color: 'text-red-600' },
            { label: '발급완료', value: stats.keyIssued, color: 'text-[#3DAF7A]' },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">목록 뷰</TabsTrigger>
          <TabsTrigger value="pipeline">파이프라인 뷰</TabsTrigger>
        </TabsList>

        {/* 목록 뷰 */}
        <TabsContent value="list" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="신청번호, 도구명, 신청자 검색..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                {Object.entries(APPLICATION_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 text-left text-gray-500">
                        <th className="px-4 py-3 font-medium">신청번호</th>
                        <th className="px-4 py-3 font-medium">신청자</th>
                        <th className="px-4 py-3 font-medium">부서</th>
                        <th className="px-4 py-3 font-medium">AI 도구</th>
                        <th className="px-4 py-3 font-medium">상태</th>
                        <th className="px-4 py-3 font-medium">신청일</th>
                        <th className="px-4 py-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{app.applicationNumber}</td>
                          <td className="px-4 py-3">{app.applicantName}</td>
                          <td className="px-4 py-3 text-gray-500">{app.applicantDepartment}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {app.aiToolNames.map((name) => (
                                <Badge key={name} variant="outline" className="text-xs">
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={cn('text-xs', APPLICATION_STATUS_COLORS[app.status])}>
                              {APPLICATION_STATUS_LABELS[app.status]}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(app.createdAt).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/applications/${app.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="mr-1 h-3.5 w-3.5" />
                                상세
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {applications.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-400">
                            조건에 맞는 신청이 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                이전
              </Button>
              <span className="flex items-center text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </Button>
            </div>
          )}
        </TabsContent>

        {/* 파이프라인 뷰 */}
        <TabsContent value="pipeline" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-7">
            {PIPELINE_STAGES.map((stage) => {
              const stageApps = allApplications.filter(
                (a) => a.status === stage.key
              );
              return (
                <div key={stage.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('h-2.5 w-2.5 rounded-full', stage.color)} />
                    <h3 className="text-xs font-semibold text-gray-600">
                      {stage.label}
                    </h3>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {stageApps.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {stageApps.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-3 text-center text-xs text-gray-400">
                        없음
                      </div>
                    ) : (
                      stageApps.map((app) => (
                        <Link
                          key={app.id}
                          href={`/applications/${app.id}`}
                          className="block"
                        >
                          <Card className="cursor-pointer transition-shadow hover:shadow-md">
                            <CardContent className="p-3">
                              <p className="text-xs font-medium text-gray-900 truncate">
                                {app.applicantName}
                              </p>
                              <p className="mt-0.5 text-[11px] text-gray-500 truncate">
                                {app.aiToolNames.join(', ')}
                              </p>
                              <p className="mt-1 text-[10px] text-gray-400">
                                {app.applicationNumber}
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* REJECTED / FEEDBACK 별도 표시 */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {[
              { key: 'FEEDBACK_REQUESTED' as ApplicationStatus, label: '피드백 요청', color: 'text-amber-600' },
              { key: 'REJECTED' as ApplicationStatus, label: '반려', color: 'text-red-600' },
            ].map((extra) => {
              const apps = allApplications.filter((a) => a.status === extra.key);
              return (
                <Card key={extra.key}>
                  <CardHeader className="pb-2">
                    <CardTitle className={cn('text-sm', extra.color)}>
                      {extra.label} ({apps.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {apps.length === 0 ? (
                      <p className="py-2 text-xs text-gray-400">없음</p>
                    ) : (
                      <div className="space-y-2">
                        {apps.map((app) => (
                          <Link
                            key={app.id}
                            href={`/applications/${app.id}`}
                            className="flex items-center justify-between rounded-lg border p-2 text-sm hover:bg-gray-50"
                          >
                            <div>
                              <span className="font-medium">{app.applicantName}</span>
                              <span className="ml-2 text-gray-500">{app.aiToolNames.join(', ')}</span>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
