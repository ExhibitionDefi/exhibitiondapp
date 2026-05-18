'use client';

import { useState, useEffect, useRef } from 'react';
import { formatAmount } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { TxModal, type TxStep } from '@/components/ui/TxModal';
import { useApprove, useTokenBalance, useTokenApproval } from '@/hooks/contracts/tokens';
import { useDepositTokens } from '@/hooks/contracts/exhibition';
import { CONTRACTS } from '@/lib/contracts';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';


// ── Flow phase ─────────────────────────────────────────────
type FlowPhase = 'idle' | 'approving' | 'depositing' | 'done' | 'error';

interface DepositTokensPanelProps {
  launch: Project;
}

export function DepositTokensPanel({ launch }: DepositTokensPanelProps) {
  const {
    projectId,
    projectToken,
    tokenSymbol,
    tokenDecimals,
    amountTokensForSale,
  } = launch;

  // ── Flow-phase state machine ──────────────────────────────
  const [phase, setPhase]                 = useState<FlowPhase>('idle');
  const [txCurrentStep, setTxCurrentStep] = useState(0);
  // snapshot whether this flow started needing approval
  const flowIsApprove = useRef(false);

  // ── Token balance ─────────────────────────────────────────
  const { balance } = useTokenBalance({
    tokenAddress: projectToken,
  });

  // ── Allowance check ───────────────────────────────────────
  const { allowance, refetch: refetchAllowance } = useTokenApproval({
    tokenAddress:   projectToken,
    spenderAddress: CONTRACTS.Exhibition.address,
    requiredAmount: amountTokensForSale,
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

  // ── Deposit hook ──────────────────────────────────────────
  const {
    depositTokens,
    isSuccess:    isDepositSuccess,
    isPending:    isDepositPending,
    isConfirming: isDepositConfirming,
    isError:      isDepositError,
    error:        depositError,
    txHash:       depositTxHash,
    reset:        resetDeposit,
  } = useDepositTokens();

  // ── Derived ───────────────────────────────────────────────
  const needsApproval = allowance < amountTokensForSale;
  const hasBalance    = balance >= amountTokensForSale;

  const txModalOpen = phase !== 'idle';
  const isLoading   = phase === 'approving' || phase === 'depositing';


  // ── Sync hook flags → phase ───────────────────────────────

  // Approve succeeded → advance step and fire deposit
  useEffect(() => {
    if (!isApproveSuccess || phase !== 'approving') return;
    setTxCurrentStep(1);
    setPhase('depositing');
    refetchAllowance();
    void (async () => {
      const result = await depositTokens(projectId, amountTokensForSale);
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
          label: `Approve ${tokenSymbol}`,
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
          label: 'Deposit Tokens',
          status:
            phase === 'depositing' && isDepositPending    ? 'pending'
          : phase === 'depositing' && isDepositConfirming ? 'confirming'
          : phase === 'done'                              ? 'success'
          : phase === 'error' && txCurrentStep === 1      ? 'error'
          : 'idle',
          txHash: depositTxHash ?? undefined,
          error: phase === 'error' && txCurrentStep === 1 ? depositError ?? undefined : undefined,
        },
      ]
    : [
        {
          label: 'Deposit Tokens',
          status:
            phase === 'depositing' && isDepositPending    ? 'pending'
          : phase === 'depositing' && isDepositConfirming ? 'confirming'
          : phase === 'done'                              ? 'success'
          : phase === 'error'                             ? 'error'
          : 'idle',
          txHash: depositTxHash ?? undefined,
          error: phase === 'error' ? depositError ?? undefined : undefined,
        },
      ];
      
  // ── Button click ──────────────────────────────────────────
  const handleClick = async () => {
    if (!hasBalance) return;
    flowIsApprove.current = needsApproval;
    setTxCurrentStep(0);

    if (needsApproval) {
      setPhase('approving');
      const result = await approve(amountTokensForSale);
      if (result === 'rejected') setPhase('idle');
    } else {
      setPhase('depositing');
      const result = await depositTokens(projectId, amountTokensForSale);
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
    if (needsApproval) return 'Approve & Deposit';
    return 'Deposit Project Tokens';
  };

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Deposit Project Tokens
          </h2>
          <span className="text-[11px] text-muted-foreground">Owner</span>
        </div>

        {/* ── Info ────────────────────────────────────── */}
        <p className="text-xs text-muted-foreground">
          Deposit the required project tokens to activate your launch and open it for contributions.
        </p>

        {/* ── Amount info ─────────────────────────────── */}
        <div className="flex flex-col gap-2 rounded-lg bg-muted/30 px-3 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Required Amount</span>
            <span className="font-medium text-foreground">
              {formatAmount(amountTokensForSale, tokenDecimals)} {tokenSymbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Your Balance</span>
            <span className={cn(
              'font-medium',
              hasBalance ? 'text-green-400' : 'text-destructive'
            )}>
              {formatAmount(balance, tokenDecimals)} {tokenSymbol}
            </span>
          </div>
        </div>

        {/* ── Insufficient balance warning ─────────────── */}
        {!hasBalance && (
          <p className="text-[11px] text-destructive">
            Insufficient balance. You need{' '}
            {formatAmount(amountTokensForSale, tokenDecimals)} {tokenSymbol} to activate this launch.
          </p>
        )}

        {/* ── Pre-flight step hint (only before modal opens) ── */}
        {needsApproval && phase === 'idle' && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[9px] font-bold">
              1
            </div>
            <span>Approve {tokenSymbol}</span>
            <span>→</span>
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[9px] font-bold">
              2
            </div>
            <span>Deposit</span>
          </div>
        )}

        {/* ── Submit Button ────────────────────────────── */}
        <Button
          onClick={handleClick}
          disabled={isLoading || !hasBalance}
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
        title="Deposit Project Tokens"
        steps={txSteps}
        currentStep={txCurrentStep}
      />
    </>
  );
}