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

const MOCK_ENV_PREP_DETAIL: ReviewDetail = {
  application: {
    id: 'app-009',
    applicationNumber: 'APP-2024-0009',
    applicantId: 'user-008',
    applicantName: '유데이터',
    applicantDepartment: '데이터팀',
    applicantPosition: '선임',
    aiToolIds: ['tool-003'],
    aiToolNames: ['Cursor AI'],
    environment: 'NOTEBOOK',
    purpose: 'Python 기반 데이터 분석 스크립트 개발에 Cursor AI를 활용하겠습니다.',
    status: 'ENV_PREPARATION',
    projects: [
      {
        name: 'ML 파이프라인 구축',
        description: '머신러닝 모델 학습 파이프라인 자동화',
        startDate: '2024-11-01',
        endDate: '2025-06-30',
        role: 'ML 엔지니어',
        pmName: '유데이터',
      },
    ],
    attachments: [],
    securityAgreement: {
      id: 'sec-008',
      agreedAt: '2024-11-05T14:00:00Z',
      version: '1.0',
    },
    currentReviewStage: 'ENV_PREPARATION',
    createdAt: '2024-11-05T09:00:00Z',
    updatedAt: '2024-11-25T10:00:00Z',
    submittedAt: '2024-11-05T14:05:00Z',
  },
  currentStage: {
    id: 'rs-009-3',
    applicationId: 'app-009',
    stageName: 'ENV_PREPARATION',
    stageOrder: 3,
    reviewerId: 'user-005',
    reviewerName: '정관리',
    reviewerDepartment: 'IT운영팀',
    checklist: [
      { id: 'env-cl-1', label: '노트북 보안 설정 확인', checked: false },
      { id: 'env-cl-2', label: '네트워크 접근 권한 설정', checked: false },
      { id: 'env-cl-3', label: 'AI 도구 설치 및 설정', checked: false },
      { id: 'env-cl-4', label: '개인장비 보안 정책 적용', checked: false },
    ],
    dueDate: fmt(addDays(today, 5)),
    createdAt: '2024-11-15T14:00:00Z',
  },
  allStages: [
    {
      id: 'rs-009-1',
      applicationId: 'app-009',
      stageName: 'TEAM_REVIEW',
      stageOrder: 1,
      reviewerId: 'user-009',
      reviewerName: '강팀장',
      reviewerDepartment: '서비스개발팀',
      result: 'APPROVED',
      comment: '업무 적합성 확인. 승인합니다.',
      reviewedAt: '2024-11-07T10:00:00Z',
      createdAt: '2024-11-05T14:05:00Z',
    },
    {
      id: 'rs-009-2',
      applicationId: 'app-009',
      stageName: 'SECURITY_REVIEW',
      stageOrder: 2,
      reviewerId: 'user-010',
      reviewerName: '송보안',
      reviewerDepartment: '보안팀',
      result: 'APPROVED',
      comment: '보안 요건 충족. 보안 서약 완료 확인.',
      reviewedAt: '2024-11-15T14:00:00Z',
      createdAt: '2024-11-07T10:00:00Z',
    },
  ],
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
      if (id === 'rs-009-3') {
        return MOCK_ENV_PREP_DETAIL;
      }
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
