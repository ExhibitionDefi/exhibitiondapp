'use client';

import { useReadContract } from 'wagmi';
import type { Address } from 'viem';
import { CONTRACTS } from '@/lib/contracts';

interface UseTotalLPSupplyReturn {
  totalLPSupply: bigint;
  isLoading:     boolean;
  isError:       boolean;
  refetch:       () => void;
}

export function useTotalLPSupply(
  tokenA: Address,
  tokenB: Address,
  refetchInterval = 12_000
): UseTotalLPSupplyReturn {
  const { data, isLoading, isError, refetch } = useReadContract({
    address:      CONTRACTS.ExhibitionAMM.address,
    abi:          CONTRACTS.ExhibitionAMM.abi,
    functionName: 'getTotalLPSupply',
    args:         [tokenA, tokenB],
    query: {
      enabled:        !!tokenA && !!tokenB && tokenA !== tokenB,
      refetchInterval,
    },
  });

  return {
    totalLPSupply: (data as bigint) ?? 0n,
    isLoading,
    isError,
    refetch,
  };
}