'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  secondaryValue?: string;
  secondaryLabel?: string;
  budgetBar?: { used: number; total: number };
}

export function KpiCard({
  title,
  value,
  change,
  changeLabel = '전월 대비',
  icon: Icon,
  iconColor = 'text-blue-600',
  secondaryValue,
  secondaryLabel,
  budgetBar,
}: KpiCardProps) {
  return (
    <Card className="py-4">
      <CardContent className="flex items-start gap-4">
        <div className={cn('rounded-lg bg-muted p-2.5', iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold tracking-tight">{value}</span>
            {secondaryValue && (
              <span className="text-lg font-semibold text-emerald-600">
                {secondaryValue}
              </span>
            )}
            {change !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  change >= 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                )}
              >
                {change >= 0 ? '+' : ''}
                {change}%
              </span>
            )}
          </div>
          {budgetBar ? (
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    budgetBar.used / budgetBar.total > 0.9
                      ? 'bg-red-500'
                      : budgetBar.used / budgetBar.total > 0.7
                        ? 'bg-amber-500'
                        : 'bg-blue-600'
                  )}
                  style={{
                    width: `${Math.min((budgetBar.used / budgetBar.total) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                예산 ${budgetBar.total.toLocaleString()}의{' '}
                {Math.round((budgetBar.used / budgetBar.total) * 100)}%
              </p>
            </div>
          ) : (
            <>
              {changeLabel && (
                <p className="text-xs text-muted-foreground">{changeLabel}</p>
              )}
              {secondaryLabel && (
                <p className="text-xs text-muted-foreground">
                  {secondaryLabel}
                </p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
