'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWizardStore, wizardActions } from '@/hooks/wizard';
import { useCreateLaunch } from '@/hooks/contracts/exhibition';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { WizardIntro, WizardProgress, WizardStep1, WizardStep2, WizardStep3 } from '@/components/launch/wizard';
import { WizardStep4 }    from './WizardStep4';
import { WizardStep5 }    from './WizardStep5';
import { WizardStep6 }    from './WizardStep6';
import { WizardReview }   from './WizardReview';

const TOTAL_STEPS = 7;

const CONTRIBUTION_TOKENS: Record<string, number> = {
  [process.env.NEXT_PUBLIC_NEXUS_USD_ADDRESS?.toLowerCase() ?? '']: 6,
  [process.env.NEXT_PUBLIC_EXHIBITION_NEX_ADDRESS?.toLowerCase() ?? '']: 18,
  [process.env.NEXT_PUBLIC_EXH_ADDRESS?.toLowerCase()            ?? '']: 18,
};

export function CreateLaunchModal() {
  const { isOpen, stage, currentStep, form } = useWizardStore();
  const router    = useRouter();
  const pathname  = usePathname();
  const errorRef  = useRef<string | null>(null);
  const pendingClose = useRef(false);

  const ctDecimals = CONTRIBUTION_TOKENS[
    form.step2.contributionToken.toLowerCase()
  ] ?? 6;

  const {
    createLaunch,
    result,
    isPending,
    isConfirming,
    isError,
    error,
    reset,
  } = useCreateLaunch(ctDecimals);

  // ── Switch to spinner when wallet popup is open or tx confirming ─
  useEffect(() => {
    if (isPending || isConfirming) {
      wizardActions.setSubmitting();
    }
  }, [isPending, isConfirming]);

  // ── Redirect when result parsed ───────────────────────
  // When result arrives, navigate and flag that we want to close after nav
  useEffect(() => {
    if (result) {
      toast.success('Launch created successfully!');
      pendingClose.current = true;
      router.push(`/launches/${result.projectId}`);
    }
  }, [result, router]);

  // Close only after the route has actually changed
  useEffect(() => {
    if (pendingClose.current) {
      pendingClose.current = false;
      wizardActions.close();
    }
  }, [pathname]);

  // ── handling user rejections ────
  useEffect(() => {
    if (!isError || !error) return;
    const msg = error ?? 'Launch creation failed';
    if (errorRef.current === msg) return;
    errorRef.current = msg;
    toast.error(msg);
    reset();
    wizardActions.goToStep(7);
  }, [isError, error, reset]);

  // ── Clear errorRef when error clears ─────────────────
  useEffect(() => {
    if (!isError) errorRef.current = null;
  }, [isError]);

  // ── Close on escape ───────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stage !== 'submitting') wizardActions.close();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [stage]);

  // ── Lock body scroll ──────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────── */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />

      {/* ── Modal ─────────────────────────────────────── */}
      <div className={cn(
        'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
        'w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl',
        'max-h-[90vh] overflow-y-auto',
      )}>

        {/* ── Header ──────────────────────────────────── */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold text-foreground">
              Configure Launch
            </h2>
            {stage === 'wizard' && (
              <p className="text-xs text-muted-foreground">
                Step {currentStep} of {TOTAL_STEPS}
              </p>
            )}
          </div>
          {stage !== 'submitting' && (
            <button
              onClick={wizardActions.close}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Progress bar ────────────────────────────── */}
        {stage === 'wizard' && (
          <div className="px-6 pt-4">
            <WizardProgress
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
            />
          </div>
        )}

        {/* ── Content ─────────────────────────────────── */}
        <div className="px-6 py-5">
          {stage === 'intro'      && <WizardIntro />}
          {stage === 'wizard'     && currentStep === 1 && <WizardStep1 />}
          {stage === 'wizard'     && currentStep === 2 && <WizardStep2 />}
          {stage === 'wizard'     && currentStep === 3 && <WizardStep3 />}
          {stage === 'wizard'     && currentStep === 4 && <WizardStep4 />}
          {stage === 'wizard'     && currentStep === 5 && <WizardStep5 />}
          {stage === 'wizard'     && currentStep === 6 && <WizardStep6 />}
          {stage === 'wizard'     && currentStep === 7 && (
            <WizardReview
              createLaunch={createLaunch}
              isPending={isPending}
              isConfirming={isConfirming}
            />
          )}
          {stage === 'submitting' && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-blue border-t-transparent" />
              <p className="text-sm text-muted-foreground">Creating your launch...</p>
              <p className="text-xs text-muted-foreground">Please confirm in your wallet and wait for confirmation.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}