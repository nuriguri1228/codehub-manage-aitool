'use client';

import { useAuthStore } from '@/stores/auth-store';
import ApplicantDashboard from '@/components/application/applicant-dashboard';
import ReviewerDashboard from '@/components/review/reviewer-dashboard';
import { AdminDashboard } from '@/components/monitoring/admin-dashboard';
import { ItAdminDashboard } from '@/components/monitoring/it-admin-dashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();

  switch (user?.role) {
    case 'APPLICANT':
      return <ApplicantDashboard />;
    case 'TEAM_LEAD':
    case 'SECURITY_REVIEWER':
      return <ReviewerDashboard />;
    case 'IT_ADMIN':
      return <ItAdminDashboard />;
    case 'SYSTEM_ADMIN':
      return <AdminDashboard />;
    default:
      return <ApplicantDashboard />;
  }
}
