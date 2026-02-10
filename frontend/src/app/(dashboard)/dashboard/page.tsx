'use client';

import { useAuthStore } from '@/stores/auth-store';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
      <p className="mt-2 text-sm text-gray-500">
        환영합니다, {user?.name}님. ({user?.role})
      </p>
    </div>
  );
}
