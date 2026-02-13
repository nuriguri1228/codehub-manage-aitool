import { z } from 'zod';

export const step1Schema = z.object({
  aiToolIds: z.array(z.string()).min(1, 'AI 도구를 최소 1개 선택해주세요'),
});

export const step2Schema = z.object({
  environment: z.enum(['VDI', 'NOTEBOOK', 'OTHER'], {
    message: '사용 환경을 선택해주세요',
  }),
});

export const step3Schema = z.object({
  purpose: z
    .string()
    .min(20, '사용 목적을 20자 이상 입력해주세요')
    .max(1000, '사용 목적은 1000자 이하로 입력해주세요'),
});

const projectMemberSchema = z.object({
  knoxId: z.string().min(1, 'Knox ID를 입력해주세요'),
  name: z.string().min(1, '이름을 입력해주세요'),
  department: z.string().min(1, '부서를 입력해주세요'),
  position: z.string().optional(),
});

const projectSchema = z.object({
  name: z.string().min(1, '프로젝트명을 입력해주세요'),
  description: z.string().min(1, '프로젝트 설명을 입력해주세요'),
  startDate: z.string().min(1, '시작일을 입력해주세요'),
  endDate: z.string().min(1, '종료일을 입력해주세요'),
  role: z.string().min(1, '역할을 입력해주세요'),
  pmName: z.string().min(1, 'PM 이름을 입력해주세요'),
  pmEmail: z.string().email('올바른 이메일을 입력해주세요').optional().or(z.literal('')),
  attachments: z.array(z.any()).optional(),
  members: z.array(projectMemberSchema).min(1, '과제원을 최소 1명 추가해주세요'),
});

export const step4Schema = z.object({
  projects: z.array(projectSchema).min(1, '프로젝트를 최소 1개 이상 추가해주세요'),
});

export const step5Schema = z.object({
  attachments: z.array(z.any()),
});

export const step6Schema = z.object({
  securityAgreementSigned: z.literal(true, {
    error: '보안 서약에 동의해주세요',
  }),
});

export const fullApplicationSchema = z.object({
  aiToolIds: step1Schema.shape.aiToolIds,
  environment: step2Schema.shape.environment,
  purpose: step3Schema.shape.purpose,
  projects: step4Schema.shape.projects,
  attachments: step5Schema.shape.attachments,
  securityAgreementSigned: step6Schema.shape.securityAgreementSigned,
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type Step6Data = z.infer<typeof step6Schema>;
export type FullApplicationData = z.infer<typeof fullApplicationSchema>;
