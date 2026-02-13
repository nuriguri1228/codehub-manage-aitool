'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockToolApi } from '@/lib/mock-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, FileText, Users } from 'lucide-react';
import { ENVIRONMENT_OPTIONS } from '@/lib/constants';
import type { Project, ProjectMember } from '@/types';

interface WizardStep7Props {
  formData: {
    aiToolIds: string[];
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

interface DeduplicatedMember extends ProjectMember {
  projectNames: string[];
}

function deduplicateMembers(projects: Project[]): DeduplicatedMember[] {
  const memberMap = new Map<string, DeduplicatedMember>();
  for (const proj of projects) {
    for (const m of proj.members ?? []) {
      const existing = memberMap.get(m.knoxId);
      if (existing) {
        if (!existing.projectNames.includes(proj.name)) {
          existing.projectNames.push(proj.name);
        }
      } else {
        memberMap.set(m.knoxId, {
          ...m,
          projectNames: [proj.name],
        });
      }
    }
  }
  return Array.from(memberMap.values());
}

export function WizardStep7Confirm({ formData }: WizardStep7Props) {
  const { data: toolsResult } = useQuery({
    queryKey: ['aiTools', 'active'],
    queryFn: () => mockToolApi.getActiveTool(),
  });

  const tools = toolsResult?.data ?? [];
  const selectedTools = tools.filter((t) => formData.aiToolIds.includes(t.id));
  const envLabel =
    ENVIRONMENT_OPTIONS.find((e) => e.value === formData.environment)?.label ??
    formData.environment;

  const allMembers = useMemo(() => deduplicateMembers(formData.projects), [formData.projects]);

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
            {selectedTools.length === 0
              ? '-'
              : selectedTools.map((t, i) => (
                  <span key={t.id}>
                    {i > 0 && ', '}
                    {t.name}
                    <span className="text-gray-500"> ({t.vendor})</span>
                  </span>
                ))}
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
          {formData.projects.map((project, i) => {
            const members = project.members ?? [];
            return (
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
                  <InfoRow label="과제원">
                    <Badge variant="secondary" className="text-xs">
                      {members.length}명
                    </Badge>
                  </InfoRow>
                  {members.length > 0 && (
                    <div className="ml-0 sm:ml-36">
                      <div className="flex flex-wrap gap-1.5">
                        {members.map((m) => (
                          <Badge key={m.knoxId} variant="outline" className="text-xs font-normal">
                            {m.name} ({m.department})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {project.attachments && project.attachments.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-500">첨부파일</span>
                      <ul className="mt-1 space-y-1">
                        {project.attachments.map((file, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-gray-700">
                            <FileText className="h-4 w-4 text-gray-400" />
                            {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 신청 대상자 요약 */}
      {allMembers.length > 0 && (
        <Card className="border-[#50CF94]/30 bg-[#50CF94]/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-[#50CF94]" />
              신청 대상자 요약
              <Badge className="bg-[#50CF94] text-white">
                총 {allMembers.length}명
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border bg-background">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Knox ID</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">이름</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">부서</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">소속 프로젝트</th>
                  </tr>
                </thead>
                <tbody>
                  {allMembers.map((m) => (
                    <tr key={m.knoxId} className="border-b last:border-b-0">
                      <td className="px-3 py-2 font-mono text-xs">{m.knoxId}</td>
                      <td className="px-3 py-2">{m.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{m.department}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {m.projectNames.map((pn) => (
                            <Badge key={pn} variant="outline" className="text-xs font-normal">
                              {pn}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">추가 첨부파일</CardTitle>
        </CardHeader>
        <CardContent>
          {formData.attachments.length === 0 ? (
            <p className="text-sm text-gray-500">추가 첨부파일이 없습니다.</p>
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
