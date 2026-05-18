'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizardStore, wizardActions } from '@/hooks/wizard';
import { step2Schema, type Step2Data } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SafeImage } from '@/components/ui/SafeImage';
import { getTokenLogo } from '@/lib/tokenLogos';
import { cn } from '@/lib/utils';
import type { Address } from 'viem';

const CONTRIBUTION_TOKENS = [
  {
    address: (process.env.NEXT_PUBLIC_NEXUS_USD_ADDRESS ?? '') as Address,
    symbol:  'USDX',
    decimals: 6,
  },
  {
    address: (process.env.NEXT_PUBLIC_EXHIBITION_NEX_ADDRESS ?? '') as Address,
    symbol:  'exNEX',
    decimals: 18,
  },
  {
    address: (process.env.NEXT_PUBLIC_EXH_ADDRESS ?? '') as Address,
    symbol:  'EXH',
    decimals: 18,
  },
];

export function WizardStep2() {
  const { form } = useWizardStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver:      zodResolver(step2Schema),
    defaultValues: {
      ...form.step2,
      contributionToken: form.step2.contributionToken as string,
    },
  });

  const fundingGoal       = watch('fundingGoal');
  const contributionToken = watch('contributionToken');

  // ── Auto populate softCap at 51% of fundingGoal ──────
  useEffect(() => {
    if (fundingGoal && !isNaN(Number(fundingGoal)) && Number(fundingGoal) > 0) {
      const softCap = (Number(fundingGoal) * 0.51).toFixed(2);
      setValue('softCap', softCap, { shouldValidate: false });
    }
  }, [fundingGoal, setValue]);

  const selectedToken = CONTRIBUTION_TOKENS.find(
    t => t.address.toLowerCase() === contributionToken?.toLowerCase()
  ) ?? CONTRIBUTION_TOKENS[0];

  const onSubmit = (data: Step2Data) => {
    wizardActions.updateStep2({
      ...data,
      contributionToken: data.contributionToken as `0x${string}`,
    });
    wizardActions.nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground">Funding Config</h3>
        <p className="text-xs text-muted-foreground">
          Set your funding goal, soft cap and contribution limits.
        </p>
      </div>

      {/* ── Contribution Token ────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Contribution Token</Label>
        <div className="flex gap-2">
          {CONTRIBUTION_TOKENS.map(token => (
            <button
              key={token.address}
              type="button"
              onClick={() => setValue('contributionToken', token.address, { shouldValidate: true })}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all',
                contributionToken?.toLowerCase() === token.address.toLowerCase()
                  ? 'border-neon-blue/40 bg-neon-blue-tone text-neon-blue'
                  : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative h-4 w-4 overflow-hidden rounded-full">
                <SafeImage
                  src={getTokenLogo(token.address)}
                  alt={token.symbol}
                  fill
                  className="object-cover"
                />
              </div>
              {token.symbol}
            </button>
          ))}
        </div>
        {errors.contributionToken && (
          <p className="text-[11px] text-destructive">{errors.contributionToken.message}</p>
        )}
      </div>

      {/* ── Funding Goal ──────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Funding Goal</Label>
        <div className="relative">
          <Input
            {...register('fundingGoal')}
            type="number"
            placeholder="0.00"
            className={cn(
              'pr-16 bg-muted/30 border-border text-sm',
              errors.fundingGoal && 'border-destructive'
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {selectedToken.symbol}
          </span>
        </div>
        {errors.fundingGoal && (
          <p className="text-[11px] text-destructive">{errors.fundingGoal.message}</p>
        )}
      </div>

      {/* ── Soft Cap ──────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Soft Cap</Label>
          <span className="text-[10px] text-neon-blue/70">Auto-set to 51% of goal</span>
        </div>
        <div className="relative">
          <Input
            {...register('softCap')}
            type="number"
            placeholder="0.00"
            className={cn(
              'pr-16 bg-muted/30 border-border text-sm',
              errors.softCap && 'border-destructive'
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {selectedToken.symbol}
          </span>
        </div>
        {errors.softCap && (
          <p className="text-[11px] text-destructive">{errors.softCap.message}</p>
        )}
      </div>

      {/* ── Min / Max Contribution ────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Min Contribution</Label>
          <div className="relative">
            <Input
              {...register('minContribution')}
              type="number"
              placeholder="0.00"
              className={cn(
                'pr-14 bg-muted/30 border-border text-sm',
                errors.minContribution && 'border-destructive'
              )}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
              {selectedToken.symbol}
            </span>
          </div>
          {errors.minContribution && (
            <p className="text-[11px] text-destructive">{errors.minContribution.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Max Contribution</Label>
          <div className="relative">
            <Input
              {...register('maxContribution')}
              type="number"
              placeholder="0.00"
              className={cn(
                'pr-14 bg-muted/30 border-border text-sm',
                errors.maxContribution && 'border-destructive'
              )}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
              {selectedToken.symbol}
            </span>
          </div>
          {errors.maxContribution && (
            <p className="text-[11px] text-destructive">{errors.maxContribution.message}</p>
          )}
        </div>
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