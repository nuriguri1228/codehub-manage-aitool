'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { DepartmentBarChart } from '@/components/monitoring/department-bar-chart';
import { EnvironmentDonutChart } from '@/components/monitoring/environment-donut-chart';
import { LicenseTable } from '@/components/monitoring/license-table';
import { exportToCSV, exportToPDF } from '@/lib/export-utils';
import type { License } from '@/types';

// --- Mock Data ---
const mockDepartmentData = [
  { department: '플랫폼팀', count: 32, color: '#1E40AF' },
  { department: '데이터팀', count: 25, color: '#1E40AF' },
  { department: '웹개발팀', count: 22, color: '#7C3AED' },
  { department: '모바일팀', count: 18, color: '#7C3AED' },
  { department: 'QA팀', count: 16, color: '#1E40AF' },
  { department: '인프라팀', count: 14, color: '#7C3AED' },
];

const mockEnvironmentData = [
  { name: 'VDI', count: 72, color: '#1E40AF', percent: 57 },
  { name: 'Notebook', count: 37, color: '#7C3AED', percent: 29 },
  { name: '기타', count: 18, color: '#D97706', percent: 14 },
];

const mockLicenses: License[] = [
  {
    id: '1',
    licenseNumber: 'LIC-001',
    userId: 'u1',
    userName: '김개발',
    userDepartment: '플랫폼팀',
    aiToolId: 't1',
    aiToolName: 'Claude Code',
    environment: 'VDI',
    status: 'ACTIVE',
    issuedAt: '2026-02-05',
    expiresAt: '2026-08-05',
    quotaLimit: 100000,
    quotaUsed: 45000,
    usagePercent: 45,
  },
  {
    id: '2',
    licenseNumber: 'LIC-002',
    userId: 'u2',
    userName: '박프론트',
    userDepartment: '웹개발팀',
    aiToolId: 't2',
    aiToolName: 'Antigravity',
    environment: 'Notebook',
    status: 'ACTIVE',
    issuedAt: '2026-01-15',
    expiresAt: '2026-07-15',
    quotaLimit: 80000,
    quotaUsed: 60000,
    usagePercent: 75,
  },
  {
    id: '3',
    licenseNumber: 'LIC-003',
    userId: 'u3',
    userName: '최데이터',
    userDepartment: '데이터팀',
    aiToolId: 't1',
    aiToolName: 'Claude Code',
    environment: 'VDI',
    status: 'ACTIVE',
    issuedAt: '2026-01-20',
    expiresAt: '2026-07-20',
    quotaLimit: 120000,
    quotaUsed: 96000,
    usagePercent: 80,
  },
  {
    id: '4',
    licenseNumber: 'LIC-004',
    userId: 'u4',
    userName: '이모바일',
    userDepartment: '모바일팀',
    aiToolId: 't2',
    aiToolName: 'Antigravity',
    environment: 'Notebook',
    status: 'EXPIRED',
    issuedAt: '2025-08-10',
    expiresAt: '2026-02-10',
    quotaLimit: 80000,
    quotaUsed: 72000,
    usagePercent: 90,
  },
  {
    id: '5',
    licenseNumber: 'LIC-005',
    userId: 'u5',
    userName: '정데옵스',
    userDepartment: '인프라팀',
    aiToolId: 't1',
    aiToolName: 'Claude Code',
    environment: 'VDI',
    status: 'ACTIVE',
    issuedAt: '2026-02-01',
    expiresAt: '2026-08-01',
    quotaLimit: 100000,
    quotaUsed: 30000,
    usagePercent: 30,
  },
];

export default function LicensesPage() {
  const [toolFilter, setToolFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLicenses = mockLicenses.filter((lic) => {
    if (toolFilter !== 'all' && lic.aiToolName !== toolFilter) return false;
    if (deptFilter !== 'all' && lic.userDepartment !== deptFilter) return false;
    if (statusFilter !== 'all' && lic.status !== statusFilter) return false;
    return true;
  });

  const STATUS_MAP: Record<string, string> = {
    ACTIVE: '활성',
    EXPIRED: '만료',
    REVOKED: '해지',
    SUSPENDED: '정지',
  };

  const csvHeaders = [
    { key: 'licenseNumber', label: '라이센스 번호' },
    { key: 'userName', label: '사용자' },
    { key: 'userDepartment', label: '부서' },
    { key: 'aiToolName', label: 'AI 도구' },
    { key: 'environment', label: '환경' },
    { key: 'statusLabel', label: '상태' },
    { key: 'issuedAt', label: '발급일' },
    { key: 'expiresAt', label: '만료일' },
    { key: 'quotaUsed', label: '사용량' },
    { key: 'quotaLimit', label: '한도' },
    { key: 'usagePercent', label: '사용률(%)' },
  ];

  const handleExportCSV = () => {
    const rows = filteredLicenses.map((lic) => ({
      ...lic,
      statusLabel: STATUS_MAP[lic.status] ?? lic.status,
    }));
    exportToCSV(rows as unknown as Record<string, unknown>[], '라이센스_현황', csvHeaders);
    toast.success('CSV 파일이 다운로드되었습니다.');
  };

  const handleExportPDF = () => {
    exportToPDF();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <h1 className="text-2xl font-bold tracking-tight">라이센스 발급 현황</h1>

      {/* Filter Bar */}
      <Card className="py-3">
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">도구:</span>
            <Select value={toolFilter} onValueChange={setToolFilter}>
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="Claude Code">Claude Code</SelectItem>
                <SelectItem value="Antigravity">Antigravity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">부서:</span>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="플랫폼팀">플랫폼팀</SelectItem>
                <SelectItem value="데이터팀">데이터팀</SelectItem>
                <SelectItem value="웹개발팀">웹개발팀</SelectItem>
                <SelectItem value="모바일팀">모바일팀</SelectItem>
                <SelectItem value="QA팀">QA팀</SelectItem>
                <SelectItem value="인프라팀">인프라팀</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">상태:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="ACTIVE">활성</SelectItem>
                <SelectItem value="EXPIRED">만료</SelectItem>
                <SelectItem value="REVOKED">해지</SelectItem>
                <SelectItem value="SUSPENDED">정지</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-1 h-3.5 w-3.5" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-1 h-3.5 w-3.5" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="mr-1 h-3.5 w-3.5" />
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <DepartmentBarChart data={mockDepartmentData} />
        <EnvironmentDonutChart data={mockEnvironmentData} total={127} />
      </div>

      {/* License Table */}
      <Card>
        <CardContent>
          <LicenseTable data={filteredLicenses} total={127} />
        </CardContent>
      </Card>
    </div>
  );
}
