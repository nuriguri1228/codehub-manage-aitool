'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  KeyRound,
  Calculator,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Separator } from '@/components/ui/separator';
import type { ReviewChecklistItem, ReviewResult, ReviewStage, Application } from '@/types';
import { mockAiTools } from '@/lib/mock-data';
import { useSubmitReview } from '@/hooks/use-review';
import { toast } from 'sonner';

interface LicenseIssuancePanelProps {
  reviewStageId: string;
  application: Application;
  previousStages: ReviewStage[];
}

const LICENSE_CHECKLIST: ReviewChecklistItem[] = [
  { id: 'lic-1', label: '이전 검토 결과 확인 완료', checked: false },
  { id: 'lic-2', label: '비용 적절성 확인', checked: false },
  { id: 'lic-3', label: '보안 서약 확인', checked: false },
  { id: 'lic-4', label: '라이센스 설정 확인', checked: false },
];

const reviewSchema = z.object({
  comment: z.string(),
  result: z.enum(['APPROVED', 'REJECTED', 'FEEDBACK_REQUESTED']),
  quotaLimit: z.number().min(100000),
  validityMonths: z.number(),
});

type FormValues = z.infer<typeof reviewSchema>;

export default function LicenseIssuancePanel({
  reviewStageId,
  application,
  previousStages,
}: LicenseIssuancePanelProps) {
  const [checkItems, setCheckItems] = useState<ReviewChecklistItem[]>(LICENSE_CHECKLIST);
  const [confirmAction, setConfirmAction] = useState<ReviewResult | null>(null);
  const submitReview = useSubmitReview();

  const { register, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      comment: '',
      result: 'APPROVED',
      quotaLimit: 1000000,
      validityMonths: 12,
    },
  });

  const comment = watch('comment');
  const quotaLimit = watch('quotaLimit');
  const validityMonths = watch('validityMonths');

  const toggleCheck = (id: string) => {
    setCheckItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // AI 도구별 비용 정보 계산
  const toolCostInfo = application.aiToolIds.map((toolId, idx) => {
    const tool = mockAiTools.find((t) => t.id === toolId);
    const tokenCost = tool?.tokenCost ?? 0;
    const estimatedCost = tokenCost * quotaLimit;
    return {
      name: application.aiToolNames[idx] || tool?.name || toolId,
      tokenCost,
      defaultQuota: tool?.defaultQuota ?? 1000000,
      estimatedCost,
    };
  });

  const handleAction = (result: ReviewResult) => {
    if ((result === 'REJECTED' || result === 'FEEDBACK_REQUESTED') && !comment.trim()) {
      toast.error('의견을 작성해주세요', {
        description: '반려 또는 피드백 요청 시 의견은 필수입니다.',
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
          ...(confirmAction === 'APPROVED' && {
            licenseConfig: {
              quotaLimit,
              validityMonths,
            },
          }),
        },
      },
      {
        onSuccess: () => {
          const labels: Record<ReviewResult, string> = {
            APPROVED: '라이센스 발급 완료',
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
          title: '라이센스 발급 확인',
          description: `라이센스를 발급하고 프로세스를 완료하시겠습니까? 쿼터 ${quotaLimit.toLocaleString()} tokens, 유효기간 ${validityMonths}개월로 발급됩니다.`,
          actionLabel: '발급 승인',
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
          title: '반려 확인',
          description: '라이센스 발급을 반려하시겠습니까? 이 결정은 되돌릴 수 없습니다.',
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
          <CardTitle className="text-lg flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-emerald-600" />
            라이센스 발급
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

          <Separator />

          {/* Cost Information */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              비용 정보
            </h3>
            <div className="space-y-2">
              {toolCostInfo.map((tool) => (
                <div
                  key={tool.name}
                  className="rounded-lg border bg-muted/30 px-4 py-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{tool.name}</span>
                    <Badge variant="outline" className="text-xs">
                      ${tool.tokenCost}/1K tokens
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    기본 쿼터: {tool.defaultQuota.toLocaleString()} tokens |
                    예상 비용: ${tool.estimatedCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* License Config Form */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">라이센스 설정</h3>
            <div className="space-y-2">
              <Label className="text-sm">쿼터 한도 (tokens)</Label>
              <Input
                type="number"
                min={100000}
                step={100000}
                {...register('quotaLimit', { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                최소 100,000 tokens
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">유효기간</Label>
              <Select
                defaultValue="12"
                onValueChange={(v) => setValue('validityMonths', Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6개월</SelectItem>
                  <SelectItem value="12">12개월</SelectItem>
                  <SelectItem value="24">24개월</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Checklist */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">발급 전 확인 사항</h3>
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
            <Label className="text-sm font-semibold">검토 의견</Label>
            <Textarea
              placeholder="라이센스 발급 관련 의견을 작성하세요..."
              rows={4}
              {...register('comment')}
            />
            <p className="text-xs text-muted-foreground">
              * 반려/피드백 요청 시 의견 필수 작성
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-semibold text-foreground">발급 결과를 선택하세요</p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleAction('APPROVED')}
                disabled={submitReview.isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                발급 승인
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
