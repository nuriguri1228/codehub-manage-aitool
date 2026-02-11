'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/footer';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { useAuthStore } from '@/stores/auth-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white via-[#F8FDF9] to-[#50CF94]/5">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <MobileSidebar />
        <main className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-6">
            <Breadcrumb />
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
