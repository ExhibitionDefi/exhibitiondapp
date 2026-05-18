'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizardStore, wizardActions } from '@/hooks/wizard';
import { step5Schema, type Step5Data } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function WizardStep5() {
  const { form } = useWizardStore();

  const getSelectedSymbol = () => {
    const addr = form.step2.contributionToken.toLowerCase();
    if (addr === process.env.NEXT_PUBLIC_NEXUS_USD_ADDRESS?.toLowerCase()) return 'USDX';
    if (addr === process.env.NEXT_PUBLIC_EXHIBITION_NEX_ADDRESS?.toLowerCase()) return 'exNEX';
    return 'EXH';
  };
  const selectedSymbol = getSelectedSymbol();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step5Data>({
    resolver:      zodResolver(step5Schema),
    defaultValues: form.step5,
  });

  const liquidityPercentage = watch('liquidityPercentage');
  const lockDurationDays    = watch('lockDurationDays');

  // ── Derived previews ──────────────────────────────────
  const fundingGoal     = Number(form.step2.fundingGoal) || 0;
  const liquidityAmount = fundingGoal > 0 && liquidityPercentage
    ? ((fundingGoal * liquidityPercentage) / 100).toLocaleString()
    : null;


  const onSubmit = (data: Step5Data) => {
    wizardActions.updateStep5(data);
    wizardActions.nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground">Liquidity</h3>
        <p className="text-xs text-muted-foreground">
          Configure how much of raised funds go to liquidity and how long LP tokens are locked.
        </p>
      </div>

      {/* ── Liquidity Percentage ──────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">
            Liquidity Allocation
          </Label>
          <span className="text-xs font-medium text-neon-blue">
            {liquidityPercentage ?? 0}%
          </span>
        </div>

        {/* ── Slider ────────────────────────────────── */}
        <input
          {...register('liquidityPercentage', { valueAsNumber: true })}
          type="range"
          min={1}
          max={100}
          step={1}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-neon-blue"
        />

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>1%</span>
          <span>50%</span>
          <span>100%</span>
        </div>

        {/* ── Amount preview ────────────────────────── */}
        {liquidityAmount && (
          <div className="flex items-center justify-between rounded-lg border border-neon-blue/20 bg-neon-blue-tone px-3 py-2 text-xs">
            <span className="text-muted-foreground">Estimated Liquidity</span>
            <span className="font-medium text-neon-blue">
              ~{liquidityAmount} {selectedSymbol}
            </span>
          </div>
        )}

        {errors.liquidityPercentage && (
          <p className="text-[11px] text-destructive">
            {errors.liquidityPercentage.message}
          </p>
        )}
      </div>

      {/* ── Lock Duration ─────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">
            LP Lock Duration
          </Label>
          <span className="text-[10px] text-muted-foreground">
            Min 14 days
          </span>
        </div>
        <div className="relative">
          <Input
            {...register('lockDurationDays', { valueAsNumber: true })}
            type="number"
            min={14}
            placeholder="30"
            className={cn(
              'pr-12 bg-muted/30 border-border text-sm',
              errors.lockDurationDays && 'border-destructive'
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            days
          </span>
        </div>
        {errors.lockDurationDays && (
          <p className="text-[11px] text-destructive">
            {errors.lockDurationDays.message}
          </p>
        )}
        {lockDurationDays > 0 && (
          <p className="text-[11px] text-neon-blue">
            LP tokens locked for {lockDurationDays} day{lockDurationDays !== 1 ? 's' : ''} after launch succeeds
          </p>
        )}
      </div>

      {/* ── Info note ─────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-muted/20 px-3 py-3 text-[11px] text-muted-foreground">
        A higher liquidity allocation builds more trust with contributors. Locked LP tokens prevent rug pulls.
      </div>

      {/* ── Navigation ────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={wizardActions.prevStep}
          className="border-border text-muted-foreground hover:text-foreground"
        >
          Back
        </Button>
        <Button
          type="submit"
          className="border border-neon-blue/40 bg-neon-blue-tone text-neon-blue hover:bg-neon-blue/20"
        >
          Next
        </Button>
      </div>
    </form>
  );
}