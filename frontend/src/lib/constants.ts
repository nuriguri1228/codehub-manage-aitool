import type { ApplicationStatus, SelectOption } from '@/types';

export const APP_NAME = 'CodeHub AI Tool Manager';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  DRAFT: '임시저장',
  SUBMITTED: '제출완료',
  TEAM_REVIEW: '팀장 검토중',
  SECURITY_REVIEW: '보안 검토중',
  ENV_PREPARATION: '환경 준비중',
  LICENSE_ISSUANCE: '라이센스 발급중',
  APPROVED: '승인 완료',
  KEY_ISSUED: 'Key 발급완료',
  REJECTED: '반려',
  FEEDBACK_REQUESTED: '피드백 요청',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-[#50CF94]/15 text-[#3a9e70]',
  TEAM_REVIEW: 'bg-indigo-100 text-indigo-700',
  SECURITY_REVIEW: 'bg-purple-100 text-purple-700',
  ENV_PREPARATION: 'bg-yellow-100 text-yellow-700',
  LICENSE_ISSUANCE: 'bg-orange-100 text-orange-700',
  APPROVED: 'bg-[#50CF94]/20 text-[#2d8a5e]',
  KEY_ISSUED: 'bg-[#50CF94]/30 text-[#257a50]',
  REJECTED: 'bg-red-100 text-red-700',
  FEEDBACK_REQUESTED: 'bg-amber-100 text-amber-700',
};

export const ENVIRONMENT_OPTIONS: SelectOption[] = [
  { label: 'VDI', value: 'VDI' },
  { label: 'Notebook', value: 'NOTEBOOK' },
  { label: '기타', value: 'OTHER' },
];

export const REVIEW_STAGES = [
  { key: 'TEAM_REVIEW', label: '팀장 검토', order: 1 },
  { key: 'SECURITY_REVIEW', label: '보안 검토', order: 2 },
  { key: 'ENV_PREPARATION', label: '환경 준비', order: 3 },
  { key: 'LICENSE_ISSUANCE', label: '라이센스 발급', order: 4 },
];

export const WIZARD_STEPS = [
  { step: 1, title: 'AI 도구 선택', description: '사용할 AI 도구를 선택하세요' },
  { step: 2, title: '사용 환경 선택', description: '사용 환경을 선택하세요' },
  { step: 3, title: '사용 목적', description: '사용 목적을 입력하세요' },
  { step: 4, title: '프로젝트 정보', description: '관련 프로젝트 정보를 입력하세요' },
  { step: 5, title: '추가 첨부파일', description: '추가 문서를 첨부하세요' },
  { step: 6, title: '보안 서약', description: '보안 서약에 동의해주세요' },
  { step: 7, title: '최종 확인', description: '신청 내용을 확인하세요' },
];

export const ITEMS_PER_PAGE = 10;

export const SLA_DAYS = 2;

export const FILE_UPLOAD_MAX_SIZE = 10 * 1024 * 1024; // 10MB
export const FILE_UPLOAD_ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
];
