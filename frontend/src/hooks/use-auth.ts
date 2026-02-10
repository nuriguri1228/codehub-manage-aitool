'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import type { User, UserRole } from '@/types';

const MOCK_USERS: Record<UserRole, User> = {
  APPLICANT: {
    id: 'user-1',
    employeeId: 'EMP001',
    name: '김개발',
    email: 'kim.dev@codehub.com',
    department: '플랫폼개발팀',
    position: '선임',
    role: 'APPLICANT',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  TEAM_LEAD: {
    id: 'user-2',
    employeeId: 'EMP002',
    name: '이팀장',
    email: 'lee.lead@codehub.com',
    department: '플랫폼개발팀',
    position: '팀장',
    role: 'TEAM_LEAD',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  SECURITY_REVIEWER: {
    id: 'user-3',
    employeeId: 'EMP003',
    name: '박보안',
    email: 'park.sec@codehub.com',
    department: '정보보안팀',
    position: '담당자',
    role: 'SECURITY_REVIEWER',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  IT_ADMIN: {
    id: 'user-4',
    employeeId: 'EMP004',
    name: '최관리',
    email: 'choi.admin@codehub.com',
    department: 'IT인프라팀',
    position: '관리자',
    role: 'IT_ADMIN',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  SYSTEM_ADMIN: {
    id: 'user-5',
    employeeId: 'EMP005',
    name: '정시스',
    email: 'jeong.sys@codehub.com',
    department: 'IT인프라팀',
    position: '시니어 관리자',
    role: 'SYSTEM_ADMIN',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
};

const ROLE_LABELS: Record<UserRole, string> = {
  APPLICANT: '신청자',
  TEAM_LEAD: '팀장 (검토자)',
  SECURITY_REVIEWER: '보안 검토자',
  IT_ADMIN: 'IT 관리자',
  SYSTEM_ADMIN: '시스템 관리자',
};

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();

  const loginWithRole = (role: UserRole) => {
    const mockUser = MOCK_USERS[role];
    const mockToken = `mock-token-${role}-${Date.now()}`;
    setAuth(mockUser, mockToken);
    router.push('/dashboard');
  };

  const logout = () => {
    storeLogout();
    router.push('/login');
  };

  return {
    user,
    isAuthenticated,
    loginWithRole,
    logout,
    mockUsers: MOCK_USERS,
    roleLabels: ROLE_LABELS,
  };
}
