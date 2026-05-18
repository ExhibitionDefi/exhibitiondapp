'use client';

import { formatBlocksRemaining, formatAmount } from '@/lib/formatters';
import { useLocalPricing } from '@/hooks/contracts/amm';
import type { Project } from '@/types/project';
import { formatUnits } from 'viem';

interface LaunchStatsProps {
  launch:       Project;
  fundingEnded: boolean;
}

export function LaunchStats({ launch, fundingEnded }: LaunchStatsProps) {
  const {
    totalRaised,
    fundingGoal,
    softCap,
    progressPercent,
    blocksRemaining,
    contributorCount,
    amountTokensForSale,
    tokenPrice,
    status,
    contributionTokenDecimals,
    contributionTokenSymbol,
    contributionToken,
  } = launch;

  const { getTokenPrice } = useLocalPricing();

  const showTimer =
    (status.label === 'Active' || status.label === 'Upcoming') && !fundingEnded;

  // ── RAW values (for math ONLY) ───────────────────────────────
  const raisedRaw = Number(formatUnits(totalRaised, contributionTokenDecimals));
  const goalRaw   = Number(formatUnits(fundingGoal, contributionTokenDecimals));
  const softRaw   = Number(formatUnits(softCap, contributionTokenDecimals));

  // ── DISPLAY values (for UI ONLY) ─────────────────────────────
  const raisedDisplay = formatAmount(totalRaised, contributionTokenDecimals);
  const goalDisplay   = formatAmount(fundingGoal, contributionTokenDecimals);
  const softDisplay   = formatAmount(softCap, contributionTokenDecimals);

  // ── Pricing ──────────────────────────────────────────────────
  const price = getTokenPrice(contributionToken);

  const raisedUSD = price !== null ? raisedRaw * price : null;
  const goalUSD   = price !== null ? goalRaw   * price : null;
  const softUSD   = price !== null ? softRaw   * price : null;

  // ── Token price (USD) ────────────────────────────────────────
  const tokenPriceRaw = Number(formatUnits(tokenPrice, 18));
  const tokenPriceUSD =
    price !== null ? tokenPriceRaw * price : tokenPriceRaw;

  // ── Progress logic ───────────────────────────────────────────
  const progress = goalRaw > 0 ? Math.min(raisedRaw / goalRaw, 1) : 0;
  const progressWidth = progress * 100;

  const softPercent = goalRaw > 0 ? Math.min((softRaw / goalRaw) * 100, 100) : 0;
  const isPastSoftCap = raisedRaw >= softRaw;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">Funding Progress</h2>

      {/* ── Amount Labels Above Bar ───────────────────────────── */}
      <div className="flex justify-between text-xs text-foreground mb-1 px-0.5">
        <div className="flex flex-col items-start">
          <span className="font-medium">
            {raisedDisplay} {contributionTokenSymbol}
          </span>
          {raisedUSD !== null && (
            <span className="text-muted-foreground text-[11px]">
              ≈ ${raisedUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center">
          <span className="font-medium">
            {softDisplay} {contributionTokenSymbol}
          </span>
          {softUSD !== null && (
            <span className="text-muted-foreground text-[11px]">
              ≈ ${softUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          )}
        </div>

        <div className="flex flex-col items-end">
          <span className="font-medium">
            {goalDisplay} {contributionTokenSymbol}
          </span>
          {goalUSD !== null && (
            <span className="text-muted-foreground text-[11px]">
              ≈ ${goalUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>

      {/* ── Progress Bar ───────────────────────────────────────── */}
      <div className="relative h-2 w-full border border-border bg-muted/30 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${progressWidth}%`,
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${softPercent}%, #22c55e 100%)`,
          }}
        />

        <div
          className={`absolute top-0 h-full w-[2px] ${
            isPastSoftCap ? 'bg-green-400' : 'bg-blue-400'
          }`}
          style={{ left: `${softPercent}%` }}
        />
      </div>

      {/* Bottom Info */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
        <span>{progressPercent.toFixed(1)}% funded</span>

        {showTimer && (
          <span>⏱ {formatBlocksRemaining(blocksRemaining)}</span>
        )}

        {fundingEnded && status.label === 'Active' && (
          <span className="text-neon-orange">Funding ended</span>
        )}
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        <StatItem
          label="Contributors"
          value={contributorCount.toLocaleString()}
        />

        <StatItem
          label="Token Price"
          value={`$${tokenPriceUSD.toFixed(6)}`}
        />

        <StatItem
          label="Tokens Sold"
          value={formatAmount(launch.tokensSold, 18)}
        />

        <StatItem
          label="Total Supply"
          value={formatAmount(launch.totalSupply, 18)}
        />

        <StatItem
          label="Tokens for Sale"
          value={formatAmount(amountTokensForSale, 18)}
        />

        <StatItem
          label="Unsold Tokens"
          value={formatAmount(amountTokensForSale - launch.tokensSold, 18)}
          withdrawn={launch.unsoldTokensWithdrawn > 0n}
        />
      </div>
    </div>
  );
}

// ── Upgraded StatItem with depth + gradient + hover glow ─────────────
function StatItem({ label, value, withdrawn }: { label: string; value: string; withdrawn?: boolean }) {
  return (
    <div
      className="
        relative flex flex-col gap-0.5 rounded-lg px-3 py-2
        bg-gradient-to-b from-muted/40 to-muted/20
        border border-border/50
        shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
        transition-all duration-200
        hover:border-neon-blue/40
        hover:shadow-[0_0_10px_rgba(0,200,255,0.08)]
      "
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />

      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
      <span className="text-sm font-semibold text-foreground tabular-nums">{value}</span>
        {withdrawn && (
      <span className="text-[10px] text-green-400 font-normal">✓ withdrawn</span>
    )}
</div>
    </div>
  );
}