'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/alert-dialog';
import type { ReviewChecklistItem, ReviewResult } from '@/types';
import { useSubmitReview } from '@/hooks/use-review';
import { toast } from 'sonner';

interface ReviewPanelProps {
  reviewStageId: string;
  checklist: ReviewChecklistItem[];
}

const reviewSchema = z.object({
  comment: z.string(),
  result: z.enum(['APPROVED', 'REJECTED', 'FEEDBACK_REQUESTED']),
});

type FormValues = z.infer<typeof reviewSchema>;

export default function ReviewPanel({ reviewStageId, checklist: initialChecklist }: ReviewPanelProps) {
  const [checkItems, setCheckItems] = useState<ReviewChecklistItem[]>(initialChecklist);
  const [confirmAction, setConfirmAction] = useState<ReviewResult | null>(null);
  const submitReview = useSubmitReview();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { comment: '', result: 'APPROVED' },
  });

  const comment = watch('comment');

  const toggleCheck = (id: string) => {
    setCheckItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const allChecked = checkItems.every((item) => item.checked);

  const handleAction = (result: ReviewResult) => {
    if ((result === 'REJECTED' || result === 'FEEDBACK_REQUESTED') && !comment.trim()) {
      toast.error('검토 의견을 작성해주세요', {
        description: '피드백 요청 또는 반려 시 검토 의견은 필수입니다.',
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
            APPROVED: '승인',
            REJECTED: '반려',
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
          title: '승인 확인',
          description: '이 신청 건을 승인하시겠습니까? 다음 검토 단계로 넘어갑니다.',
          actionLabel: '승인',
          variant: 'default' as const,
        };
      case 'FEEDBACK_REQUESTED':
        return {
          title: '피드백 요청 확인',
          description: '신청자에게 피드백을 요청하시겠습니까? 신청자가 보완 후 재제출할 수 있습니다.',
          actionLabel: '피드백 요청',
          variant: 'default' as const,
        };
      case 'REJECTED':
        return {
          title: '반려 확인',
          description: '이 신청 건을 반려하시겠습니까? 이 결정은 되돌릴 수 없습니다.',
          actionLabel: '반려',
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
          <CardTitle className="text-lg">검토 의견</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Checklist */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">검토 체크리스트</h3>
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
            <Label className="text-sm font-semibold">
              검토 의견 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="검토 의견을 작성하세요..."
              rows={5}
              {...register('comment')}
            />
            <p className="text-xs text-muted-foreground">
              * 피드백 요청/반려 시 검토 의견 필수 작성
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-semibold text-foreground">검토 결과를 선택하세요</p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleAction('APPROVED')}
                disabled={submitReview.isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                승인
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
                반려
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
