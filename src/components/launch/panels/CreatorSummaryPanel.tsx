'use client';

import { formatAmount } from '@/lib/formatters';
import type { Project } from '@/types/project';

const PLATFORM_FEE_BPS = 300n;
const STATUS_FAILED     = 3;
const STATUS_REFUNDABLE = 5;

interface CreatorSummaryPanelProps {
  launch: Project;
}

export function CreatorSummaryPanel({ launch }: CreatorSummaryPanelProps) {
  const {
    totalRaised,
    liquidityPercentage,
    contributionTokenDecimals,
    contributionTokenSymbol,
    tokenSymbol,
    tokenDecimals,
    amountTokensForSale,
    tokensSold,
    unsoldTokensWithdrawn,
    liquidityAdded,
    status,
    totalSupply,
    tokenPrice,
    fundingGoal,
  } = launch;

  const isFailed     = status.code === STATUS_FAILED || status.code === STATUS_REFUNDABLE;
  const isCompleted  = liquidityAdded;

  // ── Unsold withdrawn state ────────────────────────────────
  if (unsoldTokensWithdrawn) {
    const unsoldTokens = isFailed
      ? amountTokensForSale
      : amountTokensForSale > tokensSold
        ? amountTokensForSale - tokensSold
        : 0n;

    return (
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Launch Summary</h2>
          <span className="text-[11px] text-muted-foreground">Owner</span>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-muted/30 bg-muted/10 px-3 py-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-muted/40 bg-muted/20">
            <span className="text-sm text-green-400">✓</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-foreground">Unsold tokens withdrawn</span>
            <span className="text-[11px] text-muted-foreground">
              {formatAmount(unsoldTokens, tokenDecimals)} {tokenSymbol} returned to your wallet
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Completed state — financial breakdown ─────────────────
  if (isCompleted) {
    const platformFeeAmount        = (totalRaised * PLATFORM_FEE_BPS) / 10_000n;
    const netRaised                = totalRaised - platformFeeAmount;
    const contributionTokensForLiq = (netRaised * BigInt(liquidityPercentage)) / 10_000n;
    const ownerReceives            = netRaised - contributionTokensForLiq;

    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Launch Summary</h2>
          <span className="text-[11px] text-muted-foreground">Owner</span>
        </div>

        <div className="flex flex-col gap-1.5 rounded-lg bg-muted/30 px-3 py-3">
          <span className="text-[11px] font-medium text-muted-foreground mb-1">
            Financial Breakdown
          </span>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total Raised</span>
            <span className="font-medium text-foreground">
              {formatAmount(totalRaised, contributionTokenDecimals)} {contributionTokenSymbol}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Platform Fee (3%)</span>
            <span className="font-medium text-destructive">
              − {formatAmount(platformFeeAmount, contributionTokenDecimals)} {contributionTokenSymbol}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-border pt-1.5 mt-0.5">
            <span className="text-muted-foreground">Net Raised</span>
            <span className="font-medium text-foreground">
              {formatAmount(netRaised, contributionTokenDecimals)} {contributionTokenSymbol}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-muted-foreground">
              Liquidity ({Number(liquidityPercentage) / 100}%)
            </span>
            <span className="font-medium text-neon-blue">
              {formatAmount(contributionTokensForLiq, contributionTokenDecimals)} {contributionTokenSymbol}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-border pt-1.5 mt-0.5">
            <span className="text-muted-foreground font-medium">You Received</span>
            <span className="font-semibold text-green-400">
              {formatAmount(ownerReceives, contributionTokenDecimals)} {contributionTokenSymbol}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}