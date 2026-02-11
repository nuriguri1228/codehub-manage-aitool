'use client';

import { useQuery } from '@tanstack/react-query';
import { mockToolApi } from '@/lib/mock-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, FileText } from 'lucide-react';
import { ENVIRONMENT_OPTIONS } from '@/lib/constants';
import type { Project } from '@/types';

interface WizardStep7Props {
  formData: {
    aiToolId: string;
    environment: string;
    purpose: string;
    projects: Project[];
    attachments: File[];
    securityAgreementSigned: boolean;
  };
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <span className="w-32 shrink-0 text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-900">{children}</span>
    </div>
  );
}

export function WizardStep7Confirm({ formData }: WizardStep7Props) {
  const { data: toolsResult } = useQuery({
    queryKey: ['aiTools', 'active'],
    queryFn: () => mockToolApi.getActiveTool(),
  });

  const tools = toolsResult?.data ?? [];
  const selectedTool = tools.find((t) => t.id === formData.aiToolId);
  const envLabel =
    ENVIRONMENT_OPTIONS.find((e) => e.value === formData.environment)?.label ??
    formData.environment;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">최종 확인</h3>
        <p className="text-sm text-muted-foreground">
          입력한 내용을 확인하고 제출하세요.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">AI 도구 및 환경</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="AI 도구">
            {selectedTool?.name ?? '-'}{' '}
            {selectedTool && (
              <span className="text-gray-500">({selectedTool.vendor})</span>
            )}
          </InfoRow>
          <InfoRow label="사용 환경">
            <Badge variant="secondary">{envLabel}</Badge>
          </InfoRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">사용 목적</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-gray-700">
            {formData.purpose || '-'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            프로젝트 정보 ({formData.projects.length}건)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.projects.map((project, i) => (
            <div key={i}>
              {i > 0 && <Separator className="mb-4" />}
              <div className="space-y-2">
                <InfoRow label="프로젝트명">{project.name}</InfoRow>
                <InfoRow label="설명">{project.description}</InfoRow>
                <InfoRow label="기간">
                  {project.startDate} ~ {project.endDate}
                </InfoRow>
                <InfoRow label="역할">{project.role}</InfoRow>
                <InfoRow label="PM">{project.pmName}</InfoRow>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">첨부 문서</CardTitle>
        </CardHeader>
        <CardContent>
          {formData.attachments.length === 0 ? (
            <p className="text-sm text-gray-500">첨부된 문서가 없습니다.</p>
          ) : (
            <ul className="space-y-1">
              {formData.attachments.map((file, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <FileText className="h-4 w-4 text-gray-400" />
                  {file.name}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">보안 서약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span className="text-sm text-gray-700">보안 서약에 동의하였습니다.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
