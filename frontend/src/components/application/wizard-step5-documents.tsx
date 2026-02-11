'use client';

import { FileUpload } from '@/components/common';

interface WizardStep5Props {
  value: File[];
  onChange: (files: File[]) => void;
  error?: string;
}

export function WizardStep5Documents({ value, onChange, error }: WizardStep5Props) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">추가 첨부파일</h3>
        <p className="text-sm text-muted-foreground">
          프로젝트에 직접 연결되지 않는 추가 문서를 첨부해주세요. (선택사항)
        </p>
      </div>

      <FileUpload value={value} onChange={onChange} />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
