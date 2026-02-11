'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StepIndicator } from '@/components/common';
import { useApplicationStore } from '@/stores/application-store';
import { useCreateApplication, useSubmitApplication } from '@/hooks/use-application';
import { WIZARD_STEPS } from '@/lib/constants';
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step6Schema,
} from '@/lib/validations/application';
import { WizardStep1Tool } from './wizard-step1-tool';
import { WizardStep2Env } from './wizard-step2-env';
import { WizardStep3Purpose } from './wizard-step3-purpose';
import { WizardStep4Project } from './wizard-step4-project';
import { WizardStep5Documents } from './wizard-step5-documents';
import { WizardStep6Security } from './wizard-step6-security';
import { WizardStep7Confirm } from './wizard-step7-confirm';
import type { Environment } from '@/types';

export default function ApplicationWizard() {
  const router = useRouter();
  const {
    currentStep,
    formData,
    draftId,
    setStep,
    nextStep,
    prevStep,
    updateFormData,
    setDraftId,
    reset,
  } = useApplicationStore();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const createApplication = useCreateApplication();
  const submitApplication = useSubmitApplication();

  const validateCurrentStep = (): boolean => {
    let result;
    try {
      switch (currentStep) {
        case 1:
          result = step1Schema.safeParse({ aiToolIds: formData.aiToolIds });
          break;
        case 2:
          result = step2Schema.safeParse({ environment: formData.environment });
          break;
        case 3:
          result = step3Schema.safeParse({ purpose: formData.purpose });
          break;
        case 4:
          result = step4Schema.safeParse({ projects: formData.projects });
          break;
        case 5:
          // Documents are optional
          return true;
        case 6:
          result = step6Schema.safeParse({
            securityAgreementSigned: formData.securityAgreementSigned,
          });
          break;
        case 7:
          return true;
        default:
          return true;
      }
    } catch {
      return false;
    }

    if (result && !result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = (issue.path as (string | number)[]).join('.');
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  const handlePrev = () => {
    setErrors({});
    prevStep();
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setErrors({});
      setStep(step);
    }
  };

  const handleSaveDraft = async () => {
    try {
      if (draftId) {
        toast.success('임시저장되었습니다.');
      } else {
        const result = await createApplication.mutateAsync({
          aiToolIds: formData.aiToolIds,
          environment: (formData.environment || 'VDI') as Environment,
          purpose: formData.purpose,
          projects: formData.projects,
          attachments: formData.attachments,
          securityAgreementSigned: formData.securityAgreementSigned,
        });
        setDraftId(result.data.id);
        toast.success('임시저장되었습니다.');
      }
    } catch {
      toast.error('임시저장에 실패했습니다.');
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    try {
      let appId = draftId;
      if (!appId) {
        const result = await createApplication.mutateAsync({
          aiToolIds: formData.aiToolIds,
          environment: formData.environment as Environment,
          purpose: formData.purpose,
          projects: formData.projects,
          attachments: formData.attachments,
          securityAgreementSigned: formData.securityAgreementSigned,
        });
        appId = result.data.id;
      }

      await submitApplication.mutateAsync(appId);
      reset();
      toast.success('신청서가 제출되었습니다.');
      router.push('/applications');
    } catch {
      toast.error('신청서 제출에 실패했습니다.');
    }
  };

  const isSubmitting = createApplication.isPending || submitApplication.isPending;
  const firstError = Object.values(errors)[0];

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <Card>
        <CardContent className="px-6 py-4">
          <StepIndicator
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <WizardStep1Tool
              value={formData.aiToolIds}
              onChange={(ids) => {
                updateFormData({ aiToolIds: ids });
                setErrors({});
              }}
              error={errors['aiToolIds']}
            />
          )}
          {currentStep === 2 && (
            <WizardStep2Env
              value={formData.environment}
              onChange={(env) => {
                updateFormData({ environment: env });
                setErrors({});
              }}
              error={errors['environment']}
            />
          )}
          {currentStep === 3 && (
            <WizardStep3Purpose
              value={formData.purpose}
              onChange={(purpose) => {
                updateFormData({ purpose });
                if (errors['purpose']) setErrors({});
              }}
              error={errors['purpose']}
            />
          )}
          {currentStep === 4 && (
            <WizardStep4Project
              value={formData.projects}
              onChange={(projects) => {
                updateFormData({ projects });
                if (Object.keys(errors).length) setErrors({});
              }}
              error={firstError}
            />
          )}
          {currentStep === 5 && (
            <WizardStep5Documents
              value={formData.attachments}
              onChange={(attachments) => updateFormData({ attachments })}
            />
          )}
          {currentStep === 6 && (
            <WizardStep6Security
              value={formData.securityAgreementSigned}
              onChange={(agreed) => {
                updateFormData({ securityAgreementSigned: agreed });
                setErrors({});
              }}
              error={errors['securityAgreementSigned']}
            />
          )}
          {currentStep === 7 && <WizardStep7Confirm formData={formData} />}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrev}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              이전
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            <Save className="mr-1 h-4 w-4" />
            임시저장
          </Button>

          {currentStep < 7 ? (
            <Button onClick={handleNext}>
              다음
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Send className="mr-1 h-4 w-4" />
              {isSubmitting ? '제출 중...' : '제출하기'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
