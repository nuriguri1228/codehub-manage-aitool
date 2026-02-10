'use client';

import { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface SystemSettings {
  slaDeadlineDays: number;
  anomalyThresholdPercent: number;
  defaultQuota: number;
  budgetLimit: number;
  maxApiCallsPerDay: number;
  notifications: {
    emailOnApproval: boolean;
    emailOnRejection: boolean;
    emailOnAnomalyDetected: boolean;
    emailOnQuotaWarning: boolean;
    slackOnApproval: boolean;
    slackOnAnomalyDetected: boolean;
  };
}

const defaultSettings: SystemSettings = {
  slaDeadlineDays: 2,
  anomalyThresholdPercent: 150,
  defaultQuota: 1000000,
  budgetLimit: 50000,
  maxApiCallsPerDay: 500,
  notifications: {
    emailOnApproval: true,
    emailOnRejection: true,
    emailOnAnomalyDetected: true,
    emailOnQuotaWarning: true,
    slackOnApproval: false,
    slackOnAnomalyDetected: true,
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  const updateField = <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateNotification = (
    key: keyof SystemSettings['notifications'],
    value: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">시스템 설정</h1>
          <p className="text-muted-foreground">
            시스템 운영에 필요한 설정을 관리하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-1.5 h-4 w-4" />
            초기화
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-1.5 h-4 w-4" />
            저장
          </Button>
        </div>
      </div>

      {saved && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          설정이 저장되었습니다.
        </div>
      )}

      {/* SLA Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SLA 설정</CardTitle>
          <CardDescription>
            검토 처리 기한 및 서비스 수준 설정
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="slaDeadline">검토 SLA 기한 (일)</Label>
              <Input
                id="slaDeadline"
                type="number"
                min={1}
                value={settings.slaDeadlineDays}
                onChange={(e) =>
                  updateField('slaDeadlineDays', parseInt(e.target.value) || 0)
                }
              />
              <p className="text-xs text-muted-foreground">
                각 검토 단계별 처리 기한입니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Monitoring Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">사용량 모니터링 설정</CardTitle>
          <CardDescription>
            이상 탐지 임계값 및 쿼터 설정
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="anomalyThreshold">이상 탐지 임계값 (%)</Label>
              <Input
                id="anomalyThreshold"
                type="number"
                min={100}
                value={settings.anomalyThresholdPercent}
                onChange={(e) =>
                  updateField(
                    'anomalyThresholdPercent',
                    parseInt(e.target.value) || 0
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                평균 대비 초과 시 알림 발생
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="defaultQuota">기본 쿼터 (토큰)</Label>
              <Input
                id="defaultQuota"
                type="number"
                min={0}
                value={settings.defaultQuota}
                onChange={(e) =>
                  updateField('defaultQuota', parseInt(e.target.value) || 0)
                }
              />
              <p className="text-xs text-muted-foreground">
                신규 라이센스 기본 할당량
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxApiCalls">최대 일일 API 호출</Label>
              <Input
                id="maxApiCalls"
                type="number"
                min={0}
                value={settings.maxApiCallsPerDay}
                onChange={(e) =>
                  updateField(
                    'maxApiCallsPerDay',
                    parseInt(e.target.value) || 0
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                사용자당 일일 최대 호출 수
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">예산 설정</CardTitle>
          <CardDescription>
            월별 예산 한도를 설정하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="budgetLimit">월 예산 한도 ($)</Label>
              <Input
                id="budgetLimit"
                type="number"
                min={0}
                value={settings.budgetLimit}
                onChange={(e) =>
                  updateField('budgetLimit', parseInt(e.target.value) || 0)
                }
              />
              <p className="text-xs text-muted-foreground">
                예산 초과 시 관리자에게 알림이 발송됩니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">알림 설정</CardTitle>
          <CardDescription>
            이벤트별 알림 채널을 설정하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Email notifications */}
            <div>
              <h4 className="mb-3 text-sm font-medium">이메일 알림</h4>
              <div className="space-y-3">
                {([
                  ['emailOnApproval', '신청 승인 시'] as const,
                  ['emailOnRejection', '신청 반려 시'] as const,
                  ['emailOnAnomalyDetected', '이상 사용 탐지 시'] as const,
                  ['emailOnQuotaWarning', '쿼터 경고 시'] as const,
                ]).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-3">
                    <Checkbox
                      id={key}
                      checked={settings.notifications[key]}
                      onCheckedChange={(checked) =>
                        updateNotification(key, !!checked)
                      }
                    />
                    <Label htmlFor={key} className="text-sm font-normal">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Slack notifications */}
            <div>
              <h4 className="mb-3 text-sm font-medium">Slack 알림</h4>
              <div className="space-y-3">
                {([
                  ['slackOnApproval', '신청 승인 시'] as const,
                  ['slackOnAnomalyDetected', '이상 사용 탐지 시'] as const,
                ]).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-3">
                    <Checkbox
                      id={key}
                      checked={settings.notifications[key]}
                      onCheckedChange={(checked) =>
                        updateNotification(key, !!checked)
                      }
                    />
                    <Label htmlFor={key} className="text-sm font-normal">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
