'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  BadgeCheck,
  Clock,
  CheckCircle,
  Key,
  Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge, DataTable, type Column } from '@/components/common';
import { useAuthStore } from '@/stores/auth-store';
import { useApplications, useApplicationStats } from '@/hooks/use-application';
import { useApiKeys } from '@/hooks/use-api-key';
import { toast } from 'sonner';
import type { Application } from '@/types';

const recentColumns: Column<Application>[] = [
  {
    key: 'applicationNumber',
    header: '신청번호',
    className: 'font-medium',
  },
  {
    key: 'aiToolNames',
    header: 'AI 도구',
    render: (row) => row.aiToolNames.join(', '),
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

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const userId = user?.id ?? '';

  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('010-1234-5678');

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

  const handleSaveContact = () => {
    updateUser({ email });
    toast.success('연락처 정보가 저장되었습니다.');
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">마이페이지</h1>
        <p className="text-muted-foreground">
          내 프로필 정보와 활동 내역을 확인하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">프로필 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-[#50CF94]/15 text-2xl text-[#3DAF7A]">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-lg font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {user.department} / {user.position}
                </p>
              </div>
            </div>

            {/* HR Info (read-only) */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border bg-gray-50 px-3 py-2.5">
                <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">사번</p>
                  <p className="text-sm font-medium">{user.employeeId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-gray-50 px-3 py-2.5">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">이름</p>
                  <p className="text-sm font-medium">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-gray-50 px-3 py-2.5">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">부서</p>
                  <p className="text-sm font-medium">{user.department}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                * 사번, 이름, 부서, 직급은 HR 연동 항목으로 수정할 수 없습니다.
              </p>
            </div>

            {/* Editable Contact Info */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-medium">연락처 정보</h4>
              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center gap-1.5 text-xs">
                  <Mail className="h-3.5 w-3.5" />
                  이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs">
                  <Phone className="h-3.5 w-3.5" />
                  연락처
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button size="sm" className="w-full" onClick={handleSaveContact}>
                <Save className="mr-1.5 h-4 w-4" />
                연락처 저장
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Activity Summary Cards */}
          {statsLoading || keysLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="gap-4 py-4">
                  <CardContent>
                    <Skeleton className="mb-2 h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="gap-4 py-4">
                <CardContent className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">진행 중 신청</p>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-amber-600">
                        {stats?.inReview ?? 0}
                      </span>
                      <span className="text-sm text-muted-foreground">건</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card className="gap-4 py-4">
                <CardContent className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">승인 완료</p>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-emerald-600">
                        {stats?.approved ?? 0}
                      </span>
                      <span className="text-sm text-muted-foreground">건</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card className="gap-4 py-4">
                <CardContent className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">보유 API Key</p>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-purple-600">
                        {activeKeys.length}
                      </span>
                      <span className="text-sm text-muted-foreground">개</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <Key className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">최근 신청 이력</CardTitle>
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
                  emptyMessage="신청 내역이 없습니다."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
