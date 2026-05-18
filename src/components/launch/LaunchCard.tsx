'use client';

import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatBlocksRemaining, formatAmount } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';
import { useLocalPricing } from '@/hooks/contracts/amm';
import { formatUnits } from 'viem';

interface LaunchCardProps {
  launch: Project;
  currentBlock?: bigint;
}

const STATUS_BADGE: Record<string, { classes: string; dot: string }> = {
  Active:     { classes: 'border-neon-orange/50 bg-neon-orange/10  text-neon-orange',  dot: 'bg-neon-orange animate-pulse' },
  Upcoming:   { classes: 'border-yellow-400/50  bg-yellow-400/10   text-yellow-300/70', dot: 'bg-yellow-400/70' },
  Claimable:  { classes: 'border-green-400/50   bg-green-400/10    text-green-300',    dot: 'bg-green-400' },
  Successful: { classes: 'border-green-400/50   bg-green-400/10    text-green-300',    dot: 'bg-green-400' },
  Completed:  { classes: 'border-neon-blue/50   bg-neon-blue/10    text-neon-blue',    dot: 'bg-neon-blue' },
  Refundable: { classes: 'border-destructive/50 bg-destructive/10  text-destructive',  dot: 'bg-destructive' },
  Failed:     { classes: 'border-destructive/50 bg-destructive/10  text-destructive',  dot: 'bg-destructive' },
  Unknown:    { classes: 'border-muted/40        bg-muted/10        text-muted-foreground', dot: 'bg-muted-foreground' },
};

const PROGRESS_COLOR: Record<string, string> = {
  Active:     'bg-neon-orange',
  Upcoming:   'bg-yellow-400/70',
  Claimable:  'bg-green-400',
  Successful: 'bg-green-400',
  Completed:  'bg-neon-blue',
  Refundable: 'bg-destructive',
  Failed:     'bg-destructive',
};

const STATUS_BORDER: Record<string, string> = {
  Active:     'border-neon-orange/30',
  Upcoming:   'border-yellow-400/20',
  Claimable:  'border-green-400/20',
  Successful: 'border-green-400/20',
  Completed:  'border-neon-blue/30',
  Refundable: 'border-destructive/30',
  Failed:     'border-destructive/30',
  Unknown:    'border-border',
};

const STATUS_BG: Record<string, string> = {
  Active:     'bg-neon-orange/[0.03]',
  Upcoming:   'bg-yellow-400/[0.02]',
  Claimable:  'bg-green-400/[0.02]',
  Successful: 'bg-green-400/[0.02]',
  Completed:  'bg-neon-blue/[0.03]',
  Refundable: 'bg-destructive/[0.03]',
  Failed:     'bg-destructive/[0.03]',
  Unknown:    '',
};

export function LaunchCard({ launch, currentBlock }: LaunchCardProps) {
  const {
    projectId,
    tokenLogoURI,
    tokenName,
    tokenSymbol,
    status,
    totalRaised,
    fundingGoal,
    progressPercent,
    blocksRemaining,
    contributionTokenDecimals,
    contributionTokenSymbol,
    contributionToken,
    amountTokensForSale,
    totalSupply,
  } = launch;

  const { getTokenPrice } = useLocalPricing();

  // ── Timer logic ───────────────────────────────────────────
  const isActive = status.label === 'Active';

  const fundingStarted = currentBlock !== undefined
    ? BigInt(currentBlock) >= BigInt(launch.startBlock)
    : false;

  const blocksToShow = !fundingStarted && currentBlock !== undefined
    ? BigInt(launch.startBlock) - BigInt(currentBlock)
    : blocksRemaining;

  const showTimer    = isActive && blocksToShow > 0n;
  const timerPrefix  = fundingStarted ? 'Closes in' : 'Opens in';
  const timerIcon    = fundingStarted ? '⏱' : '🕐';
  const isEndingSoon = fundingStarted && blocksRemaining < 2_000n;

  // ── Pricing ───────────────────────────────────────────────
  const raisedRaw     = Number(formatUnits(totalRaised, contributionTokenDecimals));
  const goalRaw       = Number(formatUnits(fundingGoal,  contributionTokenDecimals));
  const raisedDisplay = formatAmount(totalRaised, contributionTokenDecimals);
  const goalDisplay   = formatAmount(fundingGoal,  contributionTokenDecimals);

  const price     = getTokenPrice(contributionToken);
  const raisedUSD = price !== null ? raisedRaw * price : null;
  const goalUSD   = price !== null ? goalRaw   * price : null;

  // ── Token supply ──────────────────────────────────────────
  const forSaleDisplay     = formatAmount(amountTokensForSale, 18);
  const totalSupplyDisplay = formatAmount(totalSupply, 18);
  const salePercent = totalSupply > 0n
    ? ((Number(formatUnits(amountTokensForSale, 18)) /
        Number(formatUnits(totalSupply, 18))) * 100).toFixed(1)
    : null;

  const badge         = STATUS_BADGE[status.label] ?? STATUS_BADGE.Unknown;
  const progressColor = PROGRESS_COLOR[status.label] ?? 'bg-muted-foreground';
  const statusBorder  = STATUS_BORDER[status.label]  ?? 'border-border';
  const statusBg      = STATUS_BG[status.label]      ?? '';

  const logoSrc =
    tokenLogoURI && tokenLogoURI.trim().length > 0
      ? tokenLogoURI
      : '/logos/unknown.png';

  return (
    <Link href={`/launches/${projectId}`} className="group">
      <div
        className={cn(
          'relative flex flex-col gap-2 rounded-xl border p-3 h-full',
          'transition-all duration-200 cursor-pointer',
          'hover:-translate-y-0.5',
          'hover:shadow-[0_0_20px_rgba(0,200,255,0.08)]',
          statusBorder,
          statusBg,
        )}
      >
        <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-neon-blue/5 via-transparent to-transparent" />

        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-center gap-2 relative z-10">
          <div className={cn(
            'relative h-9 w-9 shrink-0 overflow-hidden rounded-full border bg-muted/30 transition-transform duration-200 group-hover:scale-105',
            isActive ? 'border-neon-orange/60' : 'border-border'
          )}>
            <SafeImage src={logoSrc} alt={tokenSymbol} fill className="object-cover" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-xs font-semibold text-foreground leading-tight">
              {tokenName || tokenSymbol}
            </span>
            <span className="text-[10px] text-neon-blue/70 font-mono leading-tight">
              ${tokenSymbol}
            </span>
          </div>

          <Badge
            variant="outline"
            className={cn(
              'shrink-0 flex items-center gap-1 text-[9px] font-medium px-1.5 py-0',
              badge.classes
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', badge.dot)} />
            {status.label}
          </Badge>
        </div>

        {/* ── Progress ───────────────────────────────── */}
        <div className="flex flex-col gap-1.5 relative z-10">
          <Progress
            value={Math.min(progressPercent, 100)}
            className="h-1.5 bg-muted/30"
            indicatorClassName={progressColor}
          />

          <div className="flex items-start justify-between text-[10px]">
            <div className="flex flex-col leading-tight">
              <span className={cn(
                'font-semibold tabular-nums',
                isActive ? 'text-neon-orange' : 'text-neon-blue'
              )}>
                {raisedDisplay}{' '}
                <span className={cn(
                  isActive ? 'text-neon-orange/60' : 'text-neon-blue/60'
                )}>
                  {contributionTokenSymbol}
                </span>
              </span>
              {raisedUSD !== null && (
                <span className="text-muted-foreground">
                  ≈ ${raisedUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              )}
            </div>

            <span className="text-muted-foreground/50 self-center tabular-nums">
              {Math.min(progressPercent, 100).toFixed(1)}% filled
            </span>

            <div className="flex flex-col items-end leading-tight">
              <span className="text-foreground/70 font-medium tabular-nums">
                {goalDisplay}{' '}
                <span className="text-muted-foreground">{contributionTokenSymbol}</span>
              </span>
              {goalUSD !== null && (
                <span className="text-muted-foreground">
                  ≈ ${goalUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Token supply row ───────────────────────── */}
        <div className="flex items-center justify-between rounded-lg bg-muted/20 px-1.5 py-1.5 text-[10px] relative z-10">
          <div className="flex flex-col gap-0">
            <span className="text-muted-foreground leading-tight">For sale</span>
            <span className="font-medium text-foreground tabular-nums leading-tight">
              {forSaleDisplay}{' '}
              <span className="text-muted-foreground/60 font-mono">{tokenSymbol}</span>
            </span>
          </div>

          {salePercent && (
            <span className="text-[9px] text-muted-foreground/50 self-center">{salePercent}%</span>
          )}

          <div className="flex flex-col items-end gap-0">
            <span className="text-muted-foreground leading-tight">Total supply</span>
            <span className="font-medium text-foreground tabular-nums leading-tight">
              {totalSupplyDisplay}{' '}
              <span className="text-muted-foreground/60 font-mono">{tokenSymbol}</span>
            </span>
          </div>
        </div>

        {/* ── Timer ──────────────────────────────────── */}
        {showTimer && (
          <div className={cn(
            'flex items-center gap-1 text-[10px] font-semibold relative z-10',
            isEndingSoon
              ? 'text-destructive animate-pulse'
              : fundingStarted
                ? 'text-neon-orange'
                : 'text-yellow-400/70'
          )}>
            <span>{isEndingSoon ? '🔥' : timerIcon}</span>
            <span>{timerPrefix} {formatBlocksRemaining(blocksToShow)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}