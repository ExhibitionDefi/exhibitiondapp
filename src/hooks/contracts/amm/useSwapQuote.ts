'use client';

import { useReadContracts } from 'wagmi';
import { useDebounce } from '@/hooks/ui';
import type { Address } from 'viem';
import { CONTRACTS } from '@/lib/contracts';
import type { SwapQuote } from '@/types/amm';

interface UseSwapQuoteOptions {
  tokenIn:          Address;
  tokenOut:         Address;
  amountIn:         bigint;
  refetchInterval?: number;
}

interface UseSwapQuoteReturn {
  quote:     SwapQuote | null;
  isLoading: boolean;
  isError:   boolean;
}

export function useSwapQuote({
  tokenIn,
  tokenOut,
  amountIn,
  refetchInterval = 12_000,
}: UseSwapQuoteOptions): UseSwapQuoteReturn {
  const debouncedAmountIn = useDebounce(amountIn, 500);

  const enabled =
    !!tokenIn &&
    !!tokenOut &&
    debouncedAmountIn > 0n &&
    tokenIn !== tokenOut;

  const { data, isLoading, isError } = useReadContracts({
    contracts: [
      {
        address:      CONTRACTS.ExhibitionAMM.address,
        abi:          CONTRACTS.ExhibitionAMM.abi,
        functionName: 'getAmountOut',
        args:         [debouncedAmountIn, tokenIn, tokenOut],
      },
      {
        address:      CONTRACTS.ExhibitionAMM.address,
        abi:          CONTRACTS.ExhibitionAMM.abi,
        functionName: 'getSlippageImpact',
        args:         [tokenIn, tokenOut, debouncedAmountIn],
      },
      {
        address:      CONTRACTS.ExhibitionAMM.address,
        abi:          CONTRACTS.ExhibitionAMM.abi,
        functionName: 'getFeeConfig',
        args:         [],
      },
    ],
    query: {
      enabled,
      refetchInterval,
    },
  });

  if (!data || !enabled) {
    return { quote: null, isLoading, isError };
  }

  const amountOut   = (data[0]?.result as bigint)                          ?? 0n;
  const slippageRaw = (data[1]?.result as bigint)                          ?? 0n;
  const feeConfig   = data[2]?.result as [bigint, bigint, string, boolean] ?? undefined;

  const tradingFeeBps = feeConfig?.[0] ?? 30n;
  const feesEnabled   = feeConfig?.[3] ?? true;
  const feeAmount     = feesEnabled
    ? (debouncedAmountIn * tradingFeeBps) / 10_000n
    : 0n;

  const priceImpactNum = Number(slippageRaw) / 100;
  const priceImpact    = `${priceImpactNum.toFixed(2)}%`;

  const quote: SwapQuote = {
    amountIn:      debouncedAmountIn,
    amountOut,
    priceImpact,
    priceImpactNum,
    fee:           feeAmount.toString(),
    route:         [tokenIn, tokenOut],
    tradingFeeBps: tradingFeeBps,
  };

  return { quote, isLoading, isError };
}