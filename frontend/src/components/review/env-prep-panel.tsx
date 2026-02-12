'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CheckCircle2, AlertTriangle, XCircle, Loader2, Monitor, Laptop } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ReviewChecklistItem, ReviewResult, ReviewStage, Environment } from '@/types';
import { useSubmitReview } from '@/hooks/use-review';
import { toast } from 'sonner';

interface EnvPrepPanelProps {
  reviewStageId: string;
  environment: Environment;
  checklist: ReviewChecklistItem[];
  previousStages: ReviewStage[];
}

const VDI_CHECKLIST: ReviewChecklistItem[] = [
  { id: 'env-vdi-1', label: 'VDI 계정 생성 완료', checked: false },
  { id: 'env-vdi-2', label: '네트워크 접근 권한 설정', checked: false },
  { id: 'env-vdi-3', label: '보안 정책 적용', checked: false },
  { id: 'env-vdi-4', label: 'AI 도구 설치 및 설정', checked: false },
];

const NOTEBOOK_CHECKLIST: ReviewChecklistItem[] = [
  { id: 'env-nb-1', label: '노트북 보안 설정 확인', checked: false },
  { id: 'env-nb-2', label: '네트워크 접근 권한 설정', checked: false },
  { id: 'env-nb-3', label: 'AI 도구 설치 및 설정', checked: false },
  { id: 'env-nb-4', label: '개인장비 보안 정책 적용', checked: false },
];

const reviewSchema = z.object({
  comment: z.string(),
  result: z.enum(['APPROVED', 'REJECTED', 'FEEDBACK_REQUESTED']),
});

type FormValues = z.infer<typeof reviewSchema>;

export default function EnvPrepPanel({ reviewStageId, environment, checklist: initialChecklist, previousStages }: EnvPrepPanelProps) {
  const defaultChecklist = initialChecklist.length > 0
    ? initialChecklist
    : environment === 'VDI' ? VDI_CHECKLIST : NOTEBOOK_CHECKLIST;

  const [checkItems, setCheckItems] = useState<ReviewChecklistItem[]>(defaultChecklist);
  const [confirmAction, setConfirmAction] = useState<ReviewResult | null>(null);
  const submitReview = useSubmitReview();

  const { register, watch } = useForm<FormValues>({
    defaultValues: { comment: '', result: 'APPROVED' },
  });

  const comment = watch('comment');

  const toggleCheck = (id: string) => {
    setCheckItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleAction = (result: ReviewResult) => {
    if ((result === 'REJECTED' || result === 'FEEDBACK_REQUESTED') && !comment.trim()) {
      toast.error('의견을 작성해주세요', {
        description: '준비 불가 또는 피드백 요청 시 의견은 필수입니다.',
      });
      return;
    }
    setConfirmAction(result);
  };

  const executeSubmit = () => {
    if (!confirmAction) return;

    submitReview.mutate(
      {
        reviewStageId,
        data: {
          result: confirmAction,
          comment,
          checklist: checkItems,
        },
      },
      {
        onSuccess: () => {
          const labels: Record<ReviewResult, string> = {
            APPROVED: '환경 준비 완료',
            REJECTED: '준비 불가',
            FEEDBACK_REQUESTED: '피드백 요청',
          };
          toast.success(`${labels[confirmAction]} 처리되었습니다.`);
          setConfirmAction(null);
        },
        onError: () => {
          toast.error('처리 중 오류가 발생했습니다.');
          setConfirmAction(null);
        },
      }
    );
  };

  const getConfirmConfig = () => {
    switch (confirmAction) {
      case 'APPROVED':
        return {
          title: '환경 준비 완료 확인',
          description: `${environment === 'VDI' ? 'VDI' : '노트북'} 환경 준비가 완료되었습니까? 라이센스 발급 단계로 넘어갑니다.`,
          actionLabel: '환경 준비 완료',
          variant: 'default' as const,
        };
      case 'FEEDBACK_REQUESTED':
        return {
          title: '피드백 요청 확인',
          description: '신청자에게 추가 정보를 요청하시겠습니까?',
          actionLabel: '피드백 요청',
          variant: 'default' as const,
        };
      case 'REJECTED':
        return {
          title: '준비 불가 확인',
          description: '환경 준비가 불가한 것으로 처리하시겠습니까? 이 결정은 되돌릴 수 없습니다.',
          actionLabel: '준비 불가',
          variant: 'destructive' as const,
        };
      default:
        return { title: '', description: '', actionLabel: '', variant: 'default' as const };
    }
  };

  const config = getConfirmConfig();

  return (
    <>
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {environment === 'VDI' ? (
              <Monitor className="h-5 w-5 text-blue-600" />
            ) : (
              <Laptop className="h-5 w-5 text-purple-600" />
            )}
            환경 준비
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Previous Stage Approvals Summary */}
          {previousStages.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">이전 검토 승인 요약</h3>
              <div className="space-y-2">
                {previousStages.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-sm text-emerald-800">
                      {stage.stageName} — {stage.reviewerName}
                    </span>
                    <span className="text-xs text-emerald-600 ml-auto">
                      {stage.reviewedAt?.split('T')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Environment Badge */}
          <div>
            <Badge
              variant="outline"
              className={environment === 'VDI'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-purple-50 text-purple-700 border-purple-200'
              }
            >
              {environment === 'VDI' ? 'VDI 환경' : '노트북 환경'}
            </Badge>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">환경 준비 체크리스트</h3>
            {checkItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <Checkbox
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={() => toggleCheck(item.id)}
                />
                <Label htmlFor={item.id} className="text-sm font-normal cursor-pointer">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">환경 준비 메모</Label>
            <Textarea
              placeholder="환경 준비 관련 메모를 작성하세요..."
              rows={5}
              {...register('comment')}
            />
            <p className="text-xs text-muted-foreground">
              * 준비 불가/피드백 요청 시 의견 필수 작성
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-semibold text-foreground">환경 준비 결과를 선택하세요</p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleAction('APPROVED')}
                disabled={submitReview.isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                환경 준비 완료
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction('FEEDBACK_REQUESTED')}
                disabled={submitReview.isPending}
                className="flex-1 border-amber-600 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
              >
                <AlertTriangle className="h-4 w-4" />
                피드백 요청
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction('REJECTED')}
                disabled={submitReview.isPending}
                className="flex-1 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <XCircle className="h-4 w-4" />
                준비 불가
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{config.title}</AlertDialogTitle>
            <AlertDialogDescription>{config.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitReview.isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeSubmit}
              disabled={submitReview.isPending}
              variant={config.variant}
            >
              {submitReview.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {config.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
