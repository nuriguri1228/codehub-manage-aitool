'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function LoadingSpinner({
  className,
  size = 'md',
  text,
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-[#1E40AF]', sizeClasses[size])} />
      {text && <span className="text-sm text-gray-500">{text}</span>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <LoadingSpinner size="lg" text="불러오는 중..." />
    </div>
  );
}
