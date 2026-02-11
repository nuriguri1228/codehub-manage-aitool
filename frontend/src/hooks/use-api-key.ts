'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApiKeyApi } from '@/lib/mock-api';

export const apiKeyKeys = {
  all: ['apiKeys'] as const,
  list: (userId?: string) => [...apiKeyKeys.all, 'list', userId] as const,
  detail: (id: string) => [...apiKeyKeys.all, 'detail', id] as const,
};

export function useApiKeys(userId?: string) {
  return useQuery({
    queryKey: apiKeyKeys.list(userId),
    queryFn: () => mockApiKeyApi.getApiKeys(userId),
  });
}

export function useApiKey(id: string) {
  return useQuery({
    queryKey: apiKeyKeys.detail(id),
    queryFn: () => mockApiKeyApi.getApiKeyById(id),
    enabled: !!id,
  });
}

export function useRegenerateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mockApiKeyApi.regenerateApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mockApiKeyApi.revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
    },
  });
}
