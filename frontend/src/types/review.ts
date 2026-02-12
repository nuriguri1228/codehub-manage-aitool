import type { ReviewResult } from './common';
import type { Application } from './application';

export interface ReviewStage {
  id: string;
  applicationId: string;
  stageName: string;
  stageOrder: number;
  reviewerId?: string;
  reviewerName?: string;
  reviewerDepartment?: string;
  result?: ReviewResult;
  comment?: string;
  checklist?: ReviewChecklistItem[];
  reviewedAt?: string;
  dueDate?: string;
  createdAt: string;
}

export interface ReviewChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ReviewFeedback {
  id: string;
  reviewStageId: string;
  reviewerName: string;
  content: string;
  createdAt: string;
}

export interface ReviewDetail {
  application: Application;
  currentStage: ReviewStage;
  allStages: ReviewStage[];
  feedbacks: ReviewFeedback[];
}

export interface ReviewFormData {
  result: ReviewResult;
  comment: string;
  checklist: ReviewChecklistItem[];
  licenseConfig?: {
    quotaLimit: number;
    validityMonths: number;
  };
}

export interface ReviewListItem {
  id: string;
  applicationId: string;
  applicationNumber: string;
  applicantName: string;
  applicantDepartment: string;
  aiToolNames: string[];
  stageName: string;
  dueDate?: string;
  submittedAt: string;
  slaStatus: 'NORMAL' | 'WARNING' | 'OVERDUE';
}

export interface ReviewStats {
  pending: number;
  completedToday: number;
  overdue: number;
  avgProcessingDays: number;
}
