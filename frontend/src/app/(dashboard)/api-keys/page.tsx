'use client';

import { Key } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth-store';
import {
  useApiKeys,
  useRegenerateApiKey,
  useRevokeApiKey,
} from '@/hooks/use-api-key';
import { ApiKeyCard } from '@/components/application/api-key-card';

export default function ApiKeysPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useApiKeys(user?.id);
  const regenerate = useRegenerateApiKey();
  const revoke = useRevokeApiKey();

  const apiKeys = data?.data ?? [];

  const handleRegenerate = async (id: string) => {
    try {
      await regenerate.mutateAsync(id);
      toast.success('API Key가 재발급되었습니다.');
    } catch {
      toast.error('재발급에 실패했습니다.');
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await revoke.mutateAsync(id);
      toast.success('API Key가 해지되었습니다.');
    } catch {
      toast.error('해지에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">API Key 관리</h1>
        <p className="text-muted-foreground">
          발급받은 API Key를 관리하세요.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-white py-16">
          <Key className="mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">발급받은 API Key가 없습니다.</p>
          <p className="mt-1 text-sm text-gray-400">
            AI 도구 사용이 승인되면 API Key가 발급됩니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apiKeys.map((key) => (
            <ApiKeyCard
              key={key.id}
              apiKey={key}
              onRegenerate={handleRegenerate}
              onRevoke={handleRevoke}
              isRegenerating={regenerate.isPending}
              isRevoking={revoke.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
