'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApplicationApi } from '@/lib/mock-api';
import type {
  Application,
  ApplicationStats,
  PaginatedResponse,
  PaginationParams,
  FilterState,
} from '@/types';

export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...applicationKeys.lists(), params] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
  stats: (userId?: string) => [...applicationKeys.all, 'stats', userId] as const,
  summaries: (userId: string) => [...applicationKeys.all, 'summaries', userId] as const,
};

interface UseApplicationsParams extends Partial<PaginationParams>, Partial<FilterState> {
  userId?: string;
}

export function useApplications(params: UseApplicationsParams = {}) {
  return useQuery<PaginatedResponse<Application> & { success: boolean }>({
    queryKey: applicationKeys.list(params as Record<string, unknown>),
    queryFn: () =>
      mockApplicationApi.getApplications({
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        search: params.search,
        status: params.status,
        tool: params.tool,
        userId: params.userId,
      }),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => mockApplicationApi.getApplicationById(id),
    enabled: !!id,
  });
}

export function useApplicationStats(userId?: string) {
  return useQuery<{ success: boolean; data: ApplicationStats }>({
    queryKey: applicationKeys.stats(userId),
    queryFn: () => mockApplicationApi.getApplicationStats(userId),
  });
}

export function useApplicationSummaries(userId: string) {
  return useQuery({
    queryKey: applicationKeys.summaries(userId),
    queryFn: () => mockApplicationApi.getApplicationSummaries(userId),
    enabled: !!userId,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mockApplicationApi.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Application> }) =>
      mockApplicationApi.updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    },
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mockApplicationApi.submitApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mockApplicationApi.deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    },
  });
}
