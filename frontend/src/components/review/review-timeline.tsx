'use client';

import { CheckCircle2, XCircle, MessageSquare, Clock } from 'lucide-react';
import type { ReviewStage, ReviewFeedback } from '@/types';

interface ReviewTimelineProps {
  stages: ReviewStage[];
  feedbacks: ReviewFeedback[];
}

function getResultIcon(result?: string) {
  switch (result) {
    case 'APPROVED':
      return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
    case 'REJECTED':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'FEEDBACK_REQUESTED':
      return <MessageSquare className="h-5 w-5 text-amber-600" />;
    default:
      return <Clock className="h-5 w-5 text-muted-foreground" />;
  }
}

function getResultLabel(result?: string) {
  switch (result) {
    case 'APPROVED':
      return '승인';
    case 'REJECTED':
      return '반려';
    case 'FEEDBACK_REQUESTED':
      return '피드백 요청';
    default:
      return '대기중';
  }
}

export default function ReviewTimeline({ stages, feedbacks }: ReviewTimelineProps) {
  const hasHistory = stages.length > 0 || feedbacks.length > 0;

  if (!hasHistory) {
    return (
      <div className="rounded-lg bg-muted/50 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          아직 이전 검토 이력이 없습니다 (첫 번째 검토 단계)
        </p>
      </div>
    );
  }

  const timelineItems = [
    ...stages
      .filter((s) => s.result)
      .map((s) => ({
        type: 'stage' as const,
        date: s.reviewedAt || s.createdAt,
        stage: s,
      })),
    ...feedbacks.map((f) => ({
      type: 'feedback' as const,
      date: f.createdAt,
      feedback: f,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="relative space-y-4">
      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
      {timelineItems.map((item, idx) => (
        <div key={idx} className="relative flex gap-3 pl-7">
          <div className="absolute left-0 top-0.5">{getResultIcon(
            item.type === 'stage' ? item.stage?.result : 'FEEDBACK_REQUESTED'
          )}</div>
          <div className="flex-1 min-w-0">
            {item.type === 'stage' && item.stage && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {item.stage.stageName} - {getResultLabel(item.stage.result)}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.stage.reviewedAt}</span>
                </div>
                {item.stage.comment && (
                  <p className="mt-1 text-sm text-muted-foreground">{item.stage.comment}</p>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  검토자: {item.stage.reviewerName} ({item.stage.reviewerDepartment})
                </p>
              </>
            )}
            {item.type === 'feedback' && item.feedback && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">피드백</span>
                  <span className="text-xs text-muted-foreground">{item.feedback.createdAt}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.feedback.content}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.feedback.reviewerName}
                </p>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
