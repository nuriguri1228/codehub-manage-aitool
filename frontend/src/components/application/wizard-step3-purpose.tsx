'use client';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface WizardStep3Props {
  value: string;
  onChange: (purpose: string) => void;
  error?: string;
}

const MAX_LENGTH = 1000;
const MIN_LENGTH = 20;

export function WizardStep3Purpose({ value, onChange, error }: WizardStep3Props) {
  const charCount = value.length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">사용 목적</h3>
        <p className="text-sm text-muted-foreground">
          AI 도구 사용 목적을 상세히 입력해주세요. (최소 {MIN_LENGTH}자)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">사용 목적 *</Label>
        <Textarea
          id="purpose"
          placeholder="AI 도구를 활용하여 어떤 업무를 수행할 계획인지 구체적으로 작성해주세요."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          maxLength={MAX_LENGTH}
          className={error ? 'border-red-500' : ''}
        />
        <div className="flex items-center justify-between">
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <div />
          )}
          <p className="text-xs text-gray-400">
            {charCount} / {MAX_LENGTH}
          </p>
        </div>
      </div>
    </div>
  );
}
