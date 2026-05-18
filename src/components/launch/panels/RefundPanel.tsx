'use client';

import { useState, useEffect } from 'react';
import { formatAmount } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { TxModal, type TxStep } from '@/components/ui/TxModal';
import { useRequestRefund, useEmergencyRefund } from '@/hooks/contracts/exhibition';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';
import type { ContributionInfo } from '@/types/project';

// ── Flow phase ─────────────────────────────────────────────
type FlowPhase = 'idle' | 'refunding' | 'done' | 'error';

interface RefundPanelProps {
  launch:               Project;
  contribution:         ContributionInfo;
  contributionDecimals: number;
  isEmergency?:         boolean;
}

export function RefundPanel({
  launch,
  contribution,
  contributionDecimals,
  isEmergency = false,
}: RefundPanelProps) {
  const { projectId } = launch;
  const { contributionAmount, userHasRefunded } = contribution;

  // ── Flow-phase state machine ──────────────────────────────
  const [phase, setPhase] = useState<FlowPhase>('idle');

  // ── Normal refund hook ─────────────────────────────────────
  const {
    requestRefund,
    isSuccess:    isRefundSuccess,
    isPending:    isRefundPending,
    isConfirming: isRefundConfirming,
    isError:      isRefundError,
    error:        refundError,
    txHash:       refundTxHash,
    reset:        resetRefund,
  } = useRequestRefund();

  // ── Emergency refund hook ─────────────────────────────────
  const {
    requestEmergencyRefund,
    isSuccess:    isEmergencySuccess,
    isPending:    isEmergencyPending,
    isConfirming: isEmergencyConfirming,
    isError:      isEmergencyError,
    error:        emergencyError,
    txHash:       emergencyTxHash,
    reset:        resetEmergency,
  } = useEmergencyRefund();

  // ── Unified aliases (only one hook is ever active) ────────
  const isSuccess    = isEmergency ? isEmergencySuccess    : isRefundSuccess;
  const isPending    = isEmergency ? isEmergencyPending    : isRefundPending;
  const isConfirming = isEmergency ? isEmergencyConfirming : isRefundConfirming;
  const isError      = isEmergency ? isEmergencyError      : isRefundError;
  const txHash       = isEmergency ? emergencyTxHash       : refundTxHash;
  const hookError    = isEmergency ? emergencyError        : refundError;
  const reset        = isEmergency ? resetEmergency        : resetRefund;

  // ── Derived ───────────────────────────────────────────────
  const txModalOpen = phase !== 'idle';
  const isLoading   = phase === 'refunding';

  // ── Sync hook flags → phase ───────────────────────────────

  // Succeeded — defer reset() to handleModalClose so txHash
  // stays alive for the modal's 3 s auto-close display.
  useEffect(() => {
    if (!isSuccess || phase !== 'refunding') return;
    setPhase('done');
  }, [isSuccess, phase]);

  // Errored
  useEffect(() => {
    if (isError && phase === 'refunding') setPhase('error');
  }, [isError, phase]);

  // ── Single step ───────────────────────────────────────────
  const stepLabel = isEmergency ? 'Request Emergency Refund' : 'Request Refund';

  const txSteps: TxStep[] = [
    {
      label: stepLabel,
      status:
        phase === 'refunding' && isPending    ? 'pending'
      : phase === 'refunding' && isConfirming ? 'confirming'
      : phase === 'done'                      ? 'success'
      : phase === 'error'                     ? 'error'
      : 'idle',
      txHash: txHash ?? undefined,
      error:  phase === 'error'
                ? (hookError ?? 'Refund request failed')
                : undefined,
    },
  ];

  // ── Button click ──────────────────────────────────────────
  const handleClick = async () => {
    setPhase('refunding');
    const fn = isEmergency ? requestEmergencyRefund : requestRefund;
    const result = await fn(projectId);
    if (result === 'rejected') setPhase('idle');
  };

  // ── Modal close ───────────────────────────────────────────
  // reset() deferred here so txHash stays alive for the full
  // 3 s auto-close success display inside the modal.
  const handleModalClose = () => {
    if (isLoading) return;
    setPhase('idle');
    reset();
  };

  // ── Button label ──────────────────────────────────────────
  const getButtonLabel = () => {
    if (phase === 'refunding') {
      if (isPending)    return 'Requesting...';
      if (isConfirming) return 'Confirming...';
    }
    if (isEmergency) return 'Request Emergency Refund';
    return 'Request Refund';
  };

  // ── Already refunded ──────────────────────────────────────
  if (userHasRefunded) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">
          {isEmergency ? 'Emergency Refund' : 'Refund'}
        </h2>
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-3 text-xs text-green-400 text-center">
          Refund already processed
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn(
        'flex flex-col gap-4 rounded-xl border bg-card p-4',
        isEmergency ? 'border-neon-orange/30' : 'border-border'
      )}>
        <h2 className="text-sm font-semibold text-foreground">
          {isEmergency ? 'Emergency Refund' : 'Refund'}
        </h2>

        {/* ── Emergency warning ───────────────────────── */}
        {isEmergency && (
          <div className="rounded-lg border border-neon-orange/20 bg-neon-orange-tone px-3 py-2 text-xs text-neon-orange">
            The launch owner missed the liquidity deadline. You are eligible for an emergency refund.
          </div>
        )}

        {/* ── Refund amount ───────────────────────────── */}
        <div className="flex flex-col gap-2 rounded-lg bg-muted/30 px-3 py-3">
          <span className="text-[11px] text-muted-foreground">Refund Amount</span>
          <span className="text-lg font-semibold text-foreground">
            {formatAmount(contributionAmount, contributionDecimals)} {launch.contributionTokenSymbol}
          </span>
          <span className="text-[11px] text-muted-foreground">
            Your full contribution will be returned
          </span>
        </div>

        {/* ── Refund Button ───────────────────────────── */}
        <Button
          onClick={handleClick}
          disabled={isLoading}
          className={cn(
            'w-full',
            isEmergency
              ? 'border border-neon-orange/40 bg-neon-orange-tone text-neon-orange hover:bg-neon-orange/20'
              : 'border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20'
          )}
        >
          {getButtonLabel()}
        </Button>
      </div>

      {/* ── TxModal ─────────────────────────────────── */}
      <TxModal
        isOpen={txModalOpen}
        onClose={handleModalClose}
        title={isEmergency ? 'Emergency Refund' : 'Request Refund'}
        steps={txSteps}
        currentStep={0}
      />
    </>
  );
}