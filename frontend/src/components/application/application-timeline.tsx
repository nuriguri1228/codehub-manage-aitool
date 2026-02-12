'use client';

import { CheckCircle, Clock, XCircle, MessageSquare, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { REVIEW_STAGES } from '@/lib/constants';
import type { ApplicationStatus } from '@/types';

interface TimelineEvent {
  stage: string;
  label: string;
  status: 'completed' | 'current' | 'pending' | 'rejected' | 'feedback';
  date?: string;
}

function getTimelineEvents(
  applicationStatus: ApplicationStatus,
  createdAt: string,
  submittedAt?: string,
  completedAt?: string
): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      stage: 'CREATED',
      label: '신청서 작성',
      status: 'completed',
      date: createdAt,
    },
  ];

  if (applicationStatus === 'DRAFT') {
    events[0].status = 'current';
    return events;
  }

  events.push({
    stage: 'SUBMITTED',
    label: '제출 완료',
    status: 'completed',
    date: submittedAt,
  });

  const statusOrder = ['TEAM_REVIEW', 'SECURITY_REVIEW', 'ENV_PREPARATION', 'LICENSE_ISSUANCE'];
  const currentIdx = statusOrder.indexOf(applicationStatus);

  for (const reviewStage of REVIEW_STAGES) {
    const stageIdx = statusOrder.indexOf(reviewStage.key);
    let status: TimelineEvent['status'] = 'pending';

    if (applicationStatus === 'REJECTED' || applicationStatus === 'FEEDBACK_REQUESTED') {
      if (stageIdx < currentIdx) {
        status = 'completed';
      } else if (stageIdx === currentIdx) {
        status = applicationStatus === 'REJECTED' ? 'rejected' : 'feedback';
      }
    } else if (applicationStatus === 'APPROVED' || applicationStatus === 'KEY_ISSUED') {
      status = 'completed';
    } else if (stageIdx < currentIdx) {
      status = 'completed';
    } else if (stageIdx === currentIdx) {
      status = 'current';
    }

    events.push({
      stage: reviewStage.key,
      label: reviewStage.label,
      status,
    });
  }

  if (applicationStatus === 'APPROVED' || applicationStatus === 'KEY_ISSUED') {
    events.push({
      stage: 'APPROVED',
      label: '승인 완료',
      status: 'completed',
      date: completedAt,
    });
  }

  if (applicationStatus === 'KEY_ISSUED') {
    events.push({
      stage: 'KEY_ISSUED',
      label: 'API Key 발급',
      status: 'completed',
    });
  }

  return events;
}

const statusIcons: Record<TimelineEvent['status'], React.ElementType> = {
  completed: CheckCircle,
  current: Clock,
  pending: Circle,
  rejected: XCircle,
  feedback: MessageSquare,
};

const statusColors: Record<TimelineEvent['status'], string> = {
  completed: 'text-emerald-600',
  current: 'text-[#50CF94]',
  pending: 'text-gray-300',
  rejected: 'text-red-500',
  feedback: 'text-amber-500',
};

const lineColors: Record<TimelineEvent['status'], string> = {
  completed: 'bg-emerald-600',
  current: 'bg-[#50CF94]',
  pending: 'bg-gray-200',
  rejected: 'bg-red-500',
  feedback: 'bg-amber-500',
};

interface ApplicationTimelineProps {
  status: ApplicationStatus;
  createdAt: string;
  submittedAt?: string;
  completedAt?: string;
}

export function ApplicationTimeline({
  status,
  createdAt,
  submittedAt,
  completedAt,
}: ApplicationTimelineProps) {
  const events = getTimelineEvents(status, createdAt, submittedAt, completedAt);

  return (
    <div className="space-y-0">
      {events.map((event, index) => {
        const Icon = statusIcons[event.status];
        const isLast = index === events.length - 1;

        return (
          <div key={event.stage} className="flex gap-3">
            {/* Icon + line */}
            <div className="flex flex-col items-center">
              <Icon className={cn('h-5 w-5 shrink-0', statusColors[event.status])} />
              {!isLast && (
                <div
                  className={cn('mt-1 w-0.5 flex-1', lineColors[event.status])}
                  style={{ minHeight: '2rem' }}
                />
              )}
            </div>

            {/* Content */}
            <div className="pb-6">
              <p
                className={cn(
                  'text-sm font-medium',
                  event.status === 'pending'
                    ? 'text-gray-400'
                    : 'text-gray-900'
                )}
              >
                {event.label}
              </p>
              {event.date && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {new Date(event.date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
