'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TxModal, type TxStep } from '@/components/ui/TxModal';
import { useFinalizeProject } from '@/hooks/contracts/exhibition';
import { formatBlocksRemaining } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';

// ── Flow phase ─────────────────────────────────────────────
type FlowPhase = 'idle' | 'finalizing' | 'done' | 'error';

interface FinalizePanelProps {
  launch:       Project;
  currentBlock: bigint;
}

export function FinalizePanel({ launch, currentBlock }: FinalizePanelProps) {
  const {
    projectId,
    endBlock,
    softCap,
    totalRaised,
    fundingGoalDisplay,
    softCapDisplay,
    totalRaisedDisplay,
    progressPercent,
  } = launch;

  // ── Flow-phase state machine ──────────────────────────────
  const [phase, setPhase] = useState<FlowPhase>('idle');

  const {
    finalizeProject,
    isSuccess:    isFinalizeSuccess,
    isPending:    isFinalizePending,
    isConfirming: isFinalizeConfirming,
    isError:      isFinalizeError,
    error:        finalizeError,
    txHash:       finalizeTxHash,
    reset,
  } = useFinalizeProject();

  // ── Derived ───────────────────────────────────────────────
  const reachedSoftCap = totalRaised >= softCap;
  const blocksOverdue  = currentBlock > endBlock ? currentBlock - endBlock : 0n;
  const txModalOpen    = phase !== 'idle';
  const isLoading      = phase === 'finalizing';

  // ── Sync hook flags → phase ───────────────────────────────

  // Finalize succeeded — defer reset() to handleModalClose so
  // txHash stays alive for the modal's 3 s auto-close display.
  useEffect(() => {
    if (!isFinalizeSuccess || phase !== 'finalizing') return;
    setPhase('done');
  }, [isFinalizeSuccess, phase]);

  // Finalize errored
  useEffect(() => {
    if (isFinalizeError && phase === 'finalizing') setPhase('error');
  }, [isFinalizeError, phase]);

  // ── Single step ───────────────────────────────────────────
  const txSteps: TxStep[] = [
    {
      label: 'Finalize Launch',
      status:
        phase === 'finalizing' && isFinalizePending    ? 'pending'
      : phase === 'finalizing' && isFinalizeConfirming ? 'confirming'
      : phase === 'done'                               ? 'success'
      : phase === 'error'                              ? 'error'
      : 'idle',
      txHash: finalizeTxHash ?? undefined,
      error:  phase === 'error' ? finalizeError ?? undefined : undefined,
    },
  ];

  // ── Button click ──────────────────────────────────────────
  const handleClick = async () => {
    setPhase('finalizing');
    const result = await finalizeProject(projectId)
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
    if (phase === 'finalizing') {
      if (isFinalizePending)    return 'Finalizing...';
      if (isFinalizeConfirming) return 'Confirming...';
    }
    return 'Finalize Launch';
  };

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-neon-orange/30 bg-card p-4">

        {/* ── Header ────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Finalize Launch</h2>
          <span className="rounded-full border border-neon-orange/40 bg-neon-orange-tone px-2 py-0.5 text-[10px] font-medium text-neon-orange">
            Action Required
          </span>
        </div>

        {/* ── Info ────────────────────────────────────── */}
        <p className="text-xs text-muted-foreground">
          The funding period has ended. Anyone can finalize this launch to determine the outcome based on funds raised.
        </p>

        {/* ── Overdue indicator ───────────────────────── */}
        <div className="rounded-lg border border-neon-orange/20 bg-neon-orange-tone px-3 py-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neon-orange">Ended</span>
            <span className="font-medium text-neon-orange">
              {formatBlocksRemaining(blocksOverdue)} ago
            </span>
          </div>
        </div>

        {/* ── Outcome preview ─────────────────────────── */}
        <div className="flex flex-col gap-2 rounded-lg bg-muted/30 px-3 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total Raised</span>
            <span className="font-medium text-foreground">{totalRaisedDisplay}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Soft Cap</span>
            <span className="font-medium text-foreground">{softCapDisplay}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Hard Cap</span>
            <span className="font-medium text-foreground">{fundingGoalDisplay}</span>
          </div>
          <div className="flex items-center justify-between text-xs border-t border-border pt-2 mt-1">
            <span className="text-muted-foreground">Expected Outcome</span>
            <span className={cn(
              'font-semibold',
              reachedSoftCap ? 'text-green-400' : 'text-destructive'
            )}>
              {reachedSoftCap ? '✓ Successful' : '✗ Failed'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">
              {progressPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* ── Submit Button ────────────────────────────── */}
        <Button
          onClick={handleClick}
          disabled={isLoading}
          className={cn(
            'w-full border border-neon-orange/40 bg-neon-orange-tone text-neon-orange',
            'hover:bg-neon-orange/20 disabled:opacity-50'
          )}
        >
          {getButtonLabel()}
        </Button>
      </div>

      {/* ── TxModal ─────────────────────────────────── */}
      <TxModal
        isOpen={txModalOpen}
        onClose={handleModalClose}
        title="Finalize Launch"
        steps={txSteps}
        currentStep={0}
      />
    </>
  );
}