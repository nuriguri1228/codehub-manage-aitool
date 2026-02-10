'use client';

import { cn } from '@/lib/utils';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from '@/lib/constants';
import type { ApplicationStatus } from '@/types';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        APPLICATION_STATUS_COLORS[status],
        className
      )}
    >
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );
}
