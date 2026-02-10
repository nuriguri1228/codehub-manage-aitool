'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  step: number;
  title: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({
  steps,
  currentStep,
  className,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <nav className={cn('w-full', className)} aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = step.step < currentStep;
          const isCurrent = step.step === currentStep;
          const isLast = index === steps.length - 1;
          const isClickable = isCompleted && !!onStepClick;

          return (
            <li
              key={step.step}
              className={cn('relative', !isLast && 'flex-1')}
            >
              <div className="flex items-center">
                {/* Step circle */}
                <button
                  type="button"
                  disabled={!isClickable}
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    isCompleted &&
                      'bg-[#059669] text-white',
                    isCurrent &&
                      'border-2 border-[#1E40AF] bg-white text-[#1E40AF]',
                    !isCompleted &&
                      !isCurrent &&
                      'border-2 border-gray-300 bg-white text-gray-400',
                    isClickable && 'cursor-pointer hover:bg-emerald-600'
                  )}
                  onClick={() => isClickable && onStepClick(step.step)}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.step
                  )}
                </button>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      'mx-2 h-0.5 flex-1',
                      isCompleted ? 'bg-[#059669]' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>

              {/* Label */}
              <div className="mt-1.5">
                <p
                  className={cn(
                    'text-xs font-medium',
                    isCurrent ? 'text-[#1E40AF]' : 'text-gray-500'
                  )}
                >
                  {step.title}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
