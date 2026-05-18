'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBlockNumber } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import type { Address } from 'viem';
import { useRemoveLiquidity, usePoolReserves, useLPBalance, useLiquidityLock, useLocalPricing, useTotalLPSupply } from '@/hooks/contracts/amm';
import { useTokenBalance } from '@/hooks/contracts/tokens';
import { TokenSelector } from '@/components/amm/TokenSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TxModal, type TxStep } from '@/components/ui/TxModal';
import { formatBlocksRemaining, formatBlockToDate } from '@/lib/formatters';
import { Lock } from 'lucide-react';
import type { TokenInfo } from '@/hooks/contracts/amm';

const DEADLINE_BLOCKS = 300n;
const DEFAULT_TOKEN_A = process.env.NEXT_PUBLIC_NEXUS_USD_ADDRESS! as Address;

type FlowPhase = 'idle' | 'removing' | 'done' | 'error';

interface RemoveLiquidityPanelProps {
  initialTokenA?: Address;
  initialTokenB?: Address;
}

export function RemoveLiquidityPanel({
  initialTokenA = DEFAULT_TOKEN_A,
  initialTokenB,
}: RemoveLiquidityPanelProps) {
  const { address }            = useAccount();
  const { data: currentBlock, refetch: refetchBlock } = useBlockNumber({
    watch: false,
    query: {
      refetchOnMount:      true,
      refetchOnWindowFocus: true,
      staleTime:           10_000,
    }
  });

  const [tokenA,   setTokenA]   = useState<Address>(initialTokenA);
  const [tokenB,   setTokenB]   = useState<Address | null>(initialTokenB ?? null);
  const [lpAmount, setLpAmount] = useState('');

  const [phase, setPhase] = useState<FlowPhase>('idle');

  const { balance: balanceA, decimals: decimalsA, symbol: symbolA } = useTokenBalance({ tokenAddress: tokenA });
  const { balance: balanceB, decimals: decimalsB, symbol: symbolB } = useTokenBalance({ tokenAddress: tokenB });

  const { lpBalance }                       = useLPBalance(tokenA, tokenB ?? tokenA);
  const { totalLPSupply }                   = useTotalLPSupply(tokenA, tokenB ?? tokenA);
  const { reserveA, reserveB }              = usePoolReserves(tokenA, tokenB ?? tokenA);
  const { lock }                            = useLiquidityLock(tokenA, tokenB ?? tokenA);
  const { getTokenPrice, calculateTVL }     = useLocalPricing();

  const parsedLP = lpAmount && !isNaN(Number(lpAmount))
    ? parseUnits(lpAmount, 18)
    : 0n;

  // ── Partial lock logic ────────────────────────────────────
  // locked amount = lock.amount only while the lock is active.
  // Once unlocked (or no lock) the full lpBalance is withdrawable.
  const lockedAmount     = (lock && !lock.isUnlocked) ? lock.amount : 0n;
  const withdrawableLP   = lpBalance > lockedAmount ? lpBalance - lockedAmount : 0n;

  // True only when the user is trying to pull MORE than their free LP
  const exceedsWithdrawable = parsedLP > withdrawableLP;

  // Still show the lock info panel when a lock exists and is active
  const isLocked     = lock !== null && !lock.isUnlocked;
  const blocksUntil  = lock?.blocksUntilUnlock ?? 0n;

  // ── Estimated output ──────────────────────────────────────
  const estimatedA = tokenB && totalLPSupply > 0n && parsedLP > 0n && reserveA > 0n
    ? (parsedLP * reserveA) / totalLPSupply
    : 0n;
  const estimatedB = tokenB && totalLPSupply > 0n && parsedLP > 0n && reserveB > 0n
    ? (parsedLP * reserveB) / totalLPSupply
    : 0n;

  // ── USD values ────────────────────────────────────────────
  const priceA = getTokenPrice(tokenA);
  const priceB = tokenB ? getTokenPrice(tokenB) : null;

  const estimatedAUSD = estimatedA > 0n && priceA !== null
    ? (Number(formatUnits(estimatedA, decimalsA)) * priceA).toFixed(2)
    : null;
  const estimatedBUSD = estimatedB > 0n && priceB !== null
    ? (Number(formatUnits(estimatedB, decimalsB)) * priceB).toFixed(2)
    : null;
  const totalReturnUSD = tokenB && estimatedA > 0n && estimatedB > 0n
    ? calculateTVL(tokenA, estimatedA, tokenB, estimatedB, decimalsA, decimalsB)
    : 0;

  const poolTVL = tokenB && reserveA > 0n && reserveB > 0n
    ? calculateTVL(tokenA, reserveA, tokenB, reserveB, decimalsA, decimalsB)
    : 0;

  // ── Remove liquidity hook ─────────────────────────────────
  const {
    removeLiquidity,
    isSuccess:    isRemoveSuccess,
    isPending:    isRemovePending,
    isConfirming: isRemoveConfirming,
    isError:      isRemoveError,
    error:        removeError,
    txHash:       removeTxHash,
    reset:        resetRemove,
  } = useRemoveLiquidity();

  // ── Effects ───────────────────────────────────────────────
  useEffect(() => {
    if (!isRemoveSuccess || phase !== 'removing') return;
    setPhase('done');
    setLpAmount('');
  }, [isRemoveSuccess, phase]);

  useEffect(() => {
    if (isRemoveError && phase === 'removing') setPhase('error');
  }, [isRemoveError, phase]);

  // ── TxModal steps ─────────────────────────────────────────
  const txSteps: TxStep[] = [{
    label:  `Remove ${symbolA}/${symbolB ?? '?'} Liquidity`,
    status:
      phase === 'removing' && isRemovePending    ? 'pending'
    : phase === 'removing' && isRemoveConfirming ? 'confirming'
    : phase === 'done'                           ? 'success'
    : phase === 'error'                          ? 'error'
    : 'idle',
    txHash: removeTxHash ?? undefined,
    error:  phase === 'error' ? removeError ?? undefined : undefined,
  }];

  // ── Handlers ──────────────────────────────────────────────
  const handleRemove = async () => {
    if (!address || parsedLP === 0n || !tokenB) return;
    setPhase('removing');
    const { data: freshBlock } = await refetchBlock();
    if (!freshBlock) return;
    const result = await removeLiquidity({
      tokenA,
      tokenB,
      lpAmount:   parsedLP,
      amountAMin: (estimatedA * 95n) / 100n,
      amountBMin: (estimatedB * 95n) / 100n,
      deadline:   freshBlock + DEADLINE_BLOCKS,
    });
    if (result === 'rejected') setPhase('idle');
  };

  const handleModalClose = () => {
    if (isLoading) return;
    setPhase('idle');
    resetRemove();
  };

  const setPercent = (pct: number) => {
    // Percentages apply to withdrawable LP only, not total lpBalance
    const amount = (withdrawableLP * BigInt(pct)) / 100n;
    setLpAmount(formatUnits(amount, 18));
  };

  // ── Derived ───────────────────────────────────────────────
  const isLoading   = phase === 'removing';
  const txModalOpen = phase !== 'idle';
  const isInvalid   =
    !tokenB ||
    !lpAmount ||
    parsedLP === 0n ||
    exceedsWithdrawable || // block only if exceeding the FREE portion
    isLoading;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">

      {/* Pool TVL */}
      {poolTVL > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-neon-blue/20 bg-neon-blue-tone px-3 py-2 text-[11px]">
          <span className="text-neon-blue">Pool TVL</span>
          <span className="font-medium text-neon-blue">
            ${poolTVL.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {/* Lock warning — info only, no longer blocks the whole panel */}
      {isLocked && lock && currentBlock && (
        <div className="flex flex-col gap-1.5 rounded-lg border border-neon-orange/30 bg-neon-orange-tone px-3 py-3">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-neon-orange" />
            <span className="text-xs font-medium text-neon-orange">Partial Liquidity Locked</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neon-orange/70">Locked LP</span>
            <span className="font-medium text-neon-orange">
              {Number(formatUnits(lock.amount, 18)).toFixed(6)} LP
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neon-orange/70">Withdrawable LP</span>
            <span className="font-medium text-neon-blue">
              {Number(formatUnits(withdrawableLP, 18)).toFixed(6)} LP
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neon-orange/70">Unlocks in</span>
            <span className="font-medium text-neon-orange">
              {formatBlocksRemaining(blocksUntil)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neon-orange/70">Unlock date</span>
            <span className="font-medium text-neon-orange">
              {formatBlockToDate(lock.unlockBlock, currentBlock)}
            </span>
          </div>
        </div>
      )}

      {/* Token pair selector */}
      <div className="flex items-center gap-2">
        <span>
          <TokenSelector
            selected={tokenA}
            exclude={tokenB ?? undefined}
            onChange={(t: TokenInfo) => { setTokenA(t.address); setLpAmount(''); }}
            className="flex-1"
          />
        </span>
        <span className="text-muted-foreground text-sm">/</span>
        <TokenSelector
          selected={tokenB}
          exclude={tokenA}
          onChange={(t: TokenInfo) => { setTokenB(t.address); setLpAmount(''); }}
          className="flex-1"
        />
      </div>

      {/* LP Input */}
      <div className="flex flex-col gap-1.5 rounded-xl bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">LP Amount</span>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[11px] text-muted-foreground">
              Total: {Number(formatUnits(lpBalance, 18)).toFixed(6)}
            </span>
            {isLocked && (
              <span className="text-[11px] text-neon-blue">
                Available: {Number(formatUnits(withdrawableLP, 18)).toFixed(6)}
              </span>
            )}
          </div>
        </div>
        <Input
          type="number"
          placeholder="0.0"
          value={lpAmount}
          onChange={e => setLpAmount(e.target.value)}
          disabled={!tokenB || withdrawableLP === 0n}
          className="border-0 bg-transparent text-xl font-medium p-0 h-auto focus-visible:ring-0"
        />

        {/* Percentage buttons operate on withdrawable portion */}
        {tokenB && withdrawableLP > 0n && (
          <div className="flex items-center gap-1 mt-1">
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                onClick={() => setPercent(pct)}
                className="rounded-md border border-border bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>
        )}

        {/* Exceeds withdrawable — targeted warning */}
        {exceedsWithdrawable && lpAmount && (
          <p className="text-[11px] text-destructive mt-1">
            {withdrawableLP === 0n
              ? 'All your LP is locked — nothing to withdraw until unlock.'
              : `Max withdrawable is ${Number(formatUnits(withdrawableLP, 18)).toFixed(6)} LP. The rest is locked.`
            }
            {withdrawableLP > 0n && (
              <button
                className="ml-1 underline text-neon-blue"
                onClick={() => setLpAmount(formatUnits(withdrawableLP, 18))}
              >
                Use max
              </button>
            )}
          </p>
        )}
      </div>

      {/* Estimated return */}
      {tokenB && parsedLP > 0n && (estimatedA > 0n || estimatedB > 0n) && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 px-3 py-3">
          <span className="text-[11px] font-medium text-muted-foreground">
            You will receive (estimated)
          </span>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{symbolA}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {Number(formatUnits(estimatedA, decimalsA)).toFixed(6)}
              </span>
              {estimatedAUSD && (
                <span className="text-[10px] text-muted-foreground">${estimatedAUSD}</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{symbolB}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {Number(formatUnits(estimatedB, decimalsB)).toFixed(6)}
              </span>
              {estimatedBUSD && (
                <span className="text-[10px] text-muted-foreground">${estimatedBUSD}</span>
              )}
            </div>
          </div>
          {totalReturnUSD > 0 && (
            <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
              <span className="text-muted-foreground">Total Value</span>
              <span className="font-semibold text-neon-blue">${totalReturnUSD.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {!address ? (
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-3 text-center text-sm text-muted-foreground">
          Connect wallet to remove liquidity
        </div>
      ) : (
        <Button
          onClick={handleRemove}
          disabled={isInvalid}
          className="w-full border border-neon-orange/40 bg-neon-orange-tone text-neon-orange hover:bg-neon-orange/20 disabled:opacity-50"
        >
          {!tokenB             ? 'Select Token B'
         : withdrawableLP === 0n ? 'All Liquidity Locked'
         : 'Remove Liquidity'}
        </Button>
      )}

      <TxModal
        isOpen={txModalOpen}
        onClose={handleModalClose}
        title="Remove Liquidity"
        steps={txSteps}
        currentStep={0}
      />
    </div>
  );
}