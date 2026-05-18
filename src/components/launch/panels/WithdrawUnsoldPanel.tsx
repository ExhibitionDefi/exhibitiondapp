'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TxModal, type TxStep } from '@/components/ui/TxModal';
import { useWithdrawUnsoldTokens } from '@/hooks/contracts/exhibition';
import { formatBlockToDate, formatBlocksRemaining } from '@/lib/formatters';
import { WITHDRAWAL_UNSOLD_DELAY_BLOCKS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { formatAmount } from '@/lib/formatters';
import type { Project } from '@/types/project';

const STATUS_FAILED     = 3;
const STATUS_REFUNDABLE = 5;

type FlowPhase = 'idle' | 'withdrawing' | 'done' | 'error';

interface WithdrawUnsoldPanelProps {
  launch: Project;
  currentBlock: bigint;
}

export function WithdrawUnsoldPanel({ launch, currentBlock }: WithdrawUnsoldPanelProps) {
  const {
    projectId,
    tokenSymbol,
    tokenDecimals,
    amountTokensForSale,
    totalRaised,
    tokenPrice,
    fundingGoal,
    status,
    endBlock,
    contributionTokenDecimals,
  } = launch;

  // ── Withdrawal lock ───────────────────────────────────────
  const unlockBlock     = endBlock + WITHDRAWAL_UNSOLD_DELAY_BLOCKS;
  const isLocked        = currentBlock < unlockBlock;
  const blocksRemaining = isLocked ? unlockBlock - currentBlock : 0n;

  // ── Derive unsold tokens ──────────────────────────────────
  const isFailed = status.code === STATUS_FAILED || status.code === STATUS_REFUNDABLE;

  let unsoldTokens = 0n;

  if (isFailed) {
    unsoldTokens = amountTokensForSale;
  } else {
    if (tokenPrice > 0n && amountTokensForSale > 0n) {
      const tokensAllocated =
        (totalRaised * BigInt(10 ** tokenDecimals) * BigInt(10 ** 18)) /
        (tokenPrice * BigInt(10 ** contributionTokenDecimals));

      unsoldTokens =
        amountTokensForSale > tokensAllocated
          ? amountTokensForSale - tokensAllocated
          : 0n;
    }
  }

  // ── Flow-phase state machine ──────────────────────────────
  const [phase, setPhase] = useState<FlowPhase>('idle');

  const {
    withdrawUnsoldTokens,
    isSuccess:    isWithdrawSuccess,
    isPending:    isWithdrawPending,
    isConfirming: isWithdrawConfirming,
    isError:      isWithdrawError,
    error:        withdrawError,
    txHash:       withdrawTxHash,
    reset,
  } = useWithdrawUnsoldTokens();

  const txModalOpen = phase !== 'idle';
  const isLoading   = phase === 'withdrawing';

  useEffect(() => {
    if (!isWithdrawSuccess || phase !== 'withdrawing') return;
    setPhase('done');
  }, [isWithdrawSuccess, phase]);

  useEffect(() => {
    if (isWithdrawError && phase === 'withdrawing') setPhase('error');
  }, [isWithdrawError, phase]);

  const txSteps: TxStep[] = [
    {
      label: 'Withdraw Unsold Tokens',
      status:
        phase === 'withdrawing' && isWithdrawPending    ? 'pending'
      : phase === 'withdrawing' && isWithdrawConfirming ? 'confirming'
      : phase === 'done'                                ? 'success'
      : phase === 'error'                               ? 'error'
      : 'idle',
      txHash: withdrawTxHash ?? undefined,
      error:  phase === 'error'
                ? (withdrawError ?? 'Withdrawal failed')
                : undefined,
    },
  ];

  const handleClick = async () => {
    if (unsoldTokens === 0n || isLocked) return;
    setPhase('withdrawing');
    const result = await withdrawUnsoldTokens(projectId);
    if (result === 'rejected') setPhase('idle')
  };

  const handleModalClose = () => {
    if (isLoading) return;
    setPhase('idle');
    reset();
  };

  const getButtonLabel = () => {
    if (isLocked) return `Locked · ${formatBlocksRemaining(blocksRemaining)}`;
    if (phase === 'withdrawing') {
      if (isWithdrawPending)    return 'Withdrawing...';
      if (isWithdrawConfirming) return 'Confirming...';
    }
    return 'Withdraw Unsold Tokens';
  };

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Withdraw Unsold Tokens
          </h2>
          <span className="text-[11px] text-muted-foreground">Owner</span>
        </div>

        <p className="text-xs text-muted-foreground">
          {isFailed
            ? 'The launch did not succeed. Withdraw all remaining project tokens.'
            : 'Withdraw project tokens that were not sold during the launch.'}
        </p>

        {/* ── Amount info ───────────────────────────────── */}
        <div className="flex flex-col gap-2 rounded-lg bg-muted/30 px-3 py-3">
          {!isFailed && (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tokens for Sale</span>
                <span className="font-medium text-foreground">
                  {formatAmount(amountTokensForSale, tokenDecimals)} {tokenSymbol}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tokens Sold</span>
                <span className="font-medium text-foreground">
                  {formatAmount(amountTokensForSale - unsoldTokens, tokenDecimals)}{' '}
                  {tokenSymbol}
                </span>
              </div>
            </>
          )}
          <div
            className={cn(
              'flex items-center justify-between text-xs',
              !isFailed && 'border-t border-border pt-2 mt-1'
            )}
          >
            <span className="text-muted-foreground">
              {isFailed ? 'Tokens to Withdraw' : 'Estimated Unsold'}
            </span>
            <span className="font-medium text-neon-orange">
              {formatAmount(unsoldTokens, tokenDecimals)} {tokenSymbol}
            </span>
          </div>
        </div>

        {/* ── Hardcap reached notice ────────────────────── */}
        {unsoldTokens === 0n && (
          <div className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground text-center">
            {totalRaised >= fundingGoal
              ? 'Hardcap reached — all tokens were sold'
              : 'No unsold tokens to withdraw'}
          </div>
        )}

        {/* ── Withdrawal lock countdown ─────────────────── */}
        {unsoldTokens > 0n && (
          isLocked ? (
            <div className="flex flex-col gap-1 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-yellow-400/80">Withdrawal Locked</span>
                <span className="font-medium text-yellow-400">
                  {formatBlocksRemaining(blocksRemaining)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Unlocks at block {unlockBlock.toLocaleString()} · {formatBlockToDate(unlockBlock, currentBlock)}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2">
              <span className="text-xs text-green-400/80">Withdrawal Available</span>
              <span className="text-xs font-medium text-green-400">✓ Unlocked</span>
            </div>
          )
        )}

        <Button
          onClick={handleClick}
          disabled={isLoading || unsoldTokens === 0n || isLocked}
          className={cn(
            'w-full border border-neon-orange/40 bg-neon-orange-tone text-neon-orange',
            'hover:bg-neon-orange/20 disabled:opacity-50',
            isLocked && 'cursor-not-allowed'
          )}
        >
          {getButtonLabel()}
        </Button>
      </div>

      <TxModal
        isOpen={txModalOpen}
        onClose={handleModalClose}
        title="Withdraw Unsold Tokens"
        steps={txSteps}
        currentStep={0}
      />
    </>
  );
}