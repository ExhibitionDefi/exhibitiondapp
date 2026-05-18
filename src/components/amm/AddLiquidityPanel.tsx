'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useBlockNumber } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import type { Address } from 'viem';
import { useAddAMMLiquidity, usePoolReserves, useLocalPricing } from '@/hooks/contracts/amm';
import { useApprove, useTokenApproval, useTokenBalance } from '@/hooks/contracts/tokens';
import { TokenSelector } from '@/components/amm/TokenSelector';
import { PriceDisplay } from '@/components/amm/PriceDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TxModal, type TxStep } from '@/components/ui/TxModal';
import { CONTRACTS } from '@/lib/contracts';
import { cn } from '@/lib/utils';
import { type WriteResult } from '@/lib/parseContractError';
import type { TokenInfo } from '@/hooks/contracts/amm';

const DEADLINE_BLOCKS = 300n;
const DEFAULT_TOKEN_A = process.env.NEXT_PUBLIC_NEXUS_USD_ADDRESS! as Address;

// ── Which approvals were needed at click time ──────────────
// Captured once in handleSubmit and never mutated during the flow.
type FlowApprovalSnapshot = 'none' | 'a' | 'b' | 'ab';

// ── Flow phase ─────────────────────────────────────────────
type FlowPhase =
  | 'idle'
  | 'approving-a'
  | 'approving-b'
  | 'adding'
  | 'done'
  | 'error';

interface AddLiquidityPanelProps {
  initialTokenA?: Address;
  initialTokenB?: Address;
}

export function AddLiquidityPanel({
  initialTokenA = DEFAULT_TOKEN_A,
  initialTokenB,
}: AddLiquidityPanelProps) {
  const { address }            = useAccount();
  const { refetch: refetchBlock } = useBlockNumber({
    watch: false, 
    query: {
      refetchOnMount:       true,
      refetchOnWindowFocus: true,
      staleTime:            10_000,
    }
  
  });

  const [tokenA,  setTokenA]  = useState<Address>(initialTokenA);
  const [tokenB,  setTokenB]  = useState<Address | null>(initialTokenB ?? null);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');

  // ── Flow-phase state machine ──────────────────────────────
  const [phase,         setPhase]         = useState<FlowPhase>('idle');
  const [txCurrentStep, setTxCurrentStep] = useState(0);
  // Snapshot of which approvals were needed at submit time — keeps
  // the txSteps array stable even after refetchAllowance flips the live flags.
  const flowApprovals = useRef<FlowApprovalSnapshot>('none');

  const { balance: balanceA, decimals: decimalsA, symbol: symbolA } = useTokenBalance({ tokenAddress: tokenA });
  const { balance: balanceB, decimals: decimalsB, symbol: symbolB } = useTokenBalance({ tokenAddress: tokenB });

  const { reserveA, reserveB } = usePoolReserves(tokenA, tokenB ?? tokenA);
  const { getTokenPrice, calculateTVL } = useLocalPricing();

  const parsedA = amountA && !isNaN(Number(amountA)) ? parseUnits(amountA, decimalsA) : 0n;
  const parsedB = amountB && !isNaN(Number(amountB)) ? parseUnits(amountB, decimalsB) : 0n;

  // ── Auto-calculate tokenB based on pool ratio ─────────────
  useEffect(() => {
    if (tokenB && reserveA > 0n && reserveB > 0n && parsedA > 0n) {
      const bAmount = (parsedA * reserveB) / reserveA;
      setAmountB(formatUnits(bAmount, decimalsB));
    }
  }, [amountA, reserveA, reserveB, decimalsB, tokenB]);

  // ── USD values ────────────────────────────────────────────
  const priceA = getTokenPrice(tokenA);
  const priceB = tokenB ? getTokenPrice(tokenB) : null;

  const depositValue =
    parsedA > 0n && parsedB > 0n
      ? (priceA ?? 0) * Number(formatUnits(parsedA, decimalsA)) +
        (priceB ?? 0) * Number(formatUnits(parsedB, decimalsB))
      : 0;

  const poolTVL =
    tokenB && reserveA > 0n && reserveB > 0n
      ? calculateTVL(tokenA, reserveA, tokenB, reserveB, decimalsA, decimalsB)
      : 0;

  // ── Allowances ────────────────────────────────────────────
  const { allowance: allowanceA, refetch: refetchAllowanceA } = useTokenApproval({
    tokenAddress:   tokenA,
    spenderAddress: CONTRACTS.ExhibitionAMM.address,
    requiredAmount: parsedA,
  });
  const { allowance: allowanceB, refetch: refetchAllowanceB } = useTokenApproval({
    tokenAddress:   tokenB,
    spenderAddress: CONTRACTS.ExhibitionAMM.address,
    requiredAmount: parsedB,
  });

  const needsApproveA = allowanceA < parsedA && parsedA > 0n;
  const needsApproveB = allowanceB < parsedB && parsedB > 0n;

  // ── Approve A hook ────────────────────────────────────────
  const {
    approve:      approveA,
    isSuccess:    isApproveASuccess,
    isPending:    isApproveAPending,
    isConfirming: isApproveAConfirming,
    isError:      isApproveAError,
    error:        approveAError,
    txHash:       approveTxHashA,
  } = useApprove({ tokenAddress: tokenA, spenderAddress: CONTRACTS.ExhibitionAMM.address });

  // ── Approve B hook ────────────────────────────────────────
  const {
    approve:      approveB,
    isSuccess:    isApproveBSuccess,
    isPending:    isApproveBPending,
    isConfirming: isApproveBConfirming,
    isError:      isApproveBError,
    error:        approveBError,
    txHash:       approveTxHashB,
  } = useApprove({ tokenAddress: tokenB, spenderAddress: CONTRACTS.ExhibitionAMM.address });

  // ── Add liquidity hook ────────────────────────────────────
  const {
    addLiquidity,
    isSuccess:    isAddSuccess,
    isPending:    isAddPending,
    isConfirming: isAddConfirming,
    isError:      isAddError,
    error:        addError,
    txHash:       addTxHash,
    reset:        resetAdd,
  } = useAddAMMLiquidity();

  // ── Shared add-liquidity call ─────────────────────────────
  const fireAddLiquidity = async (): Promise<WriteResult> => {
  if (!tokenB) return 'error';
    const { data: freshBlock } = await refetchBlock();
    if (!freshBlock) return 'error';
    return addLiquidity({
      tokenA,
      tokenB,
      amountADesired: parsedA,
      amountBDesired: parsedB,
      amountAMin:     (parsedA * 95n) / 100n,
      amountBMin:     (parsedB * 95n) / 100n,
      deadline:       freshBlock + DEADLINE_BLOCKS,
    });
  };

  // ── Derive step index from snapshot ──────────────────────
  // Consistent mapping regardless of live allowance state:
  //   'none' → add=0
  //   'a'    → approveA=0, add=1
  //   'b'    → approveB=0, add=1
  //   'ab'   → approveA=0, approveB=1, add=2
  const addStepIndex = flowApprovals.current === 'ab' ? 2
                     : flowApprovals.current === 'none' ? 0
                     : 1;

  // ── Sync hook flags → phase ───────────────────────────────

  // Approve A succeeded
  useEffect(() => {
    if (!isApproveASuccess || phase !== 'approving-a') return;
    refetchAllowanceA();
    if (flowApprovals.current === 'ab') {
      // still need approve B
      setTxCurrentStep(1);
      setPhase('approving-b');
      approveB(parsedB);
    } else {
      // 'a' only → go straight to add
      setTxCurrentStep(1);
      setPhase('adding');
      void (async () => {
        const result = await fireAddLiquidity();
        if (result === 'rejected') setPhase('idle');
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproveASuccess]);

  // Approve A errored
  useEffect(() => {
    if (isApproveAError && phase === 'approving-a') setPhase('error');
  }, [isApproveAError, phase]);

  // Approve B succeeded
  useEffect(() => {
    if (!isApproveBSuccess || phase !== 'approving-b') return;
    refetchAllowanceB();
    setTxCurrentStep(addStepIndex);
    setPhase('adding');
    void (async () => {
      const result = await fireAddLiquidity();
      if (result === 'rejected') setPhase('idle');
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproveBSuccess]);

  // Approve B errored
  useEffect(() => {
    if (isApproveBError && phase === 'approving-b') setPhase('error');
  }, [isApproveBError, phase]);

  // Add liquidity succeeded — set done, clear inputs.
  // Do NOT call resetAdd() here; that wipes txHash before the modal's
  // 3 s auto-close finishes showing the explorer link.
  // resetAdd is called in handleModalClose instead.
  useEffect(() => {
    if (!isAddSuccess || phase !== 'adding') return;
    setPhase('done');
    setAmountA('');
    setAmountB('');
  }, [isAddSuccess, phase]);

  // Add liquidity errored
  useEffect(() => {
    if (isAddError && phase === 'adding') setPhase('error');
  }, [isAddError, phase]);

  // ── Build TxModal steps from phase ───────────────────────
  // Status driven by `phase`, not raw wagmi flags, so `done` always
  // maps cleanly to `success` even if isAddConfirming is still true.
  const buildSteps = (): TxStep[] => {
    const snap = flowApprovals.current;
    const steps: TxStep[] = [];

    if (snap === 'a' || snap === 'ab') {
      steps.push({
        label:  `Approve ${symbolA}`,
        status:
          phase === 'approving-a' && isApproveAPending    ? 'pending'
        : phase === 'approving-a' && isApproveAConfirming ? 'confirming'
        : phase === 'error'       && txCurrentStep === 0  ? 'error'
        : (phase === 'approving-b' || phase === 'adding' || phase === 'done') ? 'success'
        : 'idle',
        txHash: approveTxHashA ?? undefined,
        error:  phase === 'error' && txCurrentStep === 0 ? approveAError ?? undefined : undefined,
      });
    }

    if (snap === 'b' || snap === 'ab') {
      const bStepIdx = snap === 'ab' ? 1 : 0;
      steps.push({
        label:  `Approve ${symbolB}`,
        status:
          phase === 'approving-b' && isApproveBPending    ? 'pending'
        : phase === 'approving-b' && isApproveBConfirming ? 'confirming'
        : phase === 'error'       && txCurrentStep === bStepIdx ? 'error'
        : (phase === 'adding' || phase === 'done')        ? 'success'
        : 'idle',
        txHash: approveTxHashB ?? undefined,
        error:  phase === 'error' && txCurrentStep === bStepIdx ? approveBError ?? undefined : undefined,
      });
    }

    steps.push({
      label:  `Add ${symbolA}/${symbolB ?? '?'} Liquidity`,
      status:
        phase === 'adding' && isAddPending    ? 'pending'
      : phase === 'adding' && isAddConfirming ? 'confirming'
      : phase === 'done'                      ? 'success'   // ← phase-driven, never masked
      : phase === 'error' && txCurrentStep === addStepIndex ? 'error'
      : 'idle',
      txHash: addTxHash ?? undefined,
      error:  phase === 'error' && txCurrentStep === addStepIndex ? addError ?? undefined : undefined,
    });

    return steps;
  };

  const txSteps = buildSteps();

  // ── Submit handler ────────────────────────────────────────
  const handleSubmit = async () => {
    if (!address || !tokenB) return;

    // Snapshot approval state at click time
    flowApprovals.current =
      needsApproveA && needsApproveB ? 'ab'
      : needsApproveA                ? 'a'
      : needsApproveB                ? 'b'
      :                                'none';

    setTxCurrentStep(0);

    if (needsApproveA) {
      setPhase('approving-a');
      const result = await approveA(parsedA);
      if (result === 'rejected') setPhase('idle');
    } else if (needsApproveB) {
      setPhase('approving-b');
      const result = await approveB(parsedB);
      if (result === 'rejected') setPhase('idle');
    } else {
      setPhase('adding');
      const result = await fireAddLiquidity();
      if (result === 'rejected') setPhase('idle');
    }
  };

  // ── Modal close ───────────────────────────────────────────
  const handleModalClose = () => {
    if (isLoading) return;
    setPhase('idle');
    setTxCurrentStep(0);
    flowApprovals.current = 'none';
    resetAdd();
  };

  // ── Derived ───────────────────────────────────────────────
  const isLoading   = phase === 'approving-a' || phase === 'approving-b' || phase === 'adding';
  const txModalOpen = phase !== 'idle';
  const isInvalid   =
    !tokenB || !amountA || parsedA === 0n ||
    !amountB || parsedB === 0n ||
    parsedA > balanceA || parsedB > balanceB;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">

      {/* ── Pool TVL ──────────────────────────────────── */}
      {poolTVL > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-neon-blue/20 bg-neon-blue-tone px-3 py-2 text-[11px]">
          <span className="text-neon-blue">Pool TVL</span>
          <span className="font-medium text-neon-blue">
            ${poolTVL.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {/* ── Token A ───────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 rounded-xl bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Token A</span>
          <button
            onClick={() => setAmountA(formatUnits(balanceA, decimalsA))}
            className="text-[11px] text-neon-blue hover:underline"
          >
            Balance: {Number(formatUnits(balanceA, decimalsA)).toFixed(4)}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-1 flex-col">
            <Input
              type="number"
              placeholder="0.0"
              value={amountA}
              onChange={e => setAmountA(e.target.value)}
              className="border-0 bg-transparent text-xl font-medium p-0 h-auto focus-visible:ring-0"
            />
            {priceA && amountA && (
              <span className="text-[11px] text-muted-foreground">
                ${(priceA * Number(amountA)).toFixed(2)}
              </span>
            )}
          </div>
          <TokenSelector
            selected={tokenA}
            exclude={tokenB ?? undefined}
            onChange={(t: TokenInfo) => { setTokenA(t.address); setAmountA(''); setAmountB(''); }}
          />
        </div>
      </div>

      {/* ── Token B ───────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 rounded-xl bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Token B</span>
          {tokenB && (
            <button
              onClick={() => setAmountB(formatUnits(balanceB, decimalsB))}
              className="text-[11px] text-neon-blue hover:underline"
            >
              Balance: {Number(formatUnits(balanceB, decimalsB)).toFixed(4)}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-1 flex-col">
            {!tokenB ? (
              <span className="text-base text-muted-foreground">—</span>
            ) : (
              <>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amountB}
                  onChange={e => setAmountB(e.target.value)}
                  readOnly={reserveA > 0n && reserveB > 0n}
                  className={cn(
                    'border-0 bg-transparent text-xl font-medium p-0 h-auto focus-visible:ring-0',
                    reserveA > 0n && reserveB > 0n && 'text-muted-foreground'
                  )}
                />
                {priceB && amountB && (
                  <span className="text-[11px] text-muted-foreground">
                    ${(priceB * Number(amountB)).toFixed(2)}
                  </span>
                )}
              </>
            )}
          </div>
          <TokenSelector
            selected={tokenB}
            exclude={tokenA}
            onChange={(t: TokenInfo) => { setTokenB(t.address); setAmountA(''); setAmountB(''); }}
          />
        </div>
      </div>

      {/* ── Price display ─────────────────────────────── */}
      {tokenA && tokenB && tokenA !== tokenB && (
        <PriceDisplay tokenIn={tokenA} tokenOut={tokenB} />
      )}

      {/* ── Deposit value ─────────────────────────────── */}
      {depositValue > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2 text-[11px]">
          <span className="text-muted-foreground">Total Deposit Value</span>
          <span className="font-medium text-foreground">${depositValue.toFixed(2)}</span>
        </div>
      )}

      {parsedA > balanceA && amountA && (
        <p className="text-[11px] text-destructive px-1">Insufficient {symbolA} balance</p>
      )}
      {tokenB && parsedB > balanceB && amountB && (
        <p className="text-[11px] text-destructive px-1">Insufficient {symbolB} balance</p>
      )}

      {!address ? (
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-3 text-center text-sm text-muted-foreground">
          Connect wallet to add liquidity
        </div>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={isInvalid || isLoading}
          className="w-full border border-neon-blue/40 bg-neon-blue-tone text-neon-blue hover:bg-neon-blue/20 disabled:opacity-50"
        >
          {!tokenB                          ? 'Select Token B'          :
           needsApproveA || needsApproveB   ? 'Approve & Add Liquidity' :
           'Add Liquidity'}
        </Button>
      )}

      <TxModal
        isOpen={txModalOpen}
        onClose={handleModalClose}
        title="Add Liquidity"
        steps={txSteps}
        currentStep={txCurrentStep}
      />
    </div>
  );
}