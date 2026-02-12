'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/common';
import {
  useApplication,
  useUpdateApplication,
  useSubmitApplication,
} from '@/hooks/use-application';
import { useReviewDetail } from '@/hooks/use-review';
import type { Project } from '@/types';

const STAGE_LABEL: Record<string, string> = {
  TEAM_REVIEW: '1차 검토',
  SECURITY_REVIEW: '보안 검토',
  ENV_PREPARATION: '환경 준비',
  LICENSE_ISSUANCE: '라이센스 발급',
};

export default function ApplicationEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useApplication(id);
  const updateApplication = useUpdateApplication();
  const submitApplication = useSubmitApplication();
  const { data: reviewDetail } = useReviewDetail(id);

  const app = data?.data;

  const [purpose, setPurpose] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [initialized, setInitialized] = useState(false);

  if (app && !initialized) {
    setPurpose(app.purpose);
    setProjects(app.projects);
    setInitialized(true);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg text-gray-500">신청서를 찾을 수 없습니다.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/applications">목록으로</Link>
        </Button>
      </div>
    );
  }

  const canEdit = app.status === 'DRAFT' || app.status === 'FEEDBACK_REQUESTED';

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg text-gray-500">수정할 수 없는 신청서입니다.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href={`/applications/${id}`}>상세보기</Link>
        </Button>
      </div>
    );
  }

  const updateProject = (index: number, field: keyof Project, value: string) => {
    setProjects((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const handleSave = async () => {
    try {
      await updateApplication.mutateAsync({
        id,
        data: { purpose, projects },
      });
      toast.success('저장되었습니다.');
    } catch {
      toast.error('저장에 실패했습니다.');
    }
  };

  const handleResubmit = async () => {
    try {
      await updateApplication.mutateAsync({
        id,
        data: { purpose, projects },
      });
      await submitApplication.mutateAsync(id);
      toast.success('재제출되었습니다.');
      router.push(`/applications/${id}`);
    } catch {
      toast.error('재제출에 실패했습니다.');
    }
  };

  const isSubmitting =
    updateApplication.isPending || submitApplication.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/applications/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              신청서 수정
            </h1>
            <StatusBadge status={app.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {app.applicationNumber} | {app.aiToolNames.join(', ')}
          </p>
        </div>
      </div>

      {app.status === 'FEEDBACK_REQUESTED' && (
        <Card className="border-l-4 border-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-amber-800">
              보완 요청 피드백
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-amber-700">
              검토자로부터 피드백이 요청되었습니다. 내용을 수정하여 재제출해주세요.
            </p>
            {reviewDetail && (
              <>
                {reviewDetail.allStages
                  .filter((stage) => stage.result === 'FEEDBACK_REQUESTED')
                  .map((stage) => (
                    <div
                      key={stage.id}
                      className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-amber-900">
                          {stage.reviewerName}
                          {stage.reviewerDepartment && (
                            <span className="ml-1 text-amber-600">
                              ({stage.reviewerDepartment})
                            </span>
                          )}
                        </span>
                        {stage.reviewedAt && (
                          <span className="text-xs text-amber-500">
                            {new Date(stage.reviewedAt).toLocaleDateString('ko-KR')}
                          </span>
                        )}
                      </div>
                      {stage.comment && (
                        <p className="whitespace-pre-wrap text-sm text-amber-800">
                          {stage.comment}
                        </p>
                      )}
                      {stage.checklist && stage.checklist.some((c) => !c.checked) && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-amber-700">
                            미충족 항목:
                          </p>
                          <ul className="space-y-0.5">
                            {stage.checklist
                              .filter((c) => !c.checked)
                              .map((item) => (
                                <li
                                  key={item.id}
                                  className="flex items-center gap-1.5 text-xs text-amber-700"
                                >
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                                  {item.label}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                {reviewDetail.feedbacks.length > 0 && (
                  <div className="space-y-2">
                    {reviewDetail.feedbacks.map((fb) => (
                      <div
                        key={fb.id}
                        className="rounded-lg border border-amber-200 bg-amber-50 p-3"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-amber-900">
                            {fb.reviewerName}
                          </span>
                          <span className="text-xs text-amber-500">
                            {new Date(fb.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-amber-800">
                          {fb.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Purpose */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">사용 목적</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="purpose">사용 목적 *</Label>
          <Textarea
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={6}
          />
          <p className="text-xs text-gray-400 text-right">
            {purpose.length} / 1000
          </p>
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">프로젝트 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.map((project, index) => (
            <div key={project.id ?? index} className="space-y-3 rounded-lg border p-4">
              <span className="text-sm font-medium text-gray-700">
                프로젝트 #{index + 1}
              </span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>프로젝트명</Label>
                  <Input
                    value={project.name}
                    onChange={(e) =>
                      updateProject(index, 'name', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>역할</Label>
                  <Input
                    value={project.role}
                    onChange={(e) =>
                      updateProject(index, 'role', e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>설명</Label>
                <Textarea
                  value={project.description}
                  onChange={(e) =>
                    updateProject(index, 'description', e.target.value)
                  }
                  rows={2}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={isSubmitting}
        >
          <Save className="mr-1.5 h-4 w-4" />
          저장
        </Button>
        {app.status === 'FEEDBACK_REQUESTED' && (
          <Button onClick={handleResubmit} disabled={isSubmitting}>
            <Send className="mr-1.5 h-4 w-4" />
            {isSubmitting
              ? '재제출 중...'
              : app.feedbackStage && STAGE_LABEL[app.feedbackStage]
                ? `${STAGE_LABEL[app.feedbackStage]}(으)로 재제출`
                : '재제출하기'}
          </Button>
        )}
      </div>
    </div>
  );
}
