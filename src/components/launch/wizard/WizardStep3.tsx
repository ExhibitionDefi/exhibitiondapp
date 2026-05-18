'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizardStore, wizardActions } from '@/hooks/wizard';
import { step3Schema, type Step3Data } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';


export function WizardStep3() {
  const { form } = useWizardStore();

  const CONTRIBUTION_TOKENS: Record<string, string> = {
    [process.env.NEXT_PUBLIC_NEXUS_USD_ADDRESS?.toLowerCase() ?? '']: 'USDX',
    [process.env.NEXT_PUBLIC_EXHIBITION_NEX_ADDRESS?.toLowerCase() ?? '']: 'exNEX',
    [process.env.NEXT_PUBLIC_EXH_ADDRESS?.toLowerCase()            ?? '']: 'EXH',
  };

  const selectedSymbol =
    CONTRIBUTION_TOKENS[form.step2.contributionToken.toLowerCase()] ?? 'Token';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step3Data>({
    resolver:      zodResolver(step3Schema),
    defaultValues: form.step3,
  });

  const tokenPrice          = watch('tokenPrice');
  const amountTokensForSale = watch('amountTokensForSale');

  // ── Estimated raise preview ───────────────────────────
  const estimatedRaise =
    tokenPrice && amountTokensForSale &&
    !isNaN(Number(tokenPrice)) && !isNaN(Number(amountTokensForSale))
      ? (Number(tokenPrice) * Number(amountTokensForSale)).toLocaleString()
      : null;

  const onSubmit = (data: Step3Data) => {
    wizardActions.updateStep3(data);
    wizardActions.nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground">Price & Sale</h3>
        <p className="text-xs text-muted-foreground">
          Set the token price and amount of tokens available for sale.
        </p>
      </div>

      {/* ── Token Price ───────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Token Price</Label>
        <div className="relative">
          <Input
            {...register('tokenPrice')}
            type="number"
            step="any"
            placeholder="0.00"
            className={cn(
              'pr-16 bg-muted/30 border-border text-sm',
              errors.tokenPrice && 'border-destructive'
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {selectedSymbol}
          </span>
        </div>
        {errors.tokenPrice && (
          <p className="text-[11px] text-destructive">{errors.tokenPrice.message}</p>
        )}
      </div>

      {/* ── Tokens for Sale ───────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Tokens for Sale</Label>
        <div className="relative">
          <Input
            {...register('amountTokensForSale')}
            type="number"
            placeholder="0"
            className={cn(
              'pr-16 bg-muted/30 border-border text-sm',
              errors.amountTokensForSale && 'border-destructive'
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            Tokens
          </span>
        </div>
        {errors.amountTokensForSale && (
          <p className="text-[11px] text-destructive">{errors.amountTokensForSale.message}</p>
        )}
      </div>

      {/* ── Estimated raise preview ───────────────────── */}
      {estimatedRaise && (
        <div className="flex items-center justify-between rounded-lg border border-neon-blue/20 bg-neon-blue-tone px-3 py-2.5 text-xs">
          <span className="text-muted-foreground">Estimated Max Raise</span>
          <span className="font-medium text-neon-blue">
            {estimatedRaise} {selectedSymbol}
          </span>
        </div>
      )}

      {/* ── Info note ─────────────────────────────────── */}
      <p className="text-[11px] text-muted-foreground">
        The token price is denominated in your selected contribution token. Ensure it aligns with your funding goal.
      </p>

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