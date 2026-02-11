'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  FileText,
  Download,
  XCircle,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { StatusBadge } from '@/components/common';
import { useApplication, useCancelApplication } from '@/hooks/use-application';
import { useApplicationStore } from '@/stores/application-store';
import { ApplicationTimeline } from '@/components/application/application-timeline';
import { ENVIRONMENT_OPTIONS } from '@/lib/constants';

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <span className="w-36 shrink-0 text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-900">{children}</span>
    </div>
  );
}

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useApplication(id);
  const cancelApplication = useCancelApplication();
  const { updateFormData, setStep, reset: resetWizard } = useApplicationStore();
  const [cancelReason, setCancelReason] = useState('');
  const app = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg text-gray-500">신청서를 찾을 수 없습니다.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/applications">목록으로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  const envLabel =
    ENVIRONMENT_OPTIONS.find((e) => e.value === app.environment)?.label ??
    app.environment;

  const canEdit =
    app.status === 'DRAFT' || app.status === 'FEEDBACK_REQUESTED';

  const canCancel = app.status === 'SUBMITTED';

  const canCopy =
    app.status === 'APPROVED' ||
    app.status === 'KEY_ISSUED' ||
    app.status === 'REJECTED';

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    try {
      await cancelApplication.mutateAsync({ id, reason: cancelReason });
      toast.success('신청이 취소되었습니다.');
      router.push('/applications');
    } catch {
      toast.error('신청 취소에 실패했습니다.');
    }
  };

  const handleCopyAndReapply = () => {
    resetWizard();
    updateFormData({
      aiToolIds: app.aiToolIds,
      environment: app.environment,
      purpose: app.purpose,
      projects: app.projects.map(({ id: _id, ...rest }) => rest),
    });
    setStep(1);
    router.push('/applications/new');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/applications">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {app.applicationNumber}
              </h1>
              <StatusBadge status={app.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {app.aiToolNames.join(', ')} | {envLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="mr-1.5 h-4 w-4" />
                  신청 취소
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>신청 취소</AlertDialogTitle>
                  <AlertDialogDescription>
                    이 신청서를 취소하시겠습니까? 취소 사유를 입력해주세요.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2 py-2">
                  <Label htmlFor="cancelReason">취소 사유 *</Label>
                  <Textarea
                    id="cancelReason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="취소 사유를 입력하세요"
                    rows={3}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setCancelReason('')}>
                    돌아가기
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    disabled={!cancelReason.trim() || cancelApplication.isPending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {cancelApplication.isPending ? '취소 중...' : '신청 취소'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {canCopy && (
            <Button variant="outline" onClick={handleCopyAndReapply}>
              <Copy className="mr-1.5 h-4 w-4" />
              복사하여 재신청
            </Button>
          )}
          {canEdit && (
            <Button asChild>
              <Link href={`/applications/${app.id}/edit`}>
                <Edit className="mr-1.5 h-4 w-4" />
                수정하기
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">신청 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="신청자">
                {app.applicantName} ({app.applicantDepartment} / {app.applicantPosition})
              </InfoRow>
              <InfoRow label="AI 도구">{app.aiToolNames.join(', ')}</InfoRow>
              <InfoRow label="사용 환경">
                <Badge variant="secondary">{envLabel}</Badge>
              </InfoRow>
              <InfoRow label="신청일">
                {new Date(app.createdAt).toLocaleDateString('ko-KR')}
              </InfoRow>
              {app.submittedAt && (
                <InfoRow label="제출일">
                  {new Date(app.submittedAt).toLocaleDateString('ko-KR')}
                </InfoRow>
              )}
            </CardContent>
          </Card>

          {/* Purpose */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">사용 목적</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-gray-700">
                {app.purpose}
              </p>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                프로젝트 정보 ({app.projects.length}건)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {app.projects.map((project, i) => (
                <div key={project.id ?? i}>
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

          {/* Attachments */}
          {app.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">첨부 문서</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {app.attachments.map((att) => (
                    <li
                      key={att.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{att.fileName}</span>
                        <span className="text-xs text-gray-400">
                          ({(att.fileSize / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Timeline */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">진행 상황</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplicationTimeline
                status={app.status}
                createdAt={app.createdAt}
                submittedAt={app.submittedAt}
                completedAt={app.completedAt}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
