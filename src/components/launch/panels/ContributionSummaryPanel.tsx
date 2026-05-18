'use client';

import { useUserContribution } from '@/hooks/contracts/exhibition';
import { useUserVestingInfo }  from '@/hooks/contracts/exhibition';
import { useVestingInfo }      from '@/hooks/contracts/exhibition';
import { formatAmount, blocksToRealDays } from '@/lib/formatters';
import type { Project } from '@/types/project';

interface ContributionSummaryPanelProps {
  launch:       Project;
  currentBlock: bigint;
}

export function ContributionSummaryPanel({ launch, currentBlock }: ContributionSummaryPanelProps) {
  const { projectId, tokenSymbol, tokenDecimals } = launch;

  const { contribution } = useUserContribution(projectId);
  const { vesting: userVesting } = useUserVestingInfo(projectId);
  const { vesting: projectVesting } = useVestingInfo(projectId);

  if (!contribution) return null;

  if (contribution.userHasRefunded) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Your Contribution</h2>
        <div className="flex items-center gap-3 rounded-lg border border-muted/30 bg-muted/10 px-3 py-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-muted/40 bg-muted/20">
            <span className="text-sm text-muted-foreground">✓</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-foreground">Refund processed</span>
            <span className="text-[11px] text-muted-foreground">
              Your contribution has been returned to your wallet
            </span>
          </div>
        </div>
      </div>
    );
  }

  const isVesting = projectVesting?.enabled;

  // ── Vesting-aware amounts ─────────────────────────────
  const claimedAmount = (userVesting?.totalAmount ?? 0n) > 0n
    ? (userVesting?.releasedAmount ?? 0n)
    : (contribution.tokensClaimed ?? 0n);

  // ── Progress ──────────────────────────────────────────
  const claimedPercent = contribution.tokensOwed > 0n
    ? Number((claimedAmount * 100n) / contribution.tokensOwed)
    : 0;

  const vestedPercent = contribution.tokensOwed > 0n && isVesting
    ? Number(((userVesting?.vestedAmount ?? 0n) * 100n) / contribution.tokensOwed)
    : claimedPercent;

  // ── Cliff countdown ───────────────────────────────────
  const cliffBlocksRemaining = currentBlock && launch.successBlock > 0n
    ? launch.successBlock + (projectVesting?.cliffBlocks ?? 0n) > currentBlock
      ? launch.successBlock + (projectVesting?.cliffBlocks ?? 0n) - currentBlock
      : 0n
    : 0n;

  const beforeCliff        = cliffBlocksRemaining > 0n;
  const cliffDaysRemaining = Number(blocksToRealDays(cliffBlocksRemaining));

  // ── Next interval countdown ───────────────────────────
  const blocksToNextClaim =
    userVesting && currentBlock && userVesting.nextClaimBlock > currentBlock
      ? userVesting.nextClaimBlock - currentBlock
      : 0n;

  const daysToNextClaim = Number(blocksToRealDays(blocksToNextClaim));

  // ── Fully claimed ─────────────────────────────────────
  const isFullyClaimed = contribution.tokensOwed > 0n
    && claimedAmount >= contribution.tokensOwed;
    
  console.log({
    successBlock: launch.successBlock?.toString(),
    currentBlock: currentBlock?.toString(),
    cliffBlocks: projectVesting?.cliffBlocks?.toString(),
    cliffBlocksRemaining: cliffBlocksRemaining?.toString(),
    beforeCliff,
    isVesting,
  });

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">Your Contribution</h2>

      {/* ── Contribution amount ───────────────────────── */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Contributed</span>
        <span className="font-medium text-foreground">
          {formatAmount(contribution.contributionAmount, launch.contributionTokenDecimals)}{' '}
          {launch.contributionTokenSymbol}
        </span>
      </div>

      {/* ── Total allocated ───────────────────────────── */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Total Allocated</span>
        <span className="font-medium text-foreground">
          {formatAmount(contribution.tokensOwed, tokenDecimals)} {tokenSymbol}
        </span>
      </div>

      {/* ── Progress bar ──────────────────────────────── */}
      {contribution.tokensOwed > 0n && (
        <div className="flex flex-col gap-1.5">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="absolute left-0 top-0 h-full bg-neon-blue transition-all"
              style={{ width: `${claimedPercent}%` }}
            />
            {isVesting && (
              <div
                className="absolute top-0 h-full bg-neon-blue/40 transition-all"
                style={{
                  left:  `${claimedPercent}%`,
                  width: `${Math.max(vestedPercent - claimedPercent, 0)}%`,
                }}
              />
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{claimedPercent.toFixed(1)}% claimed</span>
            {isVesting && <span>{vestedPercent.toFixed(1)}% vested</span>}
          </div>
        </div>
      )}

      {/* ── Claimed ───────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Claimed</span>
        <span className="font-medium text-foreground">
          {formatAmount(claimedAmount, tokenDecimals)} {tokenSymbol}
        </span>
      </div>

      {/* ── Status row ────────────────────────────────── */}
      {isFullyClaimed ? (
        <p className="text-center text-[11px] text-muted-foreground">
          All tokens have been claimed
        </p>
      ) : isVesting && beforeCliff ? (
        <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-xs">
          <span className="text-muted-foreground">Cliff ends in</span>
          <span className="font-medium text-neon-blue/70">
            {cliffDaysRemaining.toFixed(1)}d
          </span>
        </div>
      ) : isVesting && blocksToNextClaim > 0n ? (
        <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-xs">
          <span className="text-muted-foreground">Next unlock in</span>
          <span className="font-medium text-neon-blue/70">
            {daysToNextClaim.toFixed(1)}d
          </span>
        </div>
      ) : null}
    </div>
  );
}