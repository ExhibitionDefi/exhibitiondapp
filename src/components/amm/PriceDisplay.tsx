'use client';

import { useLocalPricing } from '@/hooks/contracts/amm';
import { useTokenBalance } from '@/hooks/contracts/tokens';
import { cn } from '@/lib/utils';
import type { Address } from 'viem';

interface PriceDisplayProps {
  tokenIn:    Address;
  tokenOut:   Address;
  className?: string;
}

export function PriceDisplay({ tokenIn, tokenOut, className }: PriceDisplayProps) {
  const { getTokenPrice, getTokenPriceUSD } = useLocalPricing();
  const { symbol: symbolIn  } = useTokenBalance({ tokenAddress: tokenIn  });
  const { symbol: symbolOut } = useTokenBalance({ tokenAddress: tokenOut });

  // price of tokenIn expressed in tokenOut units
  const priceIn  = getTokenPrice(tokenIn);
  const priceOut = getTokenPrice(tokenOut);
  const priceUSD = getTokenPriceUSD(tokenIn);

  // ratio: how many tokenOut per 1 tokenIn
  const ratio = priceIn !== null && priceOut !== null && priceOut !== 0
    ? (priceIn / priceOut).toFixed(6)
    : null;

  if (!ratio) return null;

  return (
    <div className={cn(
      'flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2 text-[11px]',
      className
    )}>
      <span className="text-muted-foreground">Price</span>
      <span className="font-medium text-foreground">
        1 {symbolIn} = {ratio} {symbolOut}
        {priceUSD !== 'N/A' && (
          <span className="ml-1 text-muted-foreground">({priceUSD})</span>
        )}
      </span>
    </div>
  );
}