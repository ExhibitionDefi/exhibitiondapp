'use client';

import { useAccount }                   from 'wagmi';
import { useUserContribution }          from '@/hooks/contracts/exhibition';
import { useEmergencyRefundAvailable }  from '@/hooks/contracts/exhibition';
import { ContributePanel }              from './ContributePanel';
import { ClaimPanel }                   from './ClaimPanel';
import { RefundPanel }                  from './RefundPanel';
import { DepositTokensPanel }           from './DepositTokensPanel';
import { DepositLiquidityPanel }        from './DepositLiquidityPanel';
import { FinalizeLiquidityPanel }       from './FinalizeLiquidityPanel';
import { FinalizePanel }                from './FinalizePanel';
import { WithdrawUnsoldPanel }          from './WithdrawUnsoldPanel';
import type { Project }                 from '@/types/project';
import { ContributionSummaryPanel }     from './ContributionSummaryPanel';
import { CreatorSummaryPanel } from './CreatorSummaryPanel';

interface ActionPanelProps {
  launch: Project;
  currentBlock:  bigint;
}

export function ActionPanel({ launch, currentBlock }: ActionPanelProps) {
  const { address }          = useAccount();

  const { projectId, owner, status, endBlock, startBlock, fundingGoal } = launch;

  // ── User contribution data ────────────────────────────
  const {
    contribution,
    hasContributed,
  } = useUserContribution(projectId);

  // ── Emergency refund status ───────────────────────────
  const { status: emergencyStatus } = useEmergencyRefundAvailable(projectId);

  // ── Contribution token decimals ───────────────────────
  const contributionDecimals = launch.contributionTokenDecimals;

  if (!currentBlock) return null;

  // ── Derived conditions ────────────────────────────────
  const isOwner       = !!address && address.toLowerCase() === owner.toLowerCase();
  const fundingEnded  = currentBlock > endBlock && status.label === 'Active';
  const fundingStarted = currentBlock >= startBlock;
  const fundingGoalReached = fundingGoal > 0n && launch.totalRaised >= fundingGoal;
  const statusLabel   = status.label;

  const isActive      = statusLabel === 'Active';
  const isUpcoming    = statusLabel === 'Upcoming';
  const isSuccessful  = statusLabel === 'Successful';
  const isClaimable   = statusLabel === 'Claimable';
  const isCompleted   = statusLabel === 'Completed';
  const isFailed      = statusLabel === 'Failed';
  const isRefundable  = statusLabel === 'Refundable';

  const canContribute   = isActive && fundingStarted && !fundingEnded && !!address && !isOwner;
  const canClaim        = (isSuccessful || isClaimable || isCompleted)
                          && hasContributed
                          && !!contribution?.canClaim && !isOwner;
  const canRefund       = (isFailed || isRefundable)
                          && hasContributed
                          && !contribution?.userHasRefunded && !isOwner;
  const canEmergency    = !!emergencyStatus?.available
                          && hasContributed
                          && !contribution?.userHasRefunded && !isOwner;
  const showFinalize    = isActive && fundingEnded;

  // ── Owner conditions ──────────────────────────────────
  const showDepositTokens    = isOwner && isUpcoming;
  const showDepositLiquidity = isOwner
                               && (isSuccessful || isClaimable)
                               && !emergencyStatus?.available
                               && launch.depositedLiquidityTokens < launch.requiredLiquidityTokens;
  const showFinalizeLiquidity = isOwner
                                && (isSuccessful || isClaimable)
                                && launch.depositedLiquidityTokens >= launch.requiredLiquidityTokens
                                && launch.requiredLiquidityTokens > 0n;
  const showWithdrawUnsold   = isOwner && ( (isCompleted && !fundingGoalReached) || isRefundable || isFailed) && 
                               !launch.unsoldTokensWithdrawn;;

  // ── Nothing to show ───────────────────────────────────
  const hasAnyPanel =
    canContribute     ||
    canClaim          ||
    canRefund         ||
    canEmergency      ||
    showFinalize      ||
    showDepositTokens ||
    showDepositLiquidity ||
    showFinalizeLiquidity ||
    showWithdrawUnsold;

  if (!address) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <p className="text-center text-sm text-muted-foreground">
          Connect your wallet to interact with this launch
        </p>
      </div>
    );
  }

  if (!hasAnyPanel) {
    if (hasContributed && !isOwner) {
      return <ContributionSummaryPanel launch={launch} currentBlock={currentBlock} />;
    }
    if (isOwner && (isCompleted || ((isFailed || isRefundable) && launch.unsoldTokensWithdrawn))) {
      return <CreatorSummaryPanel launch={launch} />;
    }
    return (
     <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <p className="text-center text-sm text-muted-foreground">
          No actions available for this launch
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Public: Finalize (anyone) ─────────────────── */}
      {showFinalize && (
        <FinalizePanel launch={launch} currentBlock={currentBlock} />
      )}

      {/* ── Contributor: Contribute ───────────────────── */}
      {canContribute && (
        <ContributePanel
          launch={launch}
          existingContribution={contribution?.contributionAmount ?? 0n}
          contributionDecimals={contributionDecimals}
        />
      )}

      {/* ── Contributor: Claim ────────────────────────── */}
      {canClaim && contribution && (
        <ClaimPanel
          launch={launch}
          contribution={contribution}
        />
      )}

      {/* ── Contributor: Emergency Refund ─────────────── */}
      {canEmergency && contribution && (
        <RefundPanel
          launch={launch}
          contribution={contribution}
          contributionDecimals={contributionDecimals}
          isEmergency
        />
      )}

      {/* ── Contributor: Normal Refund ────────────────── */}
      {canRefund && contribution && (
        <RefundPanel
          launch={launch}
          contribution={contribution}
          contributionDecimals={contributionDecimals}
        />
      )}

      {/* ── Owner: Deposit Project Tokens ─────────────── */}
      {showDepositTokens && (
        <DepositTokensPanel launch={launch} />
      )}
      
      {/* ── Owner: Deposit Liquidity Tokens ───────────── */}
      {showDepositLiquidity && (
        <DepositLiquidityPanel
          launch={launch}
          currentBlock={currentBlock}
          liquidityDeadline={emergencyStatus?.deadlineBlock ?? 0n}
        />
      )}

      {/* ── Owner: Finalize Liquidity ─────────────────── */}
      {showFinalizeLiquidity && (
        <FinalizeLiquidityPanel launch={launch} />
      )}

      {/* ── Owner: Withdraw Unsold ────────────────────── */}
      {showWithdrawUnsold && (
        <WithdrawUnsoldPanel launch={launch} currentBlock={currentBlock} />
      )}

    </div>
  );
}