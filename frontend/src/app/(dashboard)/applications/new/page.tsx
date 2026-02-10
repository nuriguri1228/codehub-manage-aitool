'use client';

import ApplicationWizard from '@/components/application/application-wizard';

export default function NewApplicationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI 도구 사용 신청</h1>
        <p className="text-muted-foreground">
          아래 단계를 순서대로 작성하여 AI 도구 사용을 신청하세요.
        </p>
      </div>
      <ApplicationWizard />
    </div>
  );
}
