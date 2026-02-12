'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Laptop,
  Monitor,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import ReviewPanel from '@/components/review/review-panel';
import EnvPrepPanel from '@/components/review/env-prep-panel';
import LicenseIssuancePanel from '@/components/review/license-issuance-panel';
import ReviewTimeline from '@/components/review/review-timeline';
import {
  useReviewDetail,
  getSlaLabel,
  getSlaColorClass,
  calculateSlaStatus,
} from '@/hooks/use-review';
import type { Project } from '@/types';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function ProjectAccordion({ projects }: { projects: Project[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {projects.map((proj, idx) => (
        <div key={idx} className="rounded-lg border bg-muted/30">
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-sm font-semibold">{proj.name}</span>
            {openIndex === idx ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {openIndex === idx && (
            <div className="border-t px-4 py-3 space-y-1">
              <p className="text-sm text-muted-foreground">
                {proj.startDate} ~ {proj.endDate} | {proj.role} | PM: {proj.pmName}
              </p>
              <p className="text-sm text-muted-foreground">{proj.description}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function DetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-[600px]" />
        <Skeleton className="h-[500px]" />
      </div>
    </div>
  );
}

export default function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: detail, isLoading } = useReviewDetail(id);
  const [showDetails, setShowDetails] = useState(false);

  if (isLoading || !detail) {
    return <DetailLoading />;
  }

  const { application, currentStage, allStages, feedbacks } = detail;
  const sla = calculateSlaStatus(currentStage.dueDate);
  const slaColor = getSlaColorClass(sla);
  const isEnvPrep = currentStage.stageName === 'ENV_PREPARATION';
  const isLicenseIssuance = currentStage.stageName === 'LICENSE_ISSUANCE';
  const previousApprovals = allStages.filter(
    (s) => s.result === 'APPROVED' && s.stageOrder < currentStage.stageOrder
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/reviews">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              검토 상세 | {application.applicationNumber}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {currentStage.stageName}
          </Badge>
          <Badge variant="outline" className={`${slaColor} border-0 font-semibold`}>
            SLA: {getSlaLabel(currentStage.dueDate)}
          </Badge>
        </div>
      </div>

      {/* 2-Panel Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Panel */}
        <div className="space-y-6">
          {isEnvPrep || isLicenseIssuance ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{isLicenseIssuance ? '라이센스 발급 정보' : '환경 준비 정보'}</CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      application.environment === 'VDI'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 text-base px-3 py-1'
                        : 'bg-purple-50 text-purple-700 border-purple-200 text-base px-3 py-1'
                    }
                  >
                    {application.environment === 'VDI' ? (
                      <Monitor className="mr-1 h-4 w-4" />
                    ) : (
                      <Laptop className="mr-1 h-4 w-4" />
                    )}
                    {application.environment === 'VDI' ? 'VDI 환경' : '노트북 환경'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Applicant Basic Info */}
                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
                    <span className="text-muted-foreground">신청자</span>
                    <span>
                      {application.applicantName} ({application.applicantDepartment},{' '}
                      {application.applicantPosition})
                    </span>
                    <span className="text-muted-foreground">AI 도구</span>
                    <span>{application.aiToolNames.join(', ')}</span>
                    <span className="text-muted-foreground">신청일</span>
                    <span>{application.submittedAt || application.createdAt}</span>
                  </div>
                </div>

                <Separator />

                {/* Previous Approval Results */}
                {previousApprovals.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold">이전 단계 승인 결과</h3>
                    <div className="space-y-3">
                      {previousApprovals.map((stage) => (
                        <div
                          key={stage.id}
                          className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3"
                        >
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-emerald-800">
                                {stage.stageName} — 승인
                              </span>
                              <span className="text-xs text-emerald-600">
                                {stage.reviewedAt}
                              </span>
                            </div>
                            {stage.comment && (
                              <p className="mt-1 text-sm text-emerald-700">{stage.comment}</p>
                            )}
                            <p className="mt-0.5 text-xs text-emerald-600">
                              검토자: {stage.reviewerName} ({stage.reviewerDepartment})
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Collapsible Reference Details */}
                <div>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      참고 정보 (프로젝트, 첨부 문서, 보안 서약)
                    </h3>
                    {showDetails ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {showDetails && (
                    <div className="mt-4 space-y-6">
                      {/* Purpose */}
                      {application.purpose && (
                        <div>
                          <h3 className="mb-2 text-sm font-semibold">사용 목적</h3>
                          <p className="text-sm text-muted-foreground">{application.purpose}</p>
                        </div>
                      )}

                      <Separator />

                      {/* Projects */}
                      <div>
                        <h3 className="mb-3 text-sm font-semibold">
                          프로젝트 정보 ({application.projects.length}건)
                        </h3>
                        <ProjectAccordion projects={application.projects} />
                      </div>

                      <Separator />

                      {/* Attachments */}
                      <div>
                        <h3 className="mb-3 text-sm font-semibold">
                          첨부 문서 ({application.attachments.length}개)
                        </h3>
                        {application.attachments.length === 0 ? (
                          <p className="text-sm text-muted-foreground">첨부 문서가 없습니다.</p>
                        ) : (
                          <div className="space-y-2">
                            {application.attachments.map((att) => (
                              <div
                                key={att.id}
                                className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{att.fileName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({formatFileSize(att.fileSize)})
                                  </span>
                                </div>
                                <Button variant="link" size="sm" className="h-auto p-0 text-blue-700">
                                  <Download className="mr-1 h-3 w-3" />
                                  다운로드
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Security Agreement */}
                      <div>
                        <h3 className="mb-3 text-sm font-semibold">보안 서약</h3>
                        {application.securityAgreement ? (
                          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-emerald-600" />
                              <span className="text-sm text-emerald-700">
                                서약 완료 | {application.securityAgreement.agreedAt} 서명
                              </span>
                            </div>
                            <Button variant="link" size="sm" className="h-auto p-0 text-blue-700">
                              서명 확인
                            </Button>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                            <span className="text-sm text-amber-700">보안 서약 미완료</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">신청 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
                    <span className="text-muted-foreground">신청자</span>
                    <span>
                      {application.applicantName} ({application.applicantDepartment},{' '}
                      {application.applicantPosition})
                    </span>
                    <span className="text-muted-foreground">AI 도구</span>
                    <span>{application.aiToolNames.join(', ')}</span>
                    <span className="text-muted-foreground">환경</span>
                    <span>{application.environment}</span>
                    <span className="text-muted-foreground">신청일</span>
                    <span>{application.submittedAt || application.createdAt}</span>
                  </div>
                </div>

                {/* Purpose */}
                {application.purpose && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold">사용 목적</h3>
                    <p className="text-sm text-muted-foreground">{application.purpose}</p>
                  </div>
                )}

                <Separator />

                {/* Projects */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold">
                    프로젝트 정보 ({application.projects.length}건)
                  </h3>
                  <ProjectAccordion projects={application.projects} />
                </div>

                <Separator />

                {/* Attachments */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold">
                    첨부 문서 ({application.attachments.length}개)
                  </h3>
                  {application.attachments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">첨부 문서가 없습니다.</p>
                  ) : (
                    <div className="space-y-2">
                      {application.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{att.fileName}</span>
                            <span className="text-xs text-muted-foreground">
                              ({formatFileSize(att.fileSize)})
                            </span>
                          </div>
                          <Button variant="link" size="sm" className="h-auto p-0 text-blue-700">
                            <Download className="mr-1 h-3 w-3" />
                            다운로드
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Security Agreement */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold">보안 서약</h3>
                  {application.securityAgreement ? (
                    <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-emerald-700">
                          서약 완료 | {application.securityAgreement.agreedAt} 서명
                        </span>
                      </div>
                      <Button variant="link" size="sm" className="h-auto p-0 text-blue-700">
                        서명 확인
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                      <span className="text-sm text-amber-700">보안 서약 미완료</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Previous Review History */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold">이전 검토 이력</h3>
                  <ReviewTimeline stages={allStages} feedbacks={feedbacks} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel */}
        <div>
          {isEnvPrep ? (
            <EnvPrepPanel
              reviewStageId={currentStage.id}
              environment={application.environment}
              checklist={currentStage.checklist || []}
            />
          ) : isLicenseIssuance ? (
            <LicenseIssuancePanel
              reviewStageId={currentStage.id}
              application={application}
              previousStages={previousApprovals}
            />
          ) : (
            <ReviewPanel
              reviewStageId={currentStage.id}
              checklist={currentStage.checklist || []}
            />
          )}
        </div>
      </div>
    </div>
  );
}
