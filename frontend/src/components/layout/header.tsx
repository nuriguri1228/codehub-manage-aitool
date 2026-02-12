'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import { useUIStore } from '@/stores/ui-store';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

interface NavItem {
  label: string;
  href: string;
}

function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case 'APPLICANT':
      return [
        { label: '대시보드', href: '/dashboard' },
        { label: '신규 신청', href: '/applications/new' },
        { label: '내 신청', href: '/applications' },
        { label: 'API Key', href: '/api-keys' },
      ];
    case 'TEAM_LEAD':
    case 'SECURITY_REVIEWER':
      return [
        { label: '대시보드', href: '/dashboard' },
        { label: '검토 목록', href: '/reviews' },
        { label: '검토 이력', href: '/reviews/history' },
      ];
    case 'IT_ADMIN':
      return [
        { label: '대시보드', href: '/dashboard' },
        { label: '검토 목록', href: '/reviews' },
        { label: '환경 관리', href: '/admin/environments' },
      ];
    case 'LICENSE_MANAGER':
      return [
        { label: '대시보드', href: '/dashboard' },
        { label: '검토 목록', href: '/reviews' },
        { label: '라이센스', href: '/monitoring/licenses' },
      ];
    case 'SYSTEM_ADMIN':
      return [
        { label: '대시보드', href: '/dashboard' },
        { label: '라이센스', href: '/monitoring/licenses' },
        { label: '모니터링', href: '/monitoring/usage' },
        { label: '설정', href: '/admin/tools' },
      ];
    default:
      return [{ label: '대시보드', href: '/dashboard' }];
  }
}

function NotificationPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationStore();

  return (
    <div className="w-80">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">알림</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-[#50CF94] hover:text-[#3DAF7A]"
            onClick={markAllAsRead}
          >
            모두 읽음
          </Button>
        )}
      </div>
      <ScrollArea className="max-h-80">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            알림이 없습니다
          </div>
        ) : (
          <div className="divide-y">
            {notifications.slice(0, 10).map((notification) => (
              <button
                key={notification.id}
                className={cn(
                  'w-full px-4 py-3 text-left transition-colors hover:bg-gray-50',
                  !notification.read && 'bg-[#50CF94]/10'
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {notification.message}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {notification.createdAt}
                </p>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { toggleSidebar } = useUIStore();

  const navItems = user ? getNavItems(user.role) : [];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 shadow-sm backdrop-blur-md">
      <div className="flex h-14 items-center px-4 lg:px-6">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="mr-2 lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#50CF94]">
            <span className="text-sm font-bold text-white">C</span>
          </div>
          <span className="hidden text-sm font-bold text-gray-900 md:inline-block">
            {APP_NAME}
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="ml-8 hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-[#50CF94]'
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                {item.label}
                {isActive && (
                  <div className="mx-auto mt-0.5 h-0.5 w-full rounded-full bg-[#50CF94]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5 text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <SheetHeader className="border-b px-4 py-3">
                <SheetTitle>알림</SheetTitle>
              </SheetHeader>
              <NotificationPanel />
            </SheetContent>
          </Sheet>

          {/* User menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Avatar size="sm">
                    <AvatarFallback className="bg-[#50CF94]/15 text-xs text-[#3DAF7A]">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium text-gray-700 md:inline-block">
                    {user.name}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-gray-400 md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.department}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    프로필
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    설정
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
