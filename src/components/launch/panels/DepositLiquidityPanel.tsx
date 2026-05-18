'use client';

import { useState, useEffect, useRef } from 'react';
import { formatAmount } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { TxModal, type TxStep } from '@/components/ui/TxModal';
import { useApprove, useTokenBalance, useTokenApproval } from '@/hooks/contracts/tokens';
import { useDepositLiquidityTokens } from '@/hooks/contracts/exhibition';
import { formatBlocksRemaining, formatBlockToDate } from '@/lib/formatters';
import { CONTRACTS } from '@/lib/contracts';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';

// ── Flow phase ─────────────────────────────────────────────
type FlowPhase = 'idle' | 'approving' | 'depositing' | 'done' | 'error';

interface DepositLiquidityPanelProps {
  launch:            Project;
  currentBlock:      bigint;
  liquidityDeadline: bigint;
}

export function DepositLiquidityPanel({
  launch,
  currentBlock,
  liquidityDeadline,
}: DepositLiquidityPanelProps) {
  const {
    projectId,
    projectToken,
    requiredLiquidityTokens,
    depositedLiquidityTokens,
  } = launch;

  // ── Flow-phase state machine ──────────────────────────────
  const [phase, setPhase]                 = useState<FlowPhase>('idle');
  const [txCurrentStep, setTxCurrentStep] = useState(0);
  const flowIsApprove                     = useRef(false);

  const remainingToDeposit = requiredLiquidityTokens > depositedLiquidityTokens
    ? requiredLiquidityTokens - depositedLiquidityTokens
    : 0n;

  const isFullyDeposited    = remainingToDeposit === 0n;
  const blocksUntilDeadline = liquidityDeadline > currentBlock
    ? liquidityDeadline - currentBlock
    : 0n;

  // ── Contribution token balance ────────────────────────────
  const { balance, symbol: ctSymbol, decimals: ctDecimals } = useTokenBalance({
    tokenAddress: projectToken,
  });

  // ── Allowance check ───────────────────────────────────────
  const { allowance, refetch: refetchAllowance } = useTokenApproval({
    tokenAddress:   projectToken,
    spenderAddress: CONTRACTS.Exhibition.address,
    requiredAmount: remainingToDeposit,
  });

  // ── Approve hook ──────────────────────────────────────────
  const {
    approve,
    isSuccess:    isApproveSuccess,
    isPending:    isApprovePending,
    isConfirming: isApproveConfirming,
    isError:      isApproveError,
    error:        approveError,
    txHash:       approveTxHash,
  } = useApprove({
    tokenAddress:   projectToken,
    spenderAddress: CONTRACTS.Exhibition.address,
  });

  // ── Deposit liquidity hook ────────────────────────────────
  const {
    depositLiquidityTokens,
    isSuccess:    isDepositSuccess,
    isPending:    isDepositPending,
    isConfirming: isDepositConfirming,
    isError:      isDepositError,
    error:        depositError,
    txHash:       depositTxHash,
    reset:        resetDeposit,
  } = useDepositLiquidityTokens();

  // ── Derived ───────────────────────────────────────────────
  const needsApproval = allowance < remainingToDeposit;
  const hasBalance    = balance >= remainingToDeposit;
  const txModalOpen   = phase !== 'idle';
  const isLoading     = phase === 'approving' || phase === 'depositing';

  // ── Sync hook flags → phase ───────────────────────────────

  // Approve succeeded → advance step and fire deposit
  useEffect(() => {
    if (!isApproveSuccess || phase !== 'approving') return;
    setTxCurrentStep(1);
    setPhase('depositing');
    refetchAllowance();
    void (async () => {
      const result = await depositLiquidityTokens(projectId, remainingToDeposit);
      if (result === 'rejected') setPhase('idle');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproveSuccess]);

  // Approve errored
  useEffect(() => {
    if (isApproveError && phase === 'approving') setPhase('error');
  }, [isApproveError, phase]);

  // Deposit succeeded — set phase to done.
  // Do NOT call resetDeposit() here; that would wipe txHash
  // before the modal's 3 s auto-close finishes showing the explorer link.
  // resetDeposit is called in handleModalClose instead.
  useEffect(() => {
    if (!isDepositSuccess || phase !== 'depositing') return;
    setPhase('done');
  }, [isDepositSuccess, phase]);

  // Deposit errored
  useEffect(() => {
    if (isDepositError && phase === 'depositing') setPhase('error');
  }, [isDepositError, phase]);

  // ── Build TxModal steps ───────────────────────────────────
  // Gated on flowIsApprove.current so the step count never
  // collapses when needsApproval flips after refetchAllowance.
  const txSteps: TxStep[] = flowIsApprove.current
    ? [
        {
          label: `Approve ${ctSymbol}`,
          status:
            phase === 'approving' && isApprovePending    ? 'pending'
          : phase === 'approving' && isApproveConfirming ? 'confirming'
          : phase === 'error'     && txCurrentStep === 0 ? 'error'
          : (phase === 'depositing' || phase === 'done') ? 'success'
          : 'idle',
          txHash: approveTxHash ?? undefined,
          error:  phase === 'error' && txCurrentStep === 0
                    ? approveError ?? undefined
                    : undefined,
        },
        {
          label: 'Deposit Liquidity',
          status:
            phase === 'depositing' && isDepositPending    ? 'pending'
          : phase === 'depositing' && isDepositConfirming ? 'confirming'
          : phase === 'done'                              ? 'success'
          : phase === 'error' && txCurrentStep === 1      ? 'error'
          : 'idle',
          txHash: depositTxHash ?? undefined,
          error:  phase === 'error' && txCurrentStep === 1
                    ? depositError ?? undefined
                    : undefined,
        },
      ]
    : [
        {
          label: 'Deposit Liquidity',
          status:
            phase === 'depositing' && isDepositPending    ? 'pending'
          : phase === 'depositing' && isDepositConfirming ? 'confirming'
          : phase === 'done'                              ? 'success'
          : phase === 'error'                             ? 'error'
          : 'idle',
          txHash: depositTxHash ?? undefined,
          error:  phase === 'error' ? depositError ?? undefined : undefined,
        },
      ];

  // ── Button click ──────────────────────────────────────────
  const handleClick = async () => {
    if (!hasBalance || isFullyDeposited) return;
    flowIsApprove.current = needsApproval;
    setTxCurrentStep(0);

    if (needsApproval) {
      setPhase('approving');
      const result = await approve(remainingToDeposit);
      if (result === 'rejected') setPhase('idle');
    } else {
      setPhase('depositing');
      const result = await depositLiquidityTokens(projectId, remainingToDeposit);
      if (result === 'rejected') setPhase('idle');
    }
  };

  // ── Modal close ───────────────────────────────────────────
  // resetDeposit is deferred here so txHash stays alive for
  // the full 3 s auto-close success display inside the modal.
  const handleModalClose = () => {
    if (isLoading) return;
    setPhase('idle');
    setTxCurrentStep(0);
    flowIsApprove.current = false;
    resetDeposit();
  };

  // ── Button label ──────────────────────────────────────────
  const getButtonLabel = () => {
    if (phase === 'approving') {
      if (isApprovePending)    return 'Approving...';
      if (isApproveConfirming) return 'Confirming Approval...';
    }
    if (phase === 'depositing') {
      if (isDepositPending)    return 'Depositing...';
      if (isDepositConfirming) return 'Confirming Deposit...';
    }
    if (needsApproval) return 'Approve & Deposit Liquidity';
    return 'Deposit Liquidity Tokens';
  };

  const depositProgress = requiredLiquidityTokens > 0n
    ? Math.min(
        Number((depositedLiquidityTokens * 100n) / requiredLiquidityTokens),
        100
      )
    : 0;

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Deposit Liquidity Tokens
          </h2>
          <span className="text-[11px] text-muted-foreground">Owner</span>
        </div>

        {/* ── Deadline warning ────────────────────────── */}
        {blocksUntilDeadline > 0n && (
          <div className="rounded-lg border border-neon-orange/20 bg-neon-orange-tone px-3 py-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-neon-orange">Deadline</span>
              <span className="font-medium text-neon-orange">
                {formatBlocksRemaining(blocksUntilDeadline)} · {formatBlockToDate(liquidityDeadline, currentBlock)}
              </span>
            </div>
          </div>
        )}

        {/* ── Deposit progress ────────────────────────── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Deposit Progress</span>
            <span className="font-medium text-foreground">
              {depositProgress.toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-neon-blue/60 transition-all"
              style={{ width: `${depositProgress}%` }}
            />
          </div>
        </div>

        {/* ── Amount info ──────────────────────────────── */}
        <div className="flex flex-col gap-2 rounded-lg bg-muted/30 px-3 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Required</span>
            <span className="font-medium text-foreground">
              {formatAmount(requiredLiquidityTokens, ctDecimals)} {ctSymbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Deposited</span>
            <span className="font-medium text-green-400">
              {formatAmount(depositedLiquidityTokens, ctDecimals)} {ctSymbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Remaining</span>
            <span className={cn(
              'font-medium',
              isFullyDeposited ? 'text-green-400' : 'text-foreground'
            )}>
              {formatAmount(remainingToDeposit, ctDecimals)} {ctSymbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs border-t border-border pt-2 mt-1">
            <span className="text-muted-foreground">Your Balance</span>
            <span className={cn(
              'font-medium',
              hasBalance ? 'text-foreground' : 'text-destructive'
            )}>
              {formatAmount(balance, ctDecimals)} {ctSymbol}
            </span>
          </div>
        </div>

        {/* ── Fully deposited message ──────────────────── */}
        {isFullyDeposited ? (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs text-green-400 text-center">
            Liquidity fully deposited — ready to finalize
          </div>
        ) : (
          <>
            {!hasBalance && (
              <p className="text-[11px] text-destructive">Insufficient balance</p>
            )}

            {/* ── Pre-flight step hint (only before modal opens) ── */}
            {needsApproval && phase === 'idle' && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[9px] font-bold">
                  1
                </div>
                <span>Approve {ctSymbol}</span>
                <span>→</span>
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[9px] font-bold">
                  2
                </div>
                <span>Deposit</span>
              </div>
            )}

            {/* ── Submit Button ────────────────────────── */}
            <Button
              onClick={handleClick}
              disabled={isLoading || !hasBalance || isFullyDeposited}
              className={cn(
                'w-full border border-neon-blue/40 bg-neon-blue-tone text-neon-blue',
                'hover:bg-neon-blue/20 disabled:opacity-50'
              )}
            >
              {getButtonLabel()}
            </Button>
          </>
        )}
      </div>

      {/* ── TxModal ─────────────────────────────────── */}
      <TxModal
        isOpen={txModalOpen}
        onClose={handleModalClose}
        title="Deposit Liquidity Tokens"
        steps={txSteps}
        currentStep={txCurrentStep}
      />
    </>
  );
}