'use client';

import { useReadContract } from 'wagmi';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { CONTRACTS } from '@/lib/contracts';

interface UseLPBalanceReturn {
  lpBalance:  bigint;
  isLoading:  boolean;
  isError:    boolean;
  refetch:    () => void;
}

export function useLPBalance(
  tokenA: Address,
  tokenB: Address,
  refetchInterval = 12_000
): UseLPBalanceReturn {
  const { address } = useAccount();

  const enabled = !!address && !!tokenA && !!tokenB && tokenA !== tokenB;

  const { data, isLoading, isError, refetch } = useReadContract({
    address:      CONTRACTS.ExhibitionAMM.address,
    abi:          CONTRACTS.ExhibitionAMM.abi,
    functionName: 'getLPBalance',
    args:         address ? [tokenA, tokenB, address as Address] : undefined,
    query: {
      enabled,
      refetchInterval,
    },
  });

  return {
    lpBalance:  (data as bigint) ?? 0n,
    isLoading,
    isError,
    refetch,
  };
}