'use client';

import { Monitor, Laptop, MoreHorizontal, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Environment } from '@/types';

const ENV_OPTIONS = [
  {
    value: 'VDI' as Environment,
    label: 'VDI',
    description: '가상 데스크톱 환경에서 사용',
    icon: Monitor,
  },
  {
    value: 'NOTEBOOK' as Environment,
    label: 'Notebook',
    description: '개인 노트북 환경에서 사용',
    icon: Laptop,
  },
  {
    value: 'OTHER' as Environment,
    label: '기타',
    description: '기타 환경에서 사용',
    icon: MoreHorizontal,
  },
];

interface WizardStep2Props {
  value: string;
  onChange: (env: Environment) => void;
  error?: string;
}

export function WizardStep2Env({ value, onChange, error }: WizardStep2Props) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">사용 환경 선택</h3>
        <p className="text-sm text-muted-foreground">
          AI 도구를 사용할 환경을 선택하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ENV_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          return (
            <Card
              key={option.value}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected
                  ? 'border-[#50CF94] ring-2 ring-[#50CF94]/20'
                  : 'border-gray-200 hover:border-gray-300'
              )}
              onClick={() => onChange(option.value)}
            >
              <CardContent className="relative flex flex-col items-center p-6 text-center">
                {isSelected && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#50CF94]">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-lg',
                    isSelected ? 'bg-[#50CF94]/10' : 'bg-gray-100'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-6 w-6',
                      isSelected ? 'text-[#50CF94]' : 'text-gray-500'
                    )}
                  />
                </div>
                <p className="mt-3 font-semibold text-gray-900">{option.label}</p>
                <p className="mt-1 text-sm text-gray-500">{option.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
