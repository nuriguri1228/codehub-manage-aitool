'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import type { License, LicenseStatus } from '@/types';

const STATUS_CONFIG: Record<LicenseStatus, { label: string; className: string }> = {
  ACTIVE: { label: '활성', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  EXPIRED: { label: '만료', className: 'bg-gray-50 text-gray-600 border-gray-200' },
  REVOKED: { label: '해지', className: 'bg-red-50 text-red-700 border-red-200' },
  SUSPENDED: { label: '정지', className: 'bg-amber-50 text-amber-700 border-amber-200' },
};

interface LicenseTableProps {
  data: License[];
  total: number;
  onBatchRenew?: (ids: string[]) => void;
  onBatchRevoke?: (ids: string[]) => void;
  onDetail?: (id: string) => void;
  onRevoke?: (id: string) => void;
}

export function LicenseTable({
  data,
  total,
  onBatchRenew,
  onBatchRevoke,
  onDetail,
  onRevoke,
}: LicenseTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(data.map((d) => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedIds(next);
  };

  const allChecked = data.length > 0 && selectedIds.size === data.length;
  const someChecked = selectedIds.size > 0 && selectedIds.size < data.length;
  const selected = Array.from(selectedIds);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">라이센스 상세 목록</h3>
        <span className="text-sm text-muted-foreground">총 {total}건</span>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-10">
              <Checkbox
                checked={allChecked}
                ref={(el) => {
                  if (el) {
                    (el as unknown as HTMLInputElement).indeterminate = someChecked;
                  }
                }}
                onCheckedChange={(checked) => toggleAll(!!checked)}
              />
            </TableHead>
            <TableHead>라이센스ID</TableHead>
            <TableHead>사용자</TableHead>
            <TableHead>부서</TableHead>
            <TableHead>도구</TableHead>
            <TableHead>환경</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>발급일</TableHead>
            <TableHead>만료일</TableHead>
            <TableHead>사용량</TableHead>
            <TableHead>액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((license) => {
            const statusCfg = STATUS_CONFIG[license.status];
            return (
              <TableRow key={license.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(license.id)}
                    onCheckedChange={(checked) =>
                      toggleOne(license.id, !!checked)
                    }
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {license.licenseNumber}
                </TableCell>
                <TableCell>{license.userName}</TableCell>
                <TableCell>{license.userDepartment}</TableCell>
                <TableCell>{license.aiToolName}</TableCell>
                <TableCell>{license.environment}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusCfg.className}>
                    {statusCfg.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {new Date(license.issuedAt).toLocaleDateString('ko-KR', {
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </TableCell>
                <TableCell className="text-xs">
                  {new Date(license.expiresAt).toLocaleDateString('ko-KR', {
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={license.usagePercent}
                      className="h-1.5 w-20"
                    />
                    <span className="text-xs text-muted-foreground">
                      {license.usagePercent}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      className="text-xs text-blue-700 hover:underline"
                      onClick={() => onDetail?.(license.id)}
                    >
                      상세
                    </button>
                    {license.status === 'ACTIVE' && (
                      <button
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => onRevoke?.(license.id)}
                      >
                        해지
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Batch Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 pt-2">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size}개 선택됨
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBatchRenew?.(selected)}
          >
            일괄 갱신
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => onBatchRevoke?.(selected)}
          >
            일괄 해지
          </Button>
        </div>
      )}
    </div>
  );
}
