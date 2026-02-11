'use client';

import { useQuery } from '@tanstack/react-query';
import { mockToolApi } from '@/lib/mock-api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface WizardStep1Props {
  value: string;
  onChange: (toolId: string) => void;
  error?: string;
}

export function WizardStep1Tool({ value, onChange, error }: WizardStep1Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['aiTools', 'active'],
    queryFn: () => mockToolApi.getActiveTool(),
  });

  const tools = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">AI 도구 선택</h3>
        <p className="text-sm text-muted-foreground">
          사용하고자 하는 AI 도구를 선택하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tools.map((tool) => {
          const isSelected = value === tool.id;
          return (
            <Card
              key={tool.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected
                  ? 'border-[#1E40AF] ring-2 ring-[#1E40AF]/20'
                  : 'border-gray-200 hover:border-gray-300'
              )}
              onClick={() => onChange(tool.id)}
            >
              <CardContent className="relative p-4">
                {isSelected && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#1E40AF]">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-600">
                    {tool.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{tool.name}</p>
                    <p className="text-xs text-gray-500">{tool.vendor}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
