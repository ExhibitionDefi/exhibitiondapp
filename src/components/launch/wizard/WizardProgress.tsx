'use client';

import { cn } from '@/lib/utils';

interface WizardProgressProps {
  currentStep: number;
  totalSteps:  number;
}

const STEP_LABELS = [
  'Token',
  'Funding',
  'Price',
  'Timeline',
  'Liquidity',
  'Vesting',
  'Review',
];

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* ── Step dots ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step    = index + 1;
          const isDone  = step < currentStep;
          const isActive = step === currentStep;

          return (
            <div key={step} className="flex flex-1 items-center">
              <div className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all',
                isDone
                  ? 'bg-neon-blue text-charcoal'
                  : isActive
                  ? 'border-2 border-neon-blue bg-neon-blue-tone text-neon-blue'
                  : 'border border-border bg-muted/30 text-muted-foreground'
              )}>
                {isDone ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : step}
              </div>
              {index < totalSteps - 1 && (
                <div className={cn(
                  'h-0.5 flex-1 mx-1 transition-all',
                  isDone ? 'bg-neon-blue/50' : 'bg-border'
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Current step label ────────────────────────── */}
      <p className="text-center text-xs text-muted-foreground">
        {STEP_LABELS[currentStep - 1]}
      </p>
    </div>
  );
}