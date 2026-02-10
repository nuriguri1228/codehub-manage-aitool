'use client';

import { useState } from 'react';
import { Copy, RefreshCw, Ban, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import type { ApiKey } from '@/types';
import type { LicenseStatus } from '@/types/common';

const STATUS_COLORS: Record<LicenseStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  EXPIRED: 'bg-gray-100 text-gray-700',
  REVOKED: 'bg-red-100 text-red-700',
  SUSPENDED: 'bg-yellow-100 text-yellow-700',
};

const STATUS_LABELS: Record<LicenseStatus, string> = {
  ACTIVE: '활성',
  EXPIRED: '만료',
  REVOKED: '해지',
  SUSPENDED: '정지',
};

interface ApiKeyCardProps {
  apiKey: ApiKey;
  onRegenerate: (id: string) => void;
  onRevoke: (id: string) => void;
  isRegenerating?: boolean;
  isRevoking?: boolean;
}

export function ApiKeyCard({
  apiKey,
  onRegenerate,
  onRevoke,
  isRegenerating,
  isRevoking,
}: ApiKeyCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const usagePercent = Math.round(
    (apiKey.quotaUsed / apiKey.quotaLimit) * 100
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey.maskedKey);
    setCopied(true);
    toast.success('API Key가 클립보드에 복사되었습니다.');
    setTimeout(() => setCopied(false), 2000);
  };

  const isActive = apiKey.status === 'ACTIVE';
  const expiresAt = new Date(apiKey.expiresAt);
  const daysUntilExpiry = Math.ceil(
    (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{apiKey.aiToolName}</h3>
              <Badge
                variant="secondary"
                className={STATUS_COLORS[apiKey.status]}
              >
                {STATUS_LABELS[apiKey.status]}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              환경: {apiKey.environment}
            </p>
          </div>
        </div>

        {/* Key Display */}
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <code className="flex-1 text-sm font-mono text-gray-700">
            {showKey ? apiKey.maskedKey : apiKey.maskedKey.replace(/[^-_]/g, '*')}
          </code>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Usage */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">사용량</span>
            <span className="font-medium text-gray-900">
              {apiKey.quotaUsed.toLocaleString()} / {apiKey.quotaLimit.toLocaleString()} 토큰
            </span>
          </div>
          <Progress value={usagePercent} className="h-2" />
          <p className="text-xs text-gray-400">{usagePercent}% 사용</p>
        </div>

        {/* Meta */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500">
          <div>
            <p>발급일</p>
            <p className="font-medium text-gray-700">
              {new Date(apiKey.issuedAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
          <div>
            <p>만료일</p>
            <p className="font-medium text-gray-700">
              {expiresAt.toLocaleDateString('ko-KR')}
              {isActive && daysUntilExpiry <= 30 && (
                <span className="ml-1 text-amber-600">(D-{daysUntilExpiry})</span>
              )}
            </p>
          </div>
          <div>
            <p>호출 횟수</p>
            <p className="font-medium text-gray-700">
              {apiKey.usageCount.toLocaleString()}회
            </p>
          </div>
          <div>
            <p>마지막 사용</p>
            <p className="font-medium text-gray-700">
              {apiKey.lastUsedAt
                ? new Date(apiKey.lastUsedAt).toLocaleDateString('ko-KR')
                : '-'}
            </p>
          </div>
        </div>

        {/* Actions */}
        {isActive && (
          <div className="mt-4 flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={isRegenerating}
                >
                  <RefreshCw className="mr-1 h-3.5 w-3.5" />
                  재발급
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>API Key 재발급</AlertDialogTitle>
                  <AlertDialogDescription>
                    기존 API Key는 즉시 무효화되며, 새로운 Key가 발급됩니다. 계속하시겠습니까?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onRegenerate(apiKey.id)}>
                    재발급
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700"
                  disabled={isRevoking}
                >
                  <Ban className="mr-1 h-3.5 w-3.5" />
                  해지
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>API Key 해지</AlertDialogTitle>
                  <AlertDialogDescription>
                    API Key를 해지하면 복구할 수 없습니다. 계속하시겠습니까?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onRevoke(apiKey.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    해지
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
