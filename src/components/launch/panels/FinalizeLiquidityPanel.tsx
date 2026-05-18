'use client';

import { useState, useEffect } from 'react';
import { formatAmount } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { TxModal, type TxStep } from '@/components/ui/TxModal';
import { useFinalizeLiquidityAndReleaseFunds } from '@/hooks/contracts/exhibition';
import { useTokenBalance } from '@/hooks/contracts/tokens';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';

// ── Flow phase ─────────────────────────────────────────────
type FlowPhase = 'idle' | 'finalizing' | 'done' | 'error';

// Platform fee in basis points (3% = 300)
const PLATFORM_FEE_BPS = 300n;

interface FinalizeLiquidityPanelProps {
  launch: Project;
}

export function FinalizeLiquidityPanel({ launch }: FinalizeLiquidityPanelProps) {
  const {
    projectId,
    liquidityAdded,
    requiredLiquidityTokens,
    depositedLiquidityTokens,
    totalRaised,
    liquidityPercentage,
    contributionToken,
    projectToken,
  } = launch;

  const isFullyDeposited =
    depositedLiquidityTokens >= requiredLiquidityTokens &&
    requiredLiquidityTokens > 0n;

  // ── Token symbols ─────────────────────────────────────────
  const { symbol: ctSymbol, decimals: ctDecimals } = useTokenBalance({ tokenAddress: contributionToken });
  const { symbol: ptSymbol, decimals: ptDecimals } = useTokenBalance({ tokenAddress: projectToken });

  // ── Financial breakdown ───────────────────────────────────
  // Mirror the contract's exact calculation
  const platformFeeAmount          = (totalRaised * PLATFORM_FEE_BPS) / 10_000n;
  const netRaised                  = totalRaised - platformFeeAmount;
  const contributionTokensForLiq   = (netRaised * BigInt(liquidityPercentage)) / 10_000n;
  const ownerReceives               = netRaised - contributionTokensForLiq;

  // ── Flow phase ────────────────────────────────────────────
  const [phase, setPhase] = useState<FlowPhase>('idle');

  const {
    finalizeLiquidityAndReleaseFunds,
    isSuccess:    isFinalizeSuccess,
    isPending:    isFinalizePending,
    isConfirming: isFinalizeConfirming,
    isError:      isFinalizeError,
    error:        finalizeError,
    txHash:       finalizeTxHash,
    reset,
  } = useFinalizeLiquidityAndReleaseFunds();

  // ── Sync hook flags → phase ───────────────────────────────
  useEffect(() => {
    if (!isFinalizeSuccess || phase !== 'finalizing') return;
    setPhase('done');
  }, [isFinalizeSuccess, phase]);

  useEffect(() => {
    if (isFinalizeError && phase === 'finalizing') setPhase('error');
  }, [isFinalizeError, phase]);

  // ── Derived ───────────────────────────────────────────────
  const txModalOpen = phase !== 'idle';
  const isLoading   = phase === 'finalizing';

  // ── Single step ───────────────────────────────────────────
  const txSteps: TxStep[] = [
    {
      label: 'Finalize Liquidity & Release Funds',
      status:
        phase === 'finalizing' && isFinalizePending    ? 'pending'
      : phase === 'finalizing' && isFinalizeConfirming ? 'confirming'
      : phase === 'done'                               ? 'success'
      : phase === 'error'                              ? 'error'
      : 'idle',
      txHash: finalizeTxHash ?? undefined,
      error:  phase === 'error' ? finalizeError  ?? undefined : undefined,
    },
  ];

  // ── Button click ──────────────────────────────────────────
  const handleClick = async () => {
    setPhase('finalizing');
    const result = await finalizeLiquidityAndReleaseFunds(projectId);
    if (result === 'rejected') setPhase('idle');
  };

  const handleModalClose = () => {
    if (isLoading) return;
    setPhase('idle');
    reset();
  };

  const getButtonLabel = () => {
    if (isFinalizePending)    return 'Finalizing...';
    if (isFinalizeConfirming) return 'Confirming...';
    return 'Finalize Liquidity & Release Funds';
  };

  // ── Already finalized ─────────────────────────────────────
  if (liquidityAdded) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Finalize Liquidity</h2>
          <span className="text-[11px] text-muted-foreground">Owner</span>
        </div>
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-3 text-xs text-green-400 text-center">
          Liquidity finalized — funds released to AMM
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Finalize Liquidity</h2>
          <span className="text-[11px] text-muted-foreground">Owner</span>
        </div>

        {/* ── Financial breakdown ──────────────────────── */}
        <div className="flex flex-col gap-1.5 rounded-lg bg-muted/30 px-3 py-3">
          <span className="text-[11px] font-medium text-muted-foreground mb-1">Breakdown</span>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total Raised</span>
            <span className="font-medium text-foreground">
              {formatAmount(totalRaised, ctDecimals)} {ctSymbol}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Platform Fee (3%)</span>
            <span className="font-medium text-destructive">
              − {formatAmount(platformFeeAmount, ctDecimals)} {ctSymbol}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-border pt-1.5 mt-0.5">
            <span className="text-muted-foreground">Net Raised</span>
            <span className="font-medium text-foreground">
              {formatAmount(netRaised, ctDecimals)} {ctSymbol}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-muted-foreground">
              Liquidity ({Number(liquidityPercentage) / 100}%)
            </span>
            <div className="flex flex-col items-end gap-0.5">
              <span className="font-medium text-neon-blue">
                {formatAmount(contributionTokensForLiq, ctDecimals)} {ctSymbol}
              </span>
              <span className="text-[10px] text-neon-blue/70">
                + {formatAmount(depositedLiquidityTokens, ptDecimals)} {ptSymbol}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-border pt-1.5 mt-0.5">
            <span className="text-muted-foreground font-medium">You Receive</span>
            <span className="font-semibold text-green-400">
              {formatAmount(ownerReceives, ctDecimals)} {ctSymbol}
            </span>
          </div>
        </div>

        {/* ── What happens ────────────────────────────── */}
        <div className="flex flex-col gap-2 rounded-lg bg-muted/30 px-3 py-3 text-xs">
          {[
            'Liquidity added to AMM pool',
            'LP tokens locked for set duration',
            'Raised funds released to owner',
            'Launch status becomes Completed',
          ].map(item => (
            <div key={item} className="flex items-center gap-2 text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-neon-blue/60" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* ── Not fully deposited warning ──────────────── */}
        {!isFullyDeposited && (
          <div className="rounded-lg border border-neon-orange/20 bg-neon-orange-tone px-3 py-2 text-xs text-neon-orange">
            Deposit all required liquidity tokens before finalizing
          </div>
        )}

        {/* ── Submit Button ────────────────────────────── */}
        <Button
          onClick={handleClick}
          disabled={isLoading || !isFullyDeposited}
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
        title="Finalize Liquidity"
        steps={txSteps}
        currentStep={0}
      />
    </>
  );
}