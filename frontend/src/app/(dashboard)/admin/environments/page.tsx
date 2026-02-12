'use client';

import { useState } from 'react';
import {
  Server,
  Laptop,
  Search,
  Monitor,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// --- Mock Data ---
type EnvType = 'VDI' | 'NOTEBOOK';
type EnvStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

interface EnvironmentItem {
  id: string;
  type: EnvType;
  assetId: string;
  assignedUser: string | null;
  department: string | null;
  status: EnvStatus;
  toolName: string | null;
  specs: string;
  provisionedAt: string | null;
}

const mockEnvironments: EnvironmentItem[] = [
  { id: 'env-001', type: 'VDI', assetId: 'VDI-2024-001', assignedUser: '김개발', department: '플랫폼개발팀', status: 'ACTIVE', toolName: 'Claude Code', specs: '8Core / 32GB / 256GB SSD', provisionedAt: '2024-10-01' },
  { id: 'env-002', type: 'VDI', assetId: 'VDI-2024-002', assignedUser: '박프론트', department: '서비스개발팀', status: 'ACTIVE', toolName: 'Claude Code', specs: '8Core / 32GB / 256GB SSD', provisionedAt: '2024-10-05' },
  { id: 'env-003', type: 'VDI', assetId: 'VDI-2024-003', assignedUser: '이모바일', department: 'AI연구팀', status: 'ACTIVE', toolName: 'Antigravity', specs: '16Core / 64GB / 512GB SSD', provisionedAt: '2024-11-12' },
  { id: 'env-004', type: 'VDI', assetId: 'VDI-2024-004', assignedUser: null, department: null, status: 'INACTIVE', toolName: null, specs: '8Core / 32GB / 256GB SSD', provisionedAt: null },
  { id: 'env-005', type: 'VDI', assetId: 'VDI-2024-005', assignedUser: null, department: null, status: 'MAINTENANCE', toolName: null, specs: '8Core / 32GB / 256GB SSD', provisionedAt: null },
  { id: 'env-006', type: 'NOTEBOOK', assetId: 'NB-2024-001', assignedUser: '김개발', department: '플랫폼개발팀', status: 'ACTIVE', toolName: 'Claude Code', specs: 'MacBook Pro M3 / 36GB', provisionedAt: '2024-09-15' },
  { id: 'env-007', type: 'NOTEBOOK', assetId: 'NB-2024-002', assignedUser: '오백엔드', department: '서비스개발팀', status: 'ACTIVE', toolName: 'Antigravity', specs: 'ThinkPad X1 / 32GB', provisionedAt: '2024-10-20' },
  { id: 'env-008', type: 'NOTEBOOK', assetId: 'NB-2024-003', assignedUser: '정데옵스', department: 'IT운영팀', status: 'ACTIVE', toolName: 'Claude Code', specs: 'MacBook Pro M3 / 36GB', provisionedAt: '2024-11-01' },
  { id: 'env-009', type: 'NOTEBOOK', assetId: 'NB-2024-004', assignedUser: null, department: null, status: 'INACTIVE', toolName: null, specs: 'ThinkPad X1 / 32GB', provisionedAt: null },
];

interface ProvisionLog {
  id: string;
  envAssetId: string;
  envType: EnvType;
  action: 'PROVISION' | 'DEPROVISION' | 'MAINTENANCE';
  userName: string;
  performedBy: string;
  performedAt: string;
  note: string;
}

const mockProvisionLogs: ProvisionLog[] = [
  { id: 'log-1', envAssetId: 'VDI-2024-003', envType: 'VDI', action: 'PROVISION', userName: '이모바일', performedBy: '정관리', performedAt: '2024-11-12 14:30', note: 'Antigravity 환경 구성 완료' },
  { id: 'log-2', envAssetId: 'NB-2024-003', envType: 'NOTEBOOK', action: 'PROVISION', userName: '정데옵스', performedBy: '정관리', performedAt: '2024-11-01 10:15', note: 'Claude Code CLI 설치 완료' },
  { id: 'log-3', envAssetId: 'VDI-2024-005', envType: 'VDI', action: 'MAINTENANCE', userName: '-', performedBy: '정관리', performedAt: '2024-10-28 09:00', note: 'OS 업데이트 및 보안 패치' },
  { id: 'log-4', envAssetId: 'VDI-2024-002', envType: 'VDI', action: 'PROVISION', userName: '박프론트', performedBy: '정관리', performedAt: '2024-10-05 11:00', note: 'Claude Code 환경 구성' },
  { id: 'log-5', envAssetId: 'VDI-2024-001', envType: 'VDI', action: 'PROVISION', userName: '김개발', performedBy: '정관리', performedAt: '2024-10-01 15:20', note: 'Claude Code 환경 구성' },
];

const statusConfig: Record<EnvStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  ACTIVE: { label: '사용중', variant: 'default' },
  INACTIVE: { label: '미사용', variant: 'secondary' },
  MAINTENANCE: { label: '점검중', variant: 'destructive' },
};

const actionLabels: Record<ProvisionLog['action'], string> = {
  PROVISION: '환경 구성',
  DEPROVISION: '환경 해제',
  MAINTENANCE: '점검/업데이트',
};

export default function EnvironmentManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const vdiCount = mockEnvironments.filter((e) => e.type === 'VDI');
  const nbCount = mockEnvironments.filter((e) => e.type === 'NOTEBOOK');

  const filtered = mockEnvironments.filter((env) => {
    const matchSearch =
      !searchTerm ||
      env.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.assignedUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'all' || env.type === typeFilter;
    const matchStatus = statusFilter === 'all' || env.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">환경 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          VDI 및 Notebook 개발환경 현황 관리
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Server className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">VDI</p>
              <p className="text-xl font-bold">{vdiCount.filter((e) => e.status === 'ACTIVE').length}<span className="text-sm font-normal text-gray-400">/{vdiCount.length}</span></p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Laptop className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Notebook</p>
              <p className="text-xl font-bold">{nbCount.filter((e) => e.status === 'ACTIVE').length}<span className="text-sm font-normal text-gray-400">/{nbCount.length}</span></p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Monitor className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-sm text-gray-500">전체 활성</p>
              <p className="text-xl font-bold">{mockEnvironments.filter((e) => e.status === 'ACTIVE').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Monitor className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-sm text-gray-500">미사용/점검</p>
              <p className="text-xl font-bold">{mockEnvironments.filter((e) => e.status !== 'ACTIVE').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">환경 목록</TabsTrigger>
          <TabsTrigger value="logs">프로비저닝 이력</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="자산번호, 사용자, 부서 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="환경 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 유형</SelectItem>
                <SelectItem value="VDI">VDI</SelectItem>
                <SelectItem value="NOTEBOOK">Notebook</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="ACTIVE">사용중</SelectItem>
                <SelectItem value="INACTIVE">미사용</SelectItem>
                <SelectItem value="MAINTENANCE">점검중</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-gray-500">
                      <th className="px-4 py-3 font-medium">자산번호</th>
                      <th className="px-4 py-3 font-medium">유형</th>
                      <th className="px-4 py-3 font-medium">스펙</th>
                      <th className="px-4 py-3 font-medium">사용자</th>
                      <th className="px-4 py-3 font-medium">부서</th>
                      <th className="px-4 py-3 font-medium">AI 도구</th>
                      <th className="px-4 py-3 font-medium">상태</th>
                      <th className="px-4 py-3 font-medium">구성일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((env) => (
                      <tr key={env.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{env.assetId}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1">
                            {env.type === 'VDI' ? (
                              <Server className="h-3.5 w-3.5 text-blue-500" />
                            ) : (
                              <Laptop className="h-3.5 w-3.5 text-purple-500" />
                            )}
                            {env.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{env.specs}</td>
                        <td className="px-4 py-3">{env.assignedUser ?? <span className="text-gray-400">-</span>}</td>
                        <td className="px-4 py-3">{env.department ?? <span className="text-gray-400">-</span>}</td>
                        <td className="px-4 py-3">{env.toolName ?? <span className="text-gray-400">-</span>}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusConfig[env.status].variant}>
                            {statusConfig[env.status].label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{env.provisionedAt ?? '-'}</td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-400">
                          조건에 맞는 환경이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">프로비저닝 이력</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-gray-500">
                      <th className="px-4 py-3 font-medium">일시</th>
                      <th className="px-4 py-3 font-medium">자산번호</th>
                      <th className="px-4 py-3 font-medium">유형</th>
                      <th className="px-4 py-3 font-medium">작업</th>
                      <th className="px-4 py-3 font-medium">대상 사용자</th>
                      <th className="px-4 py-3 font-medium">처리자</th>
                      <th className="px-4 py-3 font-medium">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockProvisionLogs.map((log) => (
                      <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500">{log.performedAt}</td>
                        <td className="px-4 py-3 font-medium">{log.envAssetId}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1">
                            {log.envType === 'VDI' ? (
                              <Server className="h-3.5 w-3.5 text-blue-500" />
                            ) : (
                              <Laptop className="h-3.5 w-3.5 text-purple-500" />
                            )}
                            {log.envType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{actionLabels[log.action]}</Badge>
                        </td>
                        <td className="px-4 py-3">{log.userName}</td>
                        <td className="px-4 py-3">{log.performedBy}</td>
                        <td className="px-4 py-3 text-gray-500">{log.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
