'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ReviewListItem,
  ReviewDetail,
  ReviewStats,
  ReviewFormData,
  ReviewResult,
  PaginatedResponse,
} from '@/types';

// -- Mock Data (inline until shared mock-data.ts is available) --

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

const MOCK_REVIEW_LIST: ReviewListItem[] = [
  {
    id: 'rev-001',
    applicationId: 'app-045',
    applicationNumber: 'APP-2026-0045',
    applicantName: '최데이터',
    applicantDepartment: '데이터팀',
    aiToolNames: ['Claude Code'],
    stageName: '1차 검토',
    dueDate: fmt(addDays(today, 1)),
    submittedAt: '2026-02-09',
    slaStatus: 'WARNING',
  },
  {
    id: 'rev-002',
    applicationId: 'app-044',
    applicationNumber: 'APP-2026-0044',
    applicantName: '박프론트',
    applicantDepartment: '웹개발팀',
    aiToolNames: ['Antigravity'],
    stageName: '재제출',
    dueDate: fmt(addDays(today, 3)),
    submittedAt: '2026-02-10',
    slaStatus: 'NORMAL',
  },
  {
    id: 'rev-003',
    applicationId: 'app-043',
    applicationNumber: 'APP-2026-0043',
    applicantName: '김주니어',
    applicantDepartment: '플랫폼팀',
    aiToolNames: ['Claude Code'],
    stageName: '1차 검토',
    dueDate: fmt(addDays(today, 5)),
    submittedAt: '2026-02-10',
    slaStatus: 'NORMAL',
  },
  {
    id: 'rev-004',
    applicationId: 'app-042',
    applicationNumber: 'APP-2026-0042',
    applicantName: '이시니어',
    applicantDepartment: 'AI연구팀',
    aiToolNames: ['Antigravity'],
    stageName: '보안 검토',
    dueDate: fmt(addDays(today, -1)),
    submittedAt: '2026-02-07',
    slaStatus: 'OVERDUE',
  },
  {
    id: 'rev-005',
    applicationId: 'app-041',
    applicationNumber: 'APP-2026-0041',
    applicantName: '정풀스택',
    applicantDepartment: '백엔드팀',
    aiToolNames: ['Cursor AI'],
    stageName: '1차 검토',
    dueDate: fmt(addDays(today, 0)),
    submittedAt: '2026-02-08',
    slaStatus: 'WARNING',
  },
];

const MOCK_REVIEW_STATS: ReviewStats = {
  pending: 5,
  completedToday: 3,
  overdue: 1,
  avgProcessingDays: 4.2,
};

const MOCK_REVIEW_DETAIL: ReviewDetail = {
  application: {
    id: 'app-045',
    applicationNumber: 'APP-2026-0045',
    applicantId: 'user-001',
    applicantName: '최데이터',
    applicantDepartment: '데이터팀',
    applicantPosition: '책임연구원',
    aiToolIds: ['tool-001'],
    aiToolNames: ['Claude Code'],
    environment: 'VDI',
    purpose: '대용량 데이터 처리 파이프라인 개발 시 코드 어시스턴트 활용',
    status: 'TEAM_REVIEW',
    projects: [
      {
        name: '데이터 파이프라인 구축',
        description: '대용량 데이터 처리 파이프라인 설계 및 구현',
        startDate: '2026-01',
        endDate: '2026-07',
        role: '리드 개발',
        pmName: '홍매니저',
      },
    ],
    attachments: [
      {
        id: 'att-001',
        fileName: '데이터파이프라인_제안서.pdf',
        fileSize: 1887436,
        mimeType: 'application/pdf',
        uploadedAt: '2026-02-09',
        downloadUrl: '#',
      },
    ],
    securityAgreement: {
      id: 'sa-001',
      agreedAt: '2026-02-09',
      version: '1.0',
    },
    currentReviewStage: 'TEAM_REVIEW',
    createdAt: '2026-02-09',
    updatedAt: '2026-02-09',
    submittedAt: '2026-02-09',
  },
  currentStage: {
    id: 'stage-001',
    applicationId: 'app-045',
    stageName: '1차 검토',
    stageOrder: 1,
    reviewerId: 'user-reviewer-001',
    reviewerName: '이팀장',
    reviewerDepartment: '데이터팀',
    checklist: [
      { id: 'chk-1', label: '사용 목적의 적절성 확인', checked: false },
      { id: 'chk-2', label: '프로젝트 정보 완전성 확인', checked: false },
      { id: 'chk-3', label: '첨부 문서 검토 완료', checked: false },
      { id: 'chk-4', label: '보안 서약 확인 완료', checked: false },
    ],
    dueDate: fmt(addDays(today, 1)),
    createdAt: '2026-02-09',
  },
  allStages: [],
  feedbacks: [],
};

// -- Query keys --

export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...reviewKeys.lists(), params] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,
  stats: () => [...reviewKeys.all, 'stats'] as const,
};

// -- Hooks --

interface UseReviewsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  tool?: string;
  department?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useReviews(params: UseReviewsParams = {}) {
  return useQuery<PaginatedResponse<ReviewListItem>>({
    queryKey: reviewKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      // TODO: Replace with actual API call
      let filtered = [...MOCK_REVIEW_LIST];

      if (params.status && params.status !== 'all') {
        if (params.status === 'pending') {
          filtered = filtered.filter((r) => r.stageName !== '완료' && r.stageName !== '반려');
        } else if (params.status === 'completed') {
          filtered = filtered.filter((r) => r.stageName === '완료');
        } else if (params.status === 'rejected') {
          filtered = filtered.filter((r) => r.stageName === '반려');
        }
      }

      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.applicationNumber.toLowerCase().includes(q) ||
            r.applicantName.toLowerCase().includes(q)
        );
      }

      if (params.tool) {
        filtered = filtered.filter((r) => r.aiToolNames.some((name) => name === params.tool));
      }

      if (params.department) {
        filtered = filtered.filter((r) => r.applicantDepartment === params.department);
      }

      if (params.sortBy === 'dueDate') {
        filtered.sort((a, b) => {
          const da = a.dueDate || '';
          const db = b.dueDate || '';
          return params.sortOrder === 'asc' ? da.localeCompare(db) : db.localeCompare(da);
        });
      }

      const page = params.page || 1;
      const limit = params.limit || 10;
      const start = (page - 1) * limit;
      const paged = filtered.slice(start, start + limit);

      return {
        data: paged,
        meta: {
          total: filtered.length,
          page,
          limit,
          totalPages: Math.ceil(filtered.length / limit),
        },
      };
    },
  });
}

export function useReviewDetail(id: string) {
  return useQuery<ReviewDetail>({
    queryKey: reviewKeys.detail(id),
    queryFn: async () => {
      // TODO: Replace with actual API call
      return MOCK_REVIEW_DETAIL;
    },
    enabled: !!id,
  });
}

export function useReviewStats() {
  return useQuery<ReviewStats>({
    queryKey: reviewKeys.stats(),
    queryFn: async () => {
      // TODO: Replace with actual API call
      return MOCK_REVIEW_STATS;
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean },
    Error,
    { reviewStageId: string; data: ReviewFormData }
  >({
    mutationFn: async ({ reviewStageId, data }) => {
      // TODO: Replace with actual API call
      console.log('Submitting review:', reviewStageId, data);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}

// -- SLA Helpers --

export type SlaLevel = 'NORMAL' | 'WARNING' | 'OVERDUE';

export function calculateSlaStatus(dueDate?: string): SlaLevel {
  if (!dueDate) return 'NORMAL';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'OVERDUE';
  if (diffDays <= 1) return 'WARNING';
  return 'NORMAL';
}

export function getSlaRemainingDays(dueDate?: string): number {
  if (!dueDate) return 999;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getSlaLabel(dueDate?: string): string {
  const days = getSlaRemainingDays(dueDate);
  if (days < 0) return `D+${Math.abs(days)}`;
  return `D-${days}`;
}

export function getSlaColorClass(status: SlaLevel) {
  switch (status) {
    case 'NORMAL':
      return 'text-emerald-600 bg-emerald-50';
    case 'WARNING':
      return 'text-amber-600 bg-amber-50';
    case 'OVERDUE':
      return 'text-red-600 bg-red-50';
  }
}
