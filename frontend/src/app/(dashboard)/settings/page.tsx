'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface NotificationSettings {
  channels: {
    email: boolean;
    messenger: boolean;
    inApp: boolean;
  };
  types: {
    reviewStageChange: boolean;
    slaOverdue: boolean;
    apiKeyExpiry: boolean;
    costThreshold: boolean;
  };
}

const defaultSettings: NotificationSettings = {
  channels: {
    email: true,
    messenger: false,
    inApp: true,
  },
  types: {
    reviewStageChange: true,
    slaOverdue: true,
    apiKeyExpiry: true,
    costThreshold: false,
  },
};

export default function UserSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);

  const updateChannel = (key: keyof NotificationSettings['channels'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      channels: { ...prev.channels, [key]: value },
    }));
  };

  const updateType = (key: keyof NotificationSettings['types'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      types: { ...prev.types, [key]: value },
    }));
  };

  const handleSave = () => {
    toast.success('설정이 저장되었습니다.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">사용자 설정</h1>
          <p className="text-muted-foreground">
            알림 수신 채널과 유형을 설정하세요.
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-1.5 h-4 w-4" />
          저장
        </Button>
      </div>

      {/* Notification Channel Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">알림 채널 설정</CardTitle>
          <CardDescription>알림을 수신할 채널을 선택하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="channel-email" className="text-sm font-medium">
                이메일 알림
              </Label>
              <p className="text-xs text-muted-foreground">
                등록된 이메일로 알림을 받습니다.
              </p>
            </div>
            <Switch
              id="channel-email"
              checked={settings.channels.email}
              onCheckedChange={(checked) => updateChannel('email', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="channel-messenger" className="text-sm font-medium">
                메신저 알림
              </Label>
              <p className="text-xs text-muted-foreground">
                사내 메신저로 알림을 받습니다.
              </p>
            </div>
            <Switch
              id="channel-messenger"
              checked={settings.channels.messenger}
              onCheckedChange={(checked) => updateChannel('messenger', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="channel-inapp" className="text-sm font-medium">
                인앱 알림
              </Label>
              <p className="text-xs text-muted-foreground">
                브라우저 상단 알림 센터로 알림을 받습니다.
              </p>
            </div>
            <Switch
              id="channel-inapp"
              checked={settings.channels.inApp}
              onCheckedChange={(checked) => updateChannel('inApp', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Type Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">알림 유형별 수신 설정</CardTitle>
          <CardDescription>수신할 알림 유형을 선택하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="type-review" className="text-sm font-medium">
                검토 단계 변경
              </Label>
              <p className="text-xs text-muted-foreground">
                신청서의 검토 단계가 변경될 때 알림을 받습니다.
              </p>
            </div>
            <Switch
              id="type-review"
              checked={settings.types.reviewStageChange}
              onCheckedChange={(checked) => updateType('reviewStageChange', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="type-sla" className="text-sm font-medium">
                SLA 초과
              </Label>
              <p className="text-xs text-muted-foreground">
                검토 처리가 SLA 기한을 초과할 때 알림을 받습니다.
              </p>
            </div>
            <Switch
              id="type-sla"
              checked={settings.types.slaOverdue}
              onCheckedChange={(checked) => updateType('slaOverdue', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="type-apikey" className="text-sm font-medium">
                API Key 만료
              </Label>
              <p className="text-xs text-muted-foreground">
                API Key 만료일이 임박하면 알림을 받습니다.
              </p>
            </div>
            <Switch
              id="type-apikey"
              checked={settings.types.apiKeyExpiry}
              onCheckedChange={(checked) => updateType('apiKeyExpiry', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="type-cost" className="text-sm font-medium">
                비용 임계치
              </Label>
              <p className="text-xs text-muted-foreground">
                월간 사용 비용이 임계치에 도달하면 알림을 받습니다.
              </p>
            </div>
            <Switch
              id="type-cost"
              checked={settings.types.costThreshold}
              onCheckedChange={(checked) => updateType('costThreshold', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
