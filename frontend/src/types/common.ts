// 공통 타입 정의

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'TEAM_REVIEW'
  | 'SECURITY_REVIEW'
  | 'ENV_PREPARATION'
  | 'FINAL_APPROVAL'
  | 'APPROVED'
  | 'KEY_ISSUED'
  | 'REJECTED'
  | 'FEEDBACK_REQUESTED';

export type ReviewResult = 'APPROVED' | 'REJECTED' | 'FEEDBACK_REQUESTED';

export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED';

export type UserRole = 'APPLICANT' | 'TEAM_LEAD' | 'SECURITY_REVIEWER' | 'IT_ADMIN' | 'SYSTEM_ADMIN';

export type Environment = 'VDI' | 'NOTEBOOK' | 'OTHER';

export type AuthMethod = 'API_KEY' | 'OAUTH' | 'TOKEN';

export interface SelectOption {
  label: string;
  value: string;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface FilterState {
  search?: string;
  status?: string;
  tool?: string;
  department?: string;
  dateRange?: DateRange;
}
