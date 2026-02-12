import type { ApplicationStatus, Environment } from './common';

export interface AiTool {
  id: string;
  name: string;
  vendor: string;
  description?: string;
  iconUrl?: string;
  apiEndpoint?: string;
  authMethod: string;
  tokenCost: number;
  defaultQuota: number;
  isActive: boolean;
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  role: string;
  pmName: string;
  pmEmail?: string;
  attachments?: File[];
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  downloadUrl: string;
}

export interface SecurityAgreement {
  id: string;
  agreedAt: string;
  signatureData?: string;
  version: string;
}

export interface Application {
  id: string;
  applicationNumber: string;
  applicantId: string;
  applicantName: string;
  applicantDepartment: string;
  applicantPosition: string;
  aiToolIds: string[];
  aiToolNames: string[];
  environment: Environment;
  purpose: string;
  status: ApplicationStatus;
  projects: Project[];
  attachments: Attachment[];
  securityAgreement?: SecurityAgreement;
  currentReviewStage?: string;
  feedbackStage?: string; // 피드백 요청한 단계명 (예: 'SECURITY_REVIEW')
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  completedAt?: string;
}

export interface ApplicationFormData {
  aiToolIds: string[];
  environment: Environment;
  purpose: string;
  projects: Project[];
  attachments: File[];
  securityAgreementSigned: boolean;
  signatureData?: string;
}

export interface ApplicationSummary {
  id: string;
  applicationNumber: string;
  aiToolNames: string[];
  environment: Environment;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStats {
  total: number;
  draft: number;
  inReview: number;
  approved: number;
  rejected: number;
  keyIssued: number;
}
