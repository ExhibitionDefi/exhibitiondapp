'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TxModal, type TxStep } from '@/components/ui/TxModal';
import { useApprove, useTokenBalance, useTokenApproval } from '@/hooks/contracts/tokens';
import { useContribute } from '@/hooks/contracts/exhibition';
import { CONTRACTS } from '@/lib/contracts';
import { cn } from '@/lib/utils';
import { formatAmount } from '@/lib/formatters';
import type { Project } from '@/types/project';


type FlowPhase = 'idle' | 'approving' | 'contributing' | 'done' | 'error';

interface ContributePanelProps {
  launch:               Project;
  existingContribution: bigint;
  contributionDecimals: number;
}

export function ContributePanel({
  launch,
  existingContribution,
  contributionDecimals,
}: ContributePanelProps) {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');

  const [phase, setPhase]                 = useState<FlowPhase>('idle');
  const [txCurrentStep, setTxCurrentStep] = useState(0);
  const flowIsApprove                     = useRef(false);

  const {
    minContribution,
    maxContribution,
    contributionToken,
    projectId,
    fundingGoal,
    totalRaised,
  } = launch;

  const parsedAmount = amount ? parseUnits(amount, contributionDecimals) : 0n;

  const { balance, symbol: tokenSymbol } = useTokenBalance({
    tokenAddress: contributionToken,
  });

  const { allowance, refetch: refetchAllowance } = useTokenApproval({
    tokenAddress:   contributionToken,
    spenderAddress: CONTRACTS.Exhibition.address,
    requiredAmount: parsedAmount,
  });

  const {
    approve,
    isSuccess:    isApproveSuccess,
    isPending:    isApprovePending,
    isConfirming: isApproveConfirming,
    isError:      isApproveError,
    error:        approveError,
    txHash:       approveTxHash,
  } = useApprove({
    tokenAddress:   contributionToken,
    spenderAddress: CONTRACTS.Exhibition.address,
  });

  const {
    contribute,
    isSuccess:    isContributeSuccess,
    isPending:    isContributePending,
    isConfirming: isContributeConfirming,
    isError:      isContributeError,
    error:        contributeError,
    txHash:       contributeTxHash,
    reset:        resetContribute,
  } = useContribute();

  // ── Cap derivation ────────────────────────────────────────
  // Three independent ceilings — the true max is the tightest one
  const walletCap      = balance;
  const perWalletCap   = maxContribution - existingContribution;  // how much more this wallet can put in
  const fundingGapCap  = fundingGoal - totalRaised;               // what the project still needs

  // The actual max the user can contribute right now
  const effectiveMax = [walletCap, perWalletCap, fundingGapCap].reduce(
    (min, val) => (val < min ? val : min),
    walletCap
  );

  // Which ceiling is the binding constraint?
  const cappedByFundingGap  = fundingGapCap  <= walletCap && fundingGapCap  <= perWalletCap;
  const cappedByPerWallet   = !cappedByFundingGap && perWalletCap <= walletCap;
  // cappedByBalance is the fallback (user just doesn't have enough)

  // ── Validation ────────────────────────────────────────────
  const remainingAllowance = maxContribution - existingContribution;
  const needsApproval      = allowance < parsedAmount;

  const isAmountBelowMin  = parsedAmount > 0n && parsedAmount < minContribution;
  const isAmountAboveMax  = parsedAmount > 0n && parsedAmount > effectiveMax;
  const isInsufficientBal = parsedAmount > 0n && parsedAmount > balance;

  // Specific reason for exceeding max — shown as targeted warning
  const exceedsPerWalletCap  = parsedAmount > 0n && parsedAmount > perWalletCap;
  const exceedsFundingGap    = parsedAmount > 0n && parsedAmount > fundingGapCap && !exceedsPerWalletCap;

  const isInvalid =
    !amount ||
    parsedAmount === 0n ||
    isAmountBelowMin ||
    isAmountAboveMax ||
    isInsufficientBal;

  const txModalOpen = phase !== 'idle';
  const isLoading   = phase === 'approving' || phase === 'contributing';

  // ── Effects ───────────────────────────────────────────────
  useEffect(() => {
    if (!isApproveSuccess || phase !== 'approving') return;
    void (async () => {
      setTxCurrentStep(1);
      setPhase('contributing');
      refetchAllowance();
      const result = await contribute(projectId, parsedAmount);
      if (result === 'rejected') setPhase('idle');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproveSuccess]);

  useEffect(() => {
    if (isApproveError && phase === 'approving') setPhase('error');
  }, [isApproveError, phase]);

  useEffect(() => {
    if (!isContributeSuccess || phase !== 'contributing') return;
    setPhase('done');
    setAmount('');
  }, [isContributeSuccess, phase]);

  useEffect(() => {
    if (isContributeError && phase === 'contributing') setPhase('error');
  }, [isContributeError, phase]);

  // ── TxModal steps ─────────────────────────────────────────
  const txSteps: TxStep[] = flowIsApprove.current
    ? [
        {
          label: `Approve ${tokenSymbol}`,
          status:
            phase === 'approving' && isApprovePending    ? 'pending'
          : phase === 'approving' && isApproveConfirming ? 'confirming'
          : phase === 'error'     && txCurrentStep === 0 ? 'error'
          : (phase === 'contributing' || phase === 'done') ? 'success'
          : 'idle',
          txHash: approveTxHash ?? undefined,
          error:  phase === 'error' && txCurrentStep === 0 ? approveError ?? undefined : undefined,
        },
        {
          label: 'Contribute',
          status:
            phase === 'contributing' && isContributePending    ? 'pending'
          : phase === 'contributing' && isContributeConfirming ? 'confirming'
          : phase === 'done'                                    ? 'success'
          : phase === 'error' && txCurrentStep === 1            ? 'error'
          : 'idle',
          txHash: contributeTxHash ?? undefined,
          error:  phase === 'error' && txCurrentStep === 1 ? contributeError ?? undefined : undefined,
        },
      ]
    : [
        {
          label: 'Contribute',
          status:
            phase === 'contributing' && isContributePending    ? 'pending'
          : phase === 'contributing' && isContributeConfirming ? 'confirming'
          : phase === 'done'                                    ? 'success'
          : phase === 'error'                                   ? 'error'
          : 'idle',
          txHash: contributeTxHash ?? undefined,
          error:  phase === 'error' ? contributeError ?? undefined : undefined,
        },
      ];

  // ── Handlers ──────────────────────────────────────────────
  const handleClick = async () => {
    if (!address || isInvalid) return;
    flowIsApprove.current = needsApproval;
    setTxCurrentStep(0);

    if (needsApproval) {
      setPhase('approving');
      const result = await approve(parsedAmount);
      if (result === 'rejected') setPhase('idle');
    } else {
      setPhase('contributing');
      const result = await contribute(projectId, parsedAmount);
      if (result === 'rejected') setPhase('idle');
    }
  };

  const handleModalClose = () => {
    if (isLoading) return;
    setPhase('idle');
    setTxCurrentStep(0);
    flowIsApprove.current = false;
    resetContribute();
  };

  const getButtonLabel = () => {
    if (phase === 'approving') {
      if (isApprovePending)    return 'Approving...';
      if (isApproveConfirming) return 'Confirming Approval...';
    }
    if (phase === 'contributing') {
      if (isContributePending)    return 'Contributing...';
      if (isContributeConfirming) return 'Confirming Contribution...';
    }
    if (needsApproval) return 'Approve & Contribute';
    return 'Contribute';
  };

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Contribute</h2>

        {/* Existing contribution */}
        {existingContribution > 0n && (
          <div className="rounded-lg border border-neon-blue/20 bg-neon-blue-tone px-3 py-2 text-xs">
            <span className="text-muted-foreground">Your contribution: </span>
            <span className="font-medium text-neon-blue">
              {formatAmount(existingContribution, contributionDecimals)} {tokenSymbol}
            </span>
          </div>
        )}

        {/* Funding gap notice — always visible so user knows the ceiling */}
        {fundingGapCap > 0n && cappedByFundingGap && (
          <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/5 px-3 py-2 text-[11px] text-yellow-400/80">
            Only{' '}
            <span className="font-semibold text-yellow-400">
              {formatAmount(fundingGapCap, contributionDecimals)} {tokenSymbol}
            </span>{' '}
            needed to hit the funding goal — max you can contribute is capped to this.
          </div>
        )}

        {/* Amount input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Amount</Label>
            <button
              onClick={() => setAmount(formatUnits(effectiveMax, contributionDecimals))}
              className="text-[11px] text-neon-blue hover:underline"
            >
              Max: {formatUnits(effectiveMax, contributionDecimals)} {tokenSymbol}
            </button>
          </div>

          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={cn(
                'pr-16 bg-muted/30 border-border text-sm',
                (isAmountBelowMin || isAmountAboveMax || isInsufficientBal) && 'border-destructive'
              )}
              disabled={isLoading}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {tokenSymbol}
            </span>
          </div>

          {/* Validation messages — targeted to the actual problem */}
          {isAmountBelowMin && (
            <p className="text-[11px] text-destructive">
              Minimum contribution is{' '}
              {formatAmount(minContribution, contributionDecimals)} {tokenSymbol}
            </p>
          )}
          {isInsufficientBal && !exceedsPerWalletCap && !exceedsFundingGap && (
            <p className="text-[11px] text-destructive">
              Insufficient balance — you have{' '}
              {formatAmount(balance, contributionDecimals)} {tokenSymbol}
            </p>
          )}
          {exceedsFundingGap && (
            <p className="text-[11px] text-yellow-400">
              Project only needs{' '}
              {formatAmount(fundingGapCap, contributionDecimals)} {tokenSymbol} more.{' '}
              <button
                className="underline"
                onClick={() => setAmount(formatUnits(fundingGapCap, contributionDecimals))}
              >
                Fill the gap
              </button>
            </p>
          )}
          {exceedsPerWalletCap && !exceedsFundingGap && (
            <p className="text-[11px] text-destructive">
              Your wallet limit is{' '}
              {formatAmount(maxContribution, contributionDecimals)} {tokenSymbol} — you can still add{' '}
              {formatAmount(perWalletCap, contributionDecimals)} {tokenSymbol}.{' '}
              <button
                className="underline text-neon-blue"
                onClick={() => setAmount(formatUnits(perWalletCap, contributionDecimals))}
              >
                Use max
              </button>
            </p>
          )}
        </div>

        {/* Limits + balance info */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Min / Max per wallet</span>
            <span>
              {formatAmount(minContribution, contributionDecimals)} /{' '}
              {formatAmount(maxContribution, contributionDecimals)} {tokenSymbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Remaining to goal</span>
            <span className={cn(
              cappedByFundingGap ? 'text-yellow-400/80' : ''
            )}>
              {formatAmount(fundingGapCap, contributionDecimals)} {tokenSymbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Wallet Balance</span>
            <span>{formatAmount(balance, contributionDecimals)} {tokenSymbol}</span>
          </div>
        </div>

        {/* Pre-flight step hint */}
        {needsApproval && parsedAmount > 0n && phase === 'idle' && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[9px] font-bold">1</div>
            <span>Approve {tokenSymbol}</span>
            <span>→</span>
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[9px] font-bold">2</div>
            <span>Contribute</span>
          </div>
        )}

        {/* Submit */}
        <Button
          onClick={handleClick}
          disabled={isInvalid || isLoading || !address}
          className={cn(
            'w-full border border-neon-blue/40 bg-neon-blue-tone text-neon-blue',
            'hover:bg-neon-blue/20 disabled:opacity-50'
          )}
        >
          {getButtonLabel()}
        </Button>
      </div>

      <TxModal
        isOpen={txModalOpen}
        onClose={handleModalClose}
        title="Contribute to Launch"
        steps={txSteps}
        currentStep={txCurrentStep}
      />
    </>
  );
}