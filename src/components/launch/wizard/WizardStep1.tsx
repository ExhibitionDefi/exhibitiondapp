'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizardStore, wizardActions } from '@/hooks/wizard';
import { step1Schema, type Step1Data } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SafeImage } from '@/components/ui/SafeImage';
import { cn } from '@/lib/utils';

// ── Validate a URL string without throwing ────────────
function isValidUrl(url: string): boolean {
  try { new URL(url); return true; }
  catch { return false; }
}

export function WizardStep1() {
  const { form } = useWizardStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver:      zodResolver(step1Schema),
    defaultValues: form.step1,
  });

  const logoURI = watch('logoURI');

  // ── Only show preview when URL is fully valid ─────────
  const showPreview = !!logoURI && isValidUrl(logoURI);

  const onSubmit = (data: Step1Data) => {
    wizardActions.updateStep1(data);
    wizardActions.nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground">Token Details</h3>
        <p className="text-xs text-muted-foreground">
          Basic information about your project token.
        </p>
      </div>

      {/* ── Token Name ────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Token Name</Label>
        <Input
          {...register('tokenName')}
          placeholder="e.g. My Project Token"
          className={cn(
            'bg-muted/30 border-border text-sm',
            errors.tokenName && 'border-destructive'
          )}
        />
        {errors.tokenName && (
          <p className="text-[11px] text-destructive">{errors.tokenName.message}</p>
        )}
      </div>

      {/* ── Token Symbol ──────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Token Symbol</Label>
        <Input
          {...register('tokenSymbol')}
          placeholder="e.g. MPT"
          className={cn(
            'bg-muted/30 border-border text-sm uppercase',
            errors.tokenSymbol && 'border-destructive'
          )}
        />
        {errors.tokenSymbol && (
          <p className="text-[11px] text-destructive">{errors.tokenSymbol.message}</p>
        )}
      </div>

      {/* ── Total Supply ──────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Total Supply</Label>
        <Input
          {...register('totalSupply')}
          type="number"
          placeholder="e.g. 1000000"
          className={cn(
            'bg-muted/30 border-border text-sm',
            errors.totalSupply && 'border-destructive'
          )}
        />
        {errors.totalSupply && (
          <p className="text-[11px] text-destructive">{errors.totalSupply.message}</p>
        )}
      </div>

      {/* ── Logo URI ──────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">
          Logo URL
        </Label>
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted/30">
            {showPreview ? (
              <SafeImage
                src={logoURI}
                alt="Token logo preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                Logo
              </div>
            )}
          </div>
          <Input
            {...register('logoURI')}
            placeholder="https://example.com/logo.png"
            className={cn(
              'bg-muted/30 border-border text-sm',
              errors.logoURI && 'border-destructive'
            )}
          />
        </div>
        {errors.logoURI && (
          <p className="text-[11px] text-destructive">{errors.logoURI.message}</p>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────── */}
      <div className="flex items-center justify-end pt-2">
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