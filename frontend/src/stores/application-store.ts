import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Environment, Project } from '@/types';

interface WizardFormData {
  aiToolIds: string[];
  environment: Environment | '';
  purpose: string;
  projects: Project[];
  attachments: File[];
  securityAgreementSigned: boolean;
}

interface ApplicationStore {
  currentStep: number;
  formData: WizardFormData;
  draftId: string | null;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<WizardFormData>) => void;
  setDraftId: (id: string | null) => void;
  reset: () => void;
}

const initialFormData: WizardFormData = {
  aiToolIds: [],
  environment: '',
  purpose: '',
  projects: [],
  attachments: [],
  securityAgreementSigned: false,
};

export const useApplicationStore = create<ApplicationStore>()(
  persist(
    (set) => ({
      currentStep: 1,
      formData: initialFormData,
      draftId: null,
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 7) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),
      updateFormData: (data) =>
        set((s) => ({ formData: { ...s.formData, ...data } })),
      setDraftId: (id) => set({ draftId: id }),
      reset: () => set({ currentStep: 1, formData: initialFormData, draftId: null }),
    }),
    {
      name: 'application-wizard',
      partialize: (state) => ({
        currentStep: state.currentStep,
        formData: {
          ...state.formData,
          attachments: [],
        },
        draftId: state.draftId,
      }),
    }
  )
);
