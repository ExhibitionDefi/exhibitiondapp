'use client';

import { useRouter } from 'next/navigation';
import { formatUnits } from 'viem';
import { usePoolReserves } from '@/hooks/contracts/amm';
import { useLocalPricing } from '@/hooks/contracts/amm';
import { useTokenBalance } from '@/hooks/contracts/tokens';
import { SafeImage } from '@/components/ui/SafeImage';
import { useTokenLogo } from '@/hooks/contracts/tokens';
import { cn } from '@/lib/utils';
import { ArrowLeftRight, Droplets } from 'lucide-react';
import type { PoolPair } from '@/types/amm';

interface PoolCardProps {
  pool: PoolPair;
}

export function PoolCard({ pool }: PoolCardProps) {
  const router = useRouter();
  const { tokenA, tokenB } = pool;

  const { symbol: symbolA, decimals: decimalsA } = useTokenBalance({ tokenAddress: tokenA });
  const { symbol: symbolB, decimals: decimalsB } = useTokenBalance({ tokenAddress: tokenB });
  const { reserveA, reserveB }                   = usePoolReserves(tokenA, tokenB);
  const { calculateTVL, getTokenPriceUSD }       = useLocalPricing();

  const tvl = reserveA > 0n && reserveB > 0n
    ? calculateTVL(tokenA, reserveA, tokenB, reserveB, decimalsA, decimalsB)
    : 0;

  const priceA = getTokenPriceUSD(tokenA);
  const priceB = getTokenPriceUSD(tokenB);

  const toSwap      = () => router.push(`/amm/swap?tokenA=${tokenA}&tokenB=${tokenB}`);
  const toLiquidity = () => router.push(`/amm/liquidity?tokenA=${tokenA}&tokenB=${tokenB}`);

  return (
    <div className={cn(
      'flex flex-col gap-3 rounded-xl border border-border bg-card p-4',
      'hover:border-neon-blue/40 transition-all duration-200',
      'hover:shadow-[0_0_16px_-4px_rgba(0,149,255,0.15)]'
    )}>

      {/* ── Header: Token pair ────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Overlapping token logos */}
          <div className="flex items-center">
            <div className="relative z-10 h-7 w-7 overflow-hidden rounded-full border-2 border-card ring-1 ring-border">
              <SafeImage
                src={useTokenLogo(tokenA)}
                alt={symbolA}
                fill
                className="object-cover"
              />
            </div>
            <div className="relative -ml-2.5 h-7 w-7 overflow-hidden rounded-full border-2 border-card ring-1 ring-border bg-muted">
              <SafeImage
                src={useTokenLogo(tokenB)}
                alt={symbolB}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground leading-none">
              {symbolA || '...'}/{symbolB || '...'}
            </span>
            {/* Pool type badge */}
            <span className="text-[10px] text-neon-blue/70 font-medium">
              AMM Pool
            </span>
          </div>
        </div>

        {/* ── Action buttons ────────────────────────────── */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toSwap}
            title="Swap"
            className={cn(
              'flex items-center gap-1 rounded-lg border border-neon-blue/20 bg-neon-blue/5',
              'px-2 py-1.5 text-[10px] font-medium text-neon-blue/70',
              'hover:border-neon-blue/40 hover:bg-neon-blue/10 hover:text-neon-blue',
              'transition-all duration-150'
            )}
          >
            <ArrowLeftRight className="h-3 w-3" />
            <span>Swap</span>
          </button>
          <button
            onClick={toLiquidity}
            title="Add Liquidity"
            className={cn(
              'flex items-center gap-1 rounded-lg border border-neon-orange/20 bg-neon-orange/5',
              'px-2 py-1.5 text-[10px] font-medium text-neon-orange/70',
              'hover:border-neon-orange/40 hover:bg-neon-orange/10 hover:text-neon-orange',
              'transition-all duration-150'
            )}
          >
            <Droplets className="h-3 w-3" />
            <span>Liquidity</span>
          </button>
        </div>
      </div>

      {/* ── Divider ───────────────────────────────────── */}
      <div className="h-px bg-border/60" />

      {/* ── TVL — hero stat ───────────────────────────── */}
      <div className="flex items-center justify-between rounded-lg border border-neon-blue/10 bg-neon-blue/5 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-neon-blue animate-pulse" />
          <span className="text-[10px] font-medium text-neon-blue/70 uppercase tracking-wider">
            TVL
          </span>
        </div>
        <span className="text-sm font-bold text-neon-blue">
          {tvl > 0
            ? `$${tvl.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
            : '—'
          }
        </span>
      </div>

      {/* ── Reserves ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        {/* Token A reserve */}
        <div className="flex flex-col gap-1 rounded-lg bg-muted/30 px-3 py-2 border border-border/50">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-neon-blue/60" />
            <span className="text-[10px] text-muted-foreground">{symbolA} Reserve</span>
          </div>
          <span className="text-xs font-semibold text-foreground">
            {reserveA > 0n
              ? Number(formatUnits(reserveA, decimalsA)).toLocaleString('en-US', { maximumFractionDigits: 4 })
              : '—'
            }
          </span>
          {/* Price sub-label */}
          {priceA !== 'N/A' && (
            <span className="text-[10px] text-green-400/80">{priceA}</span>
          )}
        </div>

        {/* Token B reserve */}
        <div className="flex flex-col gap-1 rounded-lg bg-muted/30 px-3 py-2 border border-border/50">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-neon-orange/60" />
            <span className="text-[10px] text-muted-foreground">{symbolB} Reserve</span>
          </div>
          <span className="text-xs font-semibold text-foreground">
            {reserveB > 0n
              ? Number(formatUnits(reserveB, decimalsB)).toLocaleString('en-US', { maximumFractionDigits: 4 })
              : '—'
            }
          </span>
          {/* Price sub-label */}
          {priceB !== 'N/A' && (
            <span className="text-[10px] text-green-400/80">{priceB}</span>
          )}
        </div>
      </div>
    </div>
  );
}