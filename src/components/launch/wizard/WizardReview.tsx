'use client';

import { wizardActions } from '@/hooks/wizard';
import { useWizardStore } from '@/hooks/wizard';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/SafeImage';
import { getTokenLogo } from '@/lib/tokenLogos';
import { cn } from '@/lib/utils';
import type { WizardFormData } from '@/types/project';
import { type WriteResult } from '@/lib/parseContractError';

const CONTRIBUTION_TOKENS: Record<string, { symbol: string; decimals: number }> = {
  [process.env.NEXT_PUBLIC_NEXUS_USD_ADDRESS?.toLowerCase() ?? '']: { symbol: 'USDX', decimals: 6  },
  [process.env.NEXT_PUBLIC_EXHIBITION_NEX_ADDRESS?.toLowerCase() ?? '']: { symbol: 'exNEX', decimals: 18 },
  [process.env.NEXT_PUBLIC_EXH_ADDRESS?.toLowerCase()            ?? '']: { symbol: 'EXH',   decimals: 18 },
};

interface WizardReviewProps {
  createLaunch:  (form: WizardFormData) => Promise<WriteResult>;
  isPending:     boolean;
  isConfirming:  boolean;
}

export function WizardReview({ createLaunch, isPending, isConfirming }: WizardReviewProps) {
  const { form } = useWizardStore();
  const { step1, step2, step3, step4, step5, step6 } = form;

  const ctInfo = CONTRIBUTION_TOKENS[step2.contributionToken.toLowerCase()]
    ?? { symbol: 'Token', decimals: 6 };

  const isLoading = isPending || isConfirming;

  const getButtonLabel = () => {
    if (isPending)    return 'Submitting...';
    if (isConfirming) return 'Confirming...';
    return 'Execute Launch';
  };

  const handleSubmit = async () => {
    const result = await createLaunch(form);
    if (result === 'rejected') wizardActions.goToStep(7);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground">Review</h3>
        <p className="text-xs text-muted-foreground">
          Review your launch details before submitting.
        </p>
      </div>

      <ReviewSection title="Token Details">
        <div className="flex items-center gap-3">
          {step1.logoURI && (
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border">
              <SafeImage src={step1.logoURI} alt={step1.tokenSymbol} fill className="object-cover" />
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-foreground">{step1.tokenName}</span>
            <span className="text-[11px] text-muted-foreground">
              {step1.tokenSymbol} · Supply: {Number(step1.totalSupply).toLocaleString()}
            </span>
          </div>
        </div>
      </ReviewSection>

      <ReviewSection title="Funding">
        <ReviewRow
          label="Contribution Token"
          value={
            <div className="flex items-center gap-1.5">
              <div className="relative h-3.5 w-3.5 overflow-hidden rounded-full">
                <SafeImage src={getTokenLogo(step2.contributionToken)} alt={ctInfo.symbol} fill className="object-cover" />
              </div>
              {ctInfo.symbol}
            </div>
          }
        />
        <ReviewRow label="Funding Goal"     value={`${step2.fundingGoal} ${ctInfo.symbol}`} />
        <ReviewRow label="Soft Cap"         value={`${step2.softCap} ${ctInfo.symbol}`} />
        <ReviewRow label="Min Contribution" value={`${step2.minContribution} ${ctInfo.symbol}`} />
        <ReviewRow label="Max Contribution" value={`${step2.maxContribution} ${ctInfo.symbol}`} />
      </ReviewSection>

      <ReviewSection title="Price & Sale">
        <ReviewRow label="Token Price"     value={`${step3.tokenPrice} ${ctInfo.symbol}`} />
        <ReviewRow label="Tokens for Sale" value={Number(step3.amountTokensForSale).toLocaleString()} />
      </ReviewSection>

      <ReviewSection title="Timeline">
        <ReviewRow label="Start Delay" value={`${step4.startDays}d ${step4.startHours}h from now`} />
        <ReviewRow label="Duration"    value={`${step4.durationDays}d ${step4.durationHours}h`} />
      </ReviewSection>

      <ReviewSection title="Liquidity">
        <ReviewRow label="Liquidity %" value={`${step5.liquidityPercentage}%`} />
        <ReviewRow label="LP Lock"     value={`${step5.lockDurationDays} day${step5.lockDurationDays !== 1 ? 's' : ''}`} />
      </ReviewSection>

      <ReviewSection title="Vesting">
        {!step6.vestingEnabled ? (
          <span className="text-[11px] text-muted-foreground">No vesting</span>
        ) : (
          <>
            <ReviewRow label="Initial Release" value={`${step6.initialReleasePercent}%`} />
            <ReviewRow label="Cliff"           value={`${step6.cliffDays}d`} />
            <ReviewRow label="Duration"        value={`${step6.durationDays}d`} />
            <ReviewRow label="Interval"        value={`every ${step6.intervalDays}d`} />
          </>
        )}
      </ReviewSection>

      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={wizardActions.prevStep}
          disabled={isLoading}
          className="border-border text-muted-foreground hover:text-foreground"
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className={cn(
            'border border-neon-orange/40 bg-neon-orange-tone text-neon-orange',
            'hover:bg-neon-orange/20 disabled:opacity-50'
          )}
        >
          {getButtonLabel()}
        </Button>
      </div>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 px-3 py-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}