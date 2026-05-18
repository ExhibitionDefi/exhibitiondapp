'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatUnits } from 'viem';
import { useLPEarnings, usePoolReserves, useLiquidityLock, useTotalLPSupply } from '@/hooks/contracts/amm';
import { useLocalPricing } from '@/hooks/contracts/amm';
import { useTokenBalance } from '@/hooks/contracts/tokens';
import { useBlockNumber } from 'wagmi';
import { SafeImage } from '@/components/ui/SafeImage';
import { useTokenLogo } from '@/hooks/contracts/tokens';
import { formatBlocksRemaining, formatBlockToDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { ArrowLeftRight, Plus, Minus, Lock } from 'lucide-react';
import type { UserPortfolioPosition } from '@/types/amm';

interface PositionCardProps {
  position: UserPortfolioPosition;
  onValueCalculated?: (value: number) => void;
}

export function PositionCard({ position, onValueCalculated }: PositionCardProps) {
  const router                        = useRouter();
  const { tokenA, tokenB, lpBalance } = position;
  const token0IsA                     = tokenA.toLowerCase() < tokenB.toLowerCase();
  const { data: currentBlock }        = useBlockNumber({ 
    watch: false,
    query: {
      refetchOnMount:       true,
      refetchOnWindowFocus: true,
      staleTime:            30_000,
    }
  });

  const { symbol: symbolA, decimals: decimalsA } = useTokenBalance({ tokenAddress: tokenA });
  const { symbol: symbolB, decimals: decimalsB } = useTokenBalance({ tokenAddress: tokenB });
  const { reserveA, reserveB }                   = usePoolReserves(tokenA, tokenB);
  const { totalLPSupply }                        = useTotalLPSupply(tokenA, tokenB);
  const { earnings }                             = useLPEarnings(tokenA, tokenB);
  const { lock }                                 = useLiquidityLock(tokenA, tokenB);
  const { calculateTVL, getTokenPrice }          = useLocalPricing();

  // ── Position value ────────────────────────────────────
  const myReserveA = totalLPSupply > 0n && lpBalance > 0n && reserveA > 0n
    ? (lpBalance * reserveA) / totalLPSupply : 0n;
  const myReserveB = totalLPSupply > 0n && lpBalance > 0n && reserveB > 0n
    ? (lpBalance * reserveB) / totalLPSupply : 0n;

  const sharePercent = totalLPSupply > 0n && lpBalance > 0n
    ? Number(lpBalance * 10_000n / totalLPSupply) / 10_000 : 0;

  const positionValue = myReserveA > 0n && myReserveB > 0n
    ? calculateTVL(tokenA, myReserveA, tokenB, myReserveB, decimalsA, decimalsB) : 0;

  useEffect(() => { onValueCalculated?.(positionValue); }, [positionValue, onValueCalculated]);

  // ── Earnings ──────────────────────────────────────────
  const earnedA  = (token0IsA ? earnings?.earnedToken0  : earnings?.earnedToken1)  ?? 0n;
  const earnedB  = (token0IsA ? earnings?.earnedToken1  : earnings?.earnedToken0)  ?? 0n;
  const pendingA = (token0IsA ? earnings?.pendingToken0 : earnings?.pendingToken1) ?? 0n;
  const pendingB = (token0IsA ? earnings?.pendingToken1 : earnings?.pendingToken0) ?? 0n;
  const settledA = (token0IsA ? earnings?.settledToken0 : earnings?.settledToken1) ?? 0n;
  const settledB = (token0IsA ? earnings?.settledToken1 : earnings?.settledToken0) ?? 0n;

  const priceA = getTokenPrice(tokenA);
  const priceB = getTokenPrice(tokenB);

  const earnedAUSD = priceA !== null && decimalsA
    ? (Number(formatUnits(earnedA, decimalsA)) * priceA).toFixed(2) : null;
  const earnedBUSD = priceB !== null && decimalsB
    ? (Number(formatUnits(earnedB, decimalsB)) * priceB).toFixed(2) : null;
  const totalEarnedUSD = earnedAUSD && earnedBUSD
    ? (Number(earnedAUSD) + Number(earnedBUSD)).toFixed(2) : null;

  // ── Partial lock logic ────────────────────────────────
  const lockedAmount   = (lock && !lock.isUnlocked) ? lock.amount : 0n;
  const withdrawableLP = lpBalance > lockedAmount ? lpBalance - lockedAmount : 0n;
  const isLocked       = lock !== null && !lock.isUnlocked;
  const isFullyLocked  = isLocked && withdrawableLP === 0n;
  const blocksUntil    = lock?.blocksUntilUnlock ?? 0n;

  const toSwap   = () => router.push(`/amm/swap?tokenA=${tokenA}&tokenB=${tokenB}`);
  const toAdd    = () => router.push(`/amm/liquidity?tokenA=${tokenA}&tokenB=${tokenB}`);
  const toRemove = () => router.push(`/amm/liquidity?tokenA=${tokenA}&tokenB=${tokenB}`);

  return (
    <div className={cn(
      'flex flex-col gap-2.5 rounded-xl border border-border bg-card p-3',
      'hover:border-neon-blue/30 transition-colors'
    )}>

      {/* ── Header ───────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Token logos */}
          <div className="flex items-center">
            <div className="relative h-6 w-6 overflow-hidden rounded-full border border-border">
              <SafeImage src={useTokenLogo(tokenA)} alt={symbolA} fill className="object-cover" />
            </div>
            <div className="relative -ml-1.5 h-6 w-6 overflow-hidden rounded-full border border-border bg-card">
              <SafeImage src={useTokenLogo(tokenB)} alt={symbolB} fill className="object-cover" />
            </div>
          </div>
          <div className="flex flex-col gap-0">
            <span className="text-xs font-semibold text-foreground leading-tight">
              {symbolA || '...'}/{symbolB || '...'}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {(sharePercent * 100).toFixed(4)}% share
              {positionValue > 0 && (
                <span className="ml-1.5 text-neon-blue font-medium">${positionValue.toFixed(2)}</span>
              )}
            </span>
          </div>
        </div>

        {/* ── Actions ───────────────────────────────── */}
        <div className="flex items-center gap-1">
          <button onClick={toSwap} title="Swap"
            className="rounded-md border border-border p-1 text-muted-foreground hover:border-neon-blue/30 hover:text-neon-blue transition-colors">
            <ArrowLeftRight className="h-3 w-3" />
          </button>
          <button onClick={toAdd} title="Add Liquidity"
            className="rounded-md border border-border p-1 text-muted-foreground hover:border-neon-blue/30 hover:text-neon-blue transition-colors">
            <Plus className="h-3 w-3" />
          </button>
          <button
            onClick={toRemove}
            title={isFullyLocked ? 'Liquidity fully locked' : 'Remove Liquidity'}
            disabled={isFullyLocked}
            className={cn(
              'rounded-md border border-border p-1 transition-colors',
              isFullyLocked
                ? 'text-muted-foreground/30 cursor-not-allowed'
                : 'text-muted-foreground hover:border-neon-orange/30 hover:text-neon-orange'
            )}
          >
            <Minus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* ── Lock banner ───────────────────────────────── */}
      {isLocked && lock && currentBlock && (
        <div className="flex items-center justify-between rounded-lg border border-neon-orange/20 bg-neon-orange-tone px-2.5 py-1.5 text-[10px]">
          <div className="flex items-center gap-1.5 text-neon-orange">
            <Lock className="h-3 w-3" />
            <span className="font-medium">{isFullyLocked ? 'Locked' : 'Partial Lock'}</span>
            {!isFullyLocked && (
              <span className="text-neon-blue">
                · {Number(formatUnits(withdrawableLP, 18)).toFixed(4)} LP free
              </span>
            )}
          </div>
          <span className="text-neon-orange font-medium">
            {formatBlocksRemaining(blocksUntil)} · {formatBlockToDate(lock.unlockBlock, currentBlock)}
          </span>
        </div>
      )}

      {/* ── Position stats ────────────────────────────── */}
      <div className="grid grid-cols-2 gap-1.5">
        {/* LP Balance — split locked vs free when partially locked */}
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/30 px-2.5 py-1.5">
          <span className="text-[10px] text-muted-foreground">LP Balance</span>
          {isLocked && !isFullyLocked ? (
            <div className="flex flex-col gap-0">
              <span className="text-xs font-medium text-foreground">
                {Number(formatUnits(lpBalance, 18)).toFixed(6)}
              </span>
              <span className="text-[10px] text-neon-orange/80">
                {Number(formatUnits(lockedAmount, 18)).toFixed(4)} locked
              </span>
            </div>
          ) : (
            <span className="text-xs font-medium text-foreground">
              {Number(formatUnits(lpBalance, 18)).toFixed(6)}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/30 px-2.5 py-1.5">
          <span className="text-[10px] text-muted-foreground">My {symbolA}</span>
          <span className="text-xs font-medium text-foreground">
            {myReserveA > 0n ? Number(formatUnits(myReserveA, decimalsA)).toFixed(4) : '—'}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/30 px-2.5 py-1.5">
          <span className="text-[10px] text-muted-foreground">My {symbolB}</span>
          <span className="text-xs font-medium text-foreground">
            {myReserveB > 0n ? Number(formatUnits(myReserveB, decimalsB)).toFixed(4) : '—'}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/30 px-2.5 py-1.5">
          <span className="text-[10px] text-muted-foreground">Pool Share</span>
          <span className="text-xs font-medium text-foreground">
            {(sharePercent * 100).toFixed(4)}%
          </span>
        </div>
      </div>

      {/* ── Earnings ──────────────────────────────────── */}
      {earnings && (earnedA > 0n || earnedB > 0n) && (
        <div className="flex flex-col gap-1.5 rounded-lg border border-green-500/20 bg-green-500/5 px-2.5 py-2">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-green-400">Earnings</span>
            {totalEarnedUSD && (
              <span className="text-[10px] font-semibold text-green-400">${totalEarnedUSD}</span>
            )}
          </div>

          {/* Earned tokens */}
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">{symbolA}</span>
            <div className="flex items-center gap-1">
              <span className="text-foreground font-medium">
                {Number(formatUnits(earnedA, decimalsA)).toFixed(6)}
              </span>
              {earnedAUSD && <span className="text-muted-foreground">${earnedAUSD}</span>}
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">{symbolB}</span>
            <div className="flex items-center gap-1">
              <span className="text-foreground font-medium">
                {Number(formatUnits(earnedB, decimalsB)).toFixed(6)}
              </span>
              {earnedBUSD && <span className="text-muted-foreground">${earnedBUSD}</span>}
            </div>
          </div>

          {/* Settled / Pending — single compact row each */}
          {(settledA > 0n || settledB > 0n || pendingA > 0n || pendingB > 0n) && (
            <div className="flex flex-col gap-0.5 border-t border-green-500/20 pt-1.5 text-[10px] text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Settled</span>
                <span>
                  {Number(formatUnits(settledA, decimalsA)).toFixed(4)} {symbolA}
                  {' / '}
                  {Number(formatUnits(settledB, decimalsB)).toFixed(4)} {symbolB}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pending</span>
                <span>
                  {Number(formatUnits(pendingA, decimalsA)).toFixed(4)} {symbolA}
                  {' / '}
                  {Number(formatUnits(pendingB, decimalsB)).toFixed(4)} {symbolB}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}