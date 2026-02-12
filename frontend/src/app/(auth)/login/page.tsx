'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';
import { useEffect } from 'react';

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'APPLICANT', label: '신청자', description: '개발자 - AI 도구 신청' },
  { value: 'TEAM_LEAD', label: '팀장', description: '검토자 - 팀원 신청 검토' },
  {
    value: 'SECURITY_REVIEWER',
    label: '보안 검토자',
    description: '보안팀 - 보안 검토',
  },
  { value: 'IT_ADMIN', label: 'IT 관리자', description: '인프라팀 - 환경 준비' },
  {
    value: 'LICENSE_MANAGER',
    label: '라이센스 관리자',
    description: '라이센스 발급 및 API Key 관리',
  },
  {
    value: 'SYSTEM_ADMIN',
    label: '시스템 관리자',
    description: '전체 시스템 관리',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { loginWithRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('APPLICANT');

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLogin = () => {
    loginWithRole(selectedRole);
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <div className="p-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#50CF94]">
            <span className="text-2xl font-bold text-white">C</span>
          </div>
          <h1 className="mt-4 text-xl font-bold text-gray-900">
            CodeHub AI Tool Manager
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            외부 AI 코딩 도구 통합 관리 플랫폼
          </p>
        </div>

        {/* SSO Button */}
        <Button
          className="mt-8 w-full bg-[#50CF94] hover:bg-[#50CF94]/90"
          size="lg"
          onClick={handleLogin}
        >
          사내 통합인증(SSO)으로 로그인
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400">
            개발 모드
          </span>
        </div>

        {/* Mock role selection */}
        <p className="mb-3 text-center text-xs text-gray-500">
          역할을 선택하여 로그인할 수 있습니다
        </p>
        <div className="space-y-2">
          {ROLES.map((role) => (
            <button
              key={role.value}
              type="button"
              className={cn(
                'flex w-full items-center rounded-lg border px-4 py-3 text-left transition-colors',
                selectedRole === role.value
                  ? 'border-[#50CF94] bg-[#50CF94]/10'
                  : 'border-gray-200 hover:bg-gray-50'
              )}
              onClick={() => setSelectedRole(role.value)}
            >
              <div
                className={cn(
                  'mr-3 flex h-4 w-4 items-center justify-center rounded-full border-2',
                  selectedRole === role.value
                    ? 'border-[#50CF94]'
                    : 'border-gray-300'
                )}
              >
                {selectedRole === role.value && (
                  <div className="h-2 w-2 rounded-full bg-[#50CF94]" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {role.label}
                </p>
                <p className="text-xs text-gray-500">{role.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Info */}
        <p className="mt-6 text-center text-xs text-gray-400">
          사내 임직원만 이용 가능합니다
        </p>

        {/* Help links */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs">
          <a href="/help" className="text-[#50CF94] hover:underline">
            이용 안내
          </a>
          <span className="text-gray-300">|</span>
          <a href="/contact" className="text-[#50CF94] hover:underline">
            문의하기
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 px-8 py-3 text-center">
        <p className="text-xs text-gray-400">
          &copy; 2026 CodeHub. All rights reserved.
        </p>
      </div>
    </Card>
  );
}
