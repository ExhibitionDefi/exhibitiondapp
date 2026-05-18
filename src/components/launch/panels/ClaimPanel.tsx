'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TxModal, type TxStep } from '@/components/ui/TxModal';
import { useClaimTokens } from '@/hooks/contracts/exhibition';
import { cn } from '@/lib/utils';
import { formatAmount } from '@/lib/formatters';
import type { Project } from '@/types/project';                            
import type { ContributionInfo } from '@/types/project';

// ── Flow phase ─────────────────────────────────────────────
type FlowPhase = 'idle' | 'claiming' | 'done' | 'error';

interface ClaimPanelProps {
  launch:       Project;
  contribution: ContributionInfo;
}

export function ClaimPanel({ launch, contribution }: ClaimPanelProps) {
  const { projectId, tokenSymbol, tokenDecimals } = launch;

  const {
    tokensOwed,
    tokensClaimed,
    tokensAvailable,
    tokensVested,
    canClaim,
  } = contribution;

  // ── Flow-phase state machine ──────────────────────────────
  const [phase, setPhase] = useState<FlowPhase>('idle');

  const {
    claim,
    isSuccess:    isClaimSuccess,
    isPending:    isClaimPending,
    isConfirming: isClaimConfirming,
    isError:      isClaimError,
    error:        claimError,
    txHash:       claimTxHash,
    reset,
  } = useClaimTokens();

  // ── Derived ───────────────────────────────────────────────
  const txModalOpen = phase !== 'idle';
  const isLoading   = phase === 'claiming';

  // ── Sync hook flags → phase ───────────────────────────────

  useEffect(() => {
    if (!isClaimSuccess || phase !== 'claiming') return;
    setPhase('done');
  }, [isClaimSuccess, phase]);

  useEffect(() => {
    if (isClaimError && phase === 'claiming') setPhase('error');
  }, [isClaimError, phase]);

  // ── Single step ───────────────────────────────────────────
  const txSteps: TxStep[] = [
    {
      label: `Claim ${formatAmount(tokensAvailable, tokenDecimals)} ${tokenSymbol}`,
      status:
        phase === 'claiming' && isClaimPending    ? 'pending'
      : phase === 'claiming' && isClaimConfirming ? 'confirming'
      : phase === 'done'                          ? 'success'
      : phase === 'error'                         ? 'error'
      : 'idle',
      txHash: claimTxHash ?? undefined,
      error:  phase === 'error' ? (claimError ?? 'Claim failed') : undefined,
    },
  ];

  // ── Button click ──────────────────────────────────────────
  const handleClick = async () => {
    if (!canClaim) return;
    setPhase('claiming');
    const result = await claim(projectId);
    if (result === 'rejected') setPhase('idle');
    // 'error' → useEffect above catches isClaimError and sets phase
    // 'success' → useEffect above catches isClaimSuccess and sets phase
  };

  // ── Modal close ───────────────────────────────────────────
  const handleModalClose = () => {
    if (isLoading) return;
    setPhase('idle');
    reset();
  };

  // ── Button label ──────────────────────────────────────────
  const getButtonLabel = () => {
    if (phase === 'claiming') {
      if (isClaimPending)    return 'Claiming...';
      if (isClaimConfirming) return 'Confirming...';
    }
    return `Claim ${formatAmount(tokensAvailable, tokenDecimals)} ${tokenSymbol}`;
  };

  // ── Progress percentages ──────────────────────────────────
  const claimedPercent = tokensOwed > 0n ? Number((tokensClaimed * 100n) / tokensOwed) : 0;
  const vestedPercent  = tokensOwed > 0n ? Number((tokensVested  * 100n) / tokensOwed) : 0;

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Claim Tokens</h2>

        {/* ── Token allocation overview ──────────────── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total Allocated</span>
            <span className="font-medium text-foreground">
              {formatAmount(tokensOwed, tokenDecimals)} {tokenSymbol}
            </span>
          </div>

          {/* ── Vesting progress bar ──────────────────── */}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="absolute left-0 top-0 h-full bg-neon-blue transition-all"
              style={{ width: `${claimedPercent}%` }}
            />
            <div
              className="absolute top-0 h-full bg-neon-blue/40 transition-all"
              style={{
                left:  `${claimedPercent}%`,
                width: `${Math.max(vestedPercent - claimedPercent, 0)}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{claimedPercent.toFixed(1)}% claimed</span>
            <span>{vestedPercent.toFixed(1)}% vested</span>
          </div>
        </div>

        {/* ── Stats grid ──────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-0.5 rounded-lg bg-muted/30 px-3 py-2">
            <span className="text-[11px] text-muted-foreground">Claimed</span>
            <span className="text-xs font-medium text-foreground">
              {formatAmount(tokensClaimed, tokenDecimals)} {tokenSymbol}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-lg bg-muted/30 px-3 py-2">
            <span className="text-[11px] text-muted-foreground">Vested</span>
            <span className="text-xs font-medium text-foreground">
              {formatAmount(tokensVested, tokenDecimals)} {tokenSymbol}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-lg bg-muted/30 px-3 py-2 col-span-2">
            <span className="text-[11px] text-muted-foreground">Available to Claim</span>
            <span className={cn(
              'text-sm font-semibold',
              canClaim ? 'text-neon-blue' : 'text-muted-foreground'
            )}>
              {formatAmount(tokensAvailable, tokenDecimals)} {tokenSymbol}
            </span>
          </div>
        </div>

        {/* ── No tokens available message ──────────────── */}
        {!canClaim && (
          <p className="text-[11px] text-muted-foreground text-center">
            {tokensVested === tokensClaimed
              ? 'All vested tokens have been claimed'
              : 'No tokens available to claim yet'}
          </p>
        )}

        {/* ── Claim Button ─────────────────────────────── */}
        <Button
          onClick={handleClick}
          disabled={!canClaim || isLoading}
          className={cn(
            'w-full border border-neon-blue/40 bg-neon-blue-tone text-neon-blue',
            'hover:bg-neon-blue/20 disabled:opacity-50'
          )}
        >
          {getButtonLabel()}
        </Button>
      </div>

      {/* ── TxModal ─────────────────────────────────── */}
      <TxModal
        isOpen={txModalOpen}
        onClose={handleModalClose}
        title="Claim Tokens"
        steps={txSteps}
        currentStep={0}
      />
    </>
  );
}