'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Filter,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotificationStore, type Notification } from '@/stores/notification-store';
import { mockNotificationApi } from '@/lib/mock-api';
import { cn } from '@/lib/utils';

type NotificationType = 'all' | 'success' | 'info' | 'warning' | 'error';

const typeFilterLabels: { value: NotificationType; label: string }[] = [
  { value: 'all', label: '전체 유형' },
  { value: 'success', label: '승인/완료' },
  { value: 'info', label: '접수/검토' },
  { value: 'warning', label: '경고/SLA' },
  { value: 'error', label: '반려/오류' },
];

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR');
}

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    setNotifications,
  } = useNotificationStore();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType>('all');

  useEffect(() => {
    mockNotificationApi.getNotifications().then((res) => {
      if (res.success) {
        setNotifications(res.data);
      }
    });
  }, [setNotifications]);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread' && n.read) return false;
    if (filter === 'read' && !n.read) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">알림 센터</h1>
          <p className="text-muted-foreground">
            전체 알림을 확인하고 관리하세요.
            {unreadCount > 0 && (
              <span className="ml-1 text-[#50CF94]">
                (안읽은 알림 {unreadCount}건)
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="mr-1.5 h-4 w-4" />
            모두 읽음 처리
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="space-y-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">
              전체 ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              안읽음 ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read">
              읽음 ({notifications.length - unreadCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1.5">
            {typeFilterLabels.map(({ value, label }) => (
              <Badge
                key={value}
                variant={typeFilter === value ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-colors',
                  typeFilter === value
                    ? 'bg-[#50CF94] text-white hover:bg-[#3DAF7A]'
                    : 'hover:bg-gray-100'
                )}
                onClick={() => setTypeFilter(value)}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm text-muted-foreground">
              {filter === 'unread'
                ? '안읽은 알림이 없습니다.'
                : filter === 'read'
                  ? '읽은 알림이 없습니다.'
                  : '알림이 없습니다.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                'cursor-pointer transition-colors hover:bg-gray-50',
                !notification.read && 'border-l-4 border-l-[#50CF94] bg-[#50CF94]/5'
              )}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="flex items-start gap-4 py-4">
                <div className="mt-0.5 shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        'text-sm',
                        !notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                      )}
                    >
                      {notification.title}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  {notification.link && (
                    <p className="mt-1 text-xs text-[#50CF94]">
                      클릭하여 상세 보기
                    </p>
                  )}
                </div>
                {!notification.read && (
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#50CF94]" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
