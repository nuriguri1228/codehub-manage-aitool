'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import type { User, UserRole } from '@/types';

// --- Inline Mock Data ---
const mockUsers: User[] = [
  {
    id: 'user-001',
    employeeId: 'EMP2024001',
    name: '김개발',
    email: 'kimdev@company.com',
    department: '플랫폼개발팀',
    position: '선임',
    role: 'APPLICANT',
    isActive: true,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z',
  },
  {
    id: 'user-002',
    employeeId: 'EMP2024002',
    name: '이프론트',
    email: 'leefront@company.com',
    department: '플랫폼개발팀',
    position: '책임',
    role: 'APPLICANT',
    isActive: true,
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z',
  },
  {
    id: 'user-003',
    employeeId: 'EMP2024003',
    name: '박팀장',
    email: 'parkteam@company.com',
    department: '플랫폼개발팀',
    position: '팀장',
    role: 'TEAM_LEAD',
    isActive: true,
    createdAt: '2023-06-01T09:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z',
  },
  {
    id: 'user-004',
    employeeId: 'EMP2024004',
    name: '최보안',
    email: 'choisec@company.com',
    department: '보안팀',
    position: '책임',
    role: 'SECURITY_REVIEWER',
    isActive: true,
    createdAt: '2023-03-15T09:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z',
  },
  {
    id: 'user-005',
    employeeId: 'EMP2024005',
    name: '정관리',
    email: 'jungadmin@company.com',
    department: 'IT운영팀',
    position: '책임',
    role: 'IT_ADMIN',
    isActive: true,
    createdAt: '2023-01-10T09:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z',
  },
  {
    id: 'user-006',
    employeeId: 'EMP2024006',
    name: '한시스템',
    email: 'hansys@company.com',
    department: 'IT운영팀',
    position: '팀장',
    role: 'SYSTEM_ADMIN',
    isActive: true,
    createdAt: '2022-06-01T09:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z',
  },
  {
    id: 'user-007',
    employeeId: 'EMP2024007',
    name: '오백엔드',
    email: 'ohback@company.com',
    department: '서비스개발팀',
    position: '선임',
    role: 'APPLICANT',
    isActive: true,
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z',
  },
  {
    id: 'user-008',
    employeeId: 'EMP2024008',
    name: '유데이터',
    email: 'yudata@company.com',
    department: '데이터팀',
    position: '선임',
    role: 'APPLICANT',
    isActive: false,
    createdAt: '2024-04-01T09:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z',
  },
  {
    id: 'user-009',
    employeeId: 'EMP2024009',
    name: '강팀장',
    email: 'kangteam@company.com',
    department: '서비스개발팀',
    position: '팀장',
    role: 'TEAM_LEAD',
    isActive: true,
    createdAt: '2023-05-01T09:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z',
  },
  {
    id: 'user-010',
    employeeId: 'EMP2024010',
    name: '송보안',
    email: 'songsec@company.com',
    department: '보안팀',
    position: '선임',
    role: 'SECURITY_REVIEWER',
    isActive: true,
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z',
  },
];

const ROLE_CONFIG: Record<UserRole, { label: string; className: string }> = {
  APPLICANT: { label: '신청자', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  TEAM_LEAD: { label: '팀장', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  SECURITY_REVIEWER: { label: '보안 검토자', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  IT_ADMIN: { label: 'IT 관리자', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  SYSTEM_ADMIN: { label: '시스템 관리자', className: 'bg-red-50 text-red-700 border-red-200' },
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const departments = Array.from(new Set(mockUsers.map((u) => u.department)));

  const filtered = users.filter((u) => {
    if (deptFilter !== 'all' && u.department !== deptFilter) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.employeeId.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">사용자 관리</h1>
        <p className="text-muted-foreground">
          시스템 사용자를 조회하고 역할을 관리하세요
        </p>
      </div>

      {/* Filters */}
      <Card className="py-3">
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="이름, 사번, 이메일 검색..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">부서:</span>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">역할:</span>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">사용자 목록</CardTitle>
          <span className="text-sm text-muted-foreground">
            총 {filtered.length}명
          </span>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>이름</TableHead>
                <TableHead>사번</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>부서</TableHead>
                <TableHead>직급</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const roleConfig = ROLE_CONFIG[user.role];
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {user.employeeId}
                    </TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{user.position}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(v) =>
                          handleRoleChange(user.id, v as UserRole)
                        }
                      >
                        <SelectTrigger className="h-7 w-[140px]">
                          <Badge
                            variant="outline"
                            className={roleConfig.className}
                          >
                            {roleConfig.label}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                            <SelectItem key={key} value={key}>
                              {cfg.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                        }
                      >
                        {user.isActive ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
