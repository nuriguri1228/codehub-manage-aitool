'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Key,
  ClipboardCheck,
  History,
  Shield,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ScrollText,
  Code2,
  Monitor,
  Users,
  DollarSign,
  ListChecks,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';
import type { LucideIcon } from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

function getSidebarItems(role: UserRole): SidebarItem[] {
  switch (role) {
    case 'APPLICANT':
      return [
        { label: '대시보드', href: '/dashboard', icon: LayoutDashboard },
        { label: '신규 신청', href: '/applications/new', icon: FilePlus },
        { label: '내 신청', href: '/applications', icon: FileText },
        { label: 'API Key 관리', href: '/api-keys', icon: Key },
      ];
    case 'TEAM_LEAD':
    case 'SECURITY_REVIEWER':
      return [
        { label: '대시보드', href: '/dashboard', icon: LayoutDashboard },
        { label: '검토 목록', href: '/reviews', icon: ClipboardCheck },
        { label: '검토 이력', href: '/reviews/history', icon: History },
      ];
    case 'IT_ADMIN':
      return [
        { label: '대시보드', href: '/dashboard', icon: LayoutDashboard },
        { label: '검토 목록', href: '/reviews', icon: ClipboardCheck },
        { label: '검토 이력', href: '/reviews/history', icon: History },
        { label: '환경 관리', href: '/admin/environments', icon: Monitor },
      ];
    case 'SYSTEM_ADMIN':
      return [
        { label: '대시보드', href: '/dashboard', icon: LayoutDashboard },
        { label: '전체 신청 현황', href: '/admin/applications', icon: ListChecks },
        { label: '검토 목록', href: '/reviews', icon: ClipboardCheck },
        { label: '검토 이력', href: '/reviews/history', icon: History },
        { label: '라이센스 관리', href: '/monitoring/licenses', icon: Shield },
        { label: '사용 현황', href: '/monitoring/usage', icon: BarChart3 },
        { label: '비용 관리', href: '/monitoring/costs', icon: DollarSign },
        { label: '도구 관리', href: '/admin/tools', icon: Wrench },
        { label: '사용자 관리', href: '/admin/users', icon: Users },
        { label: '시스템 설정', href: '/admin/settings', icon: Settings },
        { label: '감사 로그', href: '/admin/audit', icon: ScrollText },
      ];
    default:
      return [
        { label: '대시보드', href: '/dashboard', icon: LayoutDashboard },
      ];
  }
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  if (!user) return null;

  const items = getSidebarItems(user.role);

  return (
    <aside
      className={cn(
        'hidden border-r bg-white transition-all duration-300 lg:flex lg:flex-col',
        sidebarOpen ? 'w-60' : 'w-16'
      )}
    >
      <nav className="flex-1 space-y-1 p-2">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#50CF94]/10 text-[#3DAF7A]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-[#3DAF7A]')} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );

          if (!sidebarOpen) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{linkContent}</div>;
        })}
      </nav>

      {/* Dev link */}
      <div className="border-t p-2">
        {(() => {
          const isDevActive = pathname.startsWith('/dev');
          const devLink = (
            <Link
              href="/dev/status"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                isDevActive
                  ? 'bg-[#50CF94]/10 text-[#3DAF7A]'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              )}
            >
              <Code2 className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>구현 현황</span>}
            </Link>
          );
          if (!sidebarOpen) {
            return (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>{devLink}</TooltipTrigger>
                <TooltipContent side="right">구현 현황</TooltipContent>
              </Tooltip>
            );
          }
          return devLink;
        })()}
      </div>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  if (!user) return null;

  const items = getSidebarItems(user.role);

  return (
    <>
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-white transition-transform duration-300 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#50CF94]">
            <span className="text-sm font-bold text-white">C</span>
          </div>
          <span className="ml-2 text-sm font-bold text-gray-900">
            CodeHub
          </span>
        </div>

        <nav className="space-y-1 p-2">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#50CF94]/10 text-[#3DAF7A]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
