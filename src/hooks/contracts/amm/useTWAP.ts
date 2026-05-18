'use client';

import { useReadContract } from 'wagmi';
import type { Address } from 'viem';
import { CONTRACTS } from '@/lib/contracts';
import { BLOCKS_PER_HOUR } from '@/lib/constants';

interface UseTWAPReturn {
  twapPrice:  bigint;
  formatted:  string;
  isLoading:  boolean;
  isError:    boolean;
  refetch:    () => void;
}

export function useTWAP(
  tokenA: Address,
  tokenB: Address,
  period: number = BLOCKS_PER_HOUR, // default 1 hour window
  refetchInterval = 12_000
): UseTWAPReturn {
  const enabled = !!tokenA && !!tokenB && tokenA !== tokenB;

  const { data, isLoading, isError, refetch } = useReadContract({
    address:      CONTRACTS.ExhibitionAMM.address,
    abi:          CONTRACTS.ExhibitionAMM.abi,
    functionName: 'getTWAP',
    args:         [tokenA, tokenB, period],
    query: {
      enabled,
      refetchInterval,
      staleTime: refetchInterval / 2,
    },
  });

  const twapPrice = (data as bigint) ?? 0n;

  // twapPrice is in 18 decimal fixed point
  const formatted = twapPrice > 0n
    ? (Number(twapPrice) / 1e18).toFixed(6)
    : '0';

  return {
    twapPrice,
    formatted,
    isLoading,
    isError,
    refetch,
  };
}