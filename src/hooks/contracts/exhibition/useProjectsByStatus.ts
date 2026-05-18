'use client';

import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';

export function useProjectsByStatus(status: number, refetchInterval = 30_000) {
  const { data, isLoading, isError, refetch } = useReadContract({
    address:      CONTRACTS.Exhibition.address,
    abi:          CONTRACTS.Exhibition.abi,
    functionName: 'getProjectsByStatus',
    args:         [status],
    query: {
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