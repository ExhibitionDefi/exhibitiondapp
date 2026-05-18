'use client';

import { useReadContract } from 'wagmi';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { CONTRACTS } from '@/lib/contracts';

interface UseProjectsByOwnerReturn {
  ids:       bigint[];
  isLoading: boolean;
  isError:   boolean;
  refetch:   () => void;
}

export function useProjectsByOwner(
  refetchInterval = 30_000
): UseProjectsByOwnerReturn {
  const { address } = useAccount();

  const { data, isLoading, isError, refetch } = useReadContract({
    address:      CONTRACTS.Exhibition.address,
    abi:          CONTRACTS.Exhibition.abi,
    functionName: 'getProjectsByOwner',
    args:         address ? [address as Address] : undefined,
    query: {
      enabled:        !!address,
      refetchInterval,
    },
  });

  return {
    ids:       (data as bigint[] | undefined) ?? [],
    isLoading,
    isError,
    refetch,
  };
}