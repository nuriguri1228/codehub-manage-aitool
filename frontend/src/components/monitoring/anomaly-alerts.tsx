'use client';

import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AnomalyAlert } from '@/types';

const SEVERITY_CONFIG: Record<
  AnomalyAlert['severity'],
  { label: string; className: string; icon: typeof AlertTriangle }
> = {
  CRITICAL: {
    label: '심각',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: ShieldAlert,
  },
  HIGH: {
    label: '높음',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertTriangle,
  },
  MEDIUM: {
    label: '중간',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Info,
  },
  LOW: {
    label: '낮음',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Info,
  },
};

interface AnomalyAlertsProps {
  data: AnomalyAlert[];
  onResolve?: (id: string) => void;
}

export function AnomalyAlerts({ data, onResolve }: AnomalyAlertsProps) {
  const unresolvedAlerts = data.filter((a) => !a.resolved);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">이상 사용 탐지</CardTitle>
        {unresolvedAlerts.length > 0 && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            {unresolvedAlerts.length}건 미처리
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((alert) => {
            const config = SEVERITY_CONFIG[alert.severity];
            const Icon = config.icon;
            return (
              <div
                key={alert.id}
                className={`rounded-lg border p-3 ${
                  alert.resolved ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      alert.resolved ? 'text-muted-foreground' : 'text-orange-500'
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {alert.userName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {alert.department}
                      </span>
                      <Badge variant="outline" className={config.className}>
                        {config.label}
                      </Badge>
                      {alert.resolved && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          해결됨
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {alert.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.detectedAt).toLocaleString('ko-KR')}
                      </span>
                      {!alert.resolved && onResolve && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => onResolve(alert.id)}
                        >
                          해결 처리
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {data.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              이상 탐지 알림이 없습니다.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
