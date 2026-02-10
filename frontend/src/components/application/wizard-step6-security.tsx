'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

const SECURITY_ITEMS = [
  'AI 도구를 통해 회사의 기밀 정보, 개인정보, 고객 정보를 입력하지 않겠습니다.',
  'AI 도구의 출력 결과를 무비판적으로 사용하지 않으며, 반드시 검증 후 활용하겠습니다.',
  'AI 도구 사용 중 보안 취약점이나 이상 징후 발견 시 즉시 보안팀에 보고하겠습니다.',
  'AI 도구 접근 권한(API Key 등)을 타인과 공유하지 않겠습니다.',
  '회사의 AI 도구 사용 정책 및 가이드라인을 준수하겠습니다.',
  'AI 도구 사용 내역이 모니터링 및 감사될 수 있음을 이해합니다.',
];

interface WizardStep6Props {
  value: boolean;
  onChange: (agreed: boolean) => void;
  error?: string;
}

export function WizardStep6Security({ value, onChange, error }: WizardStep6Props) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">보안 서약</h3>
        <p className="text-sm text-muted-foreground">
          아래 보안 서약 내용을 확인하고 동의해주세요.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#1E40AF]" />
            <span className="font-semibold text-gray-900">보안 서약서</span>
          </div>

          <div className="space-y-3 rounded-lg bg-gray-50 p-4">
            {SECURITY_ITEMS.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 shrink-0 text-gray-400">{i + 1}.</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-lg border p-4">
            <Checkbox
              id="security-agree"
              checked={value}
              onCheckedChange={(checked) => onChange(checked === true)}
            />
            <label
              htmlFor="security-agree"
              className="cursor-pointer text-sm font-medium text-gray-900"
            >
              위 보안 서약 내용을 모두 확인하였으며 이에 동의합니다.
            </label>
          </div>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
