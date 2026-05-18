'use client';

import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';

interface EmergencyRefundStatus {
  available:       boolean;
  deadlineBlock:   bigint;
  blocksRemaining: bigint;
}

interface UseEmergencyRefundAvailableReturn {
  status:    EmergencyRefundStatus | null;
  isLoading: boolean;
  isError:   boolean;
  refetch:   () => void;
}

interface RawEmergencyRefundStatus {
  available:       boolean;
  deadlineBlock:   bigint;
  blocksRemaining: bigint;
}

export function useEmergencyRefundAvailable(
  projectId: bigint,
  refetchInterval = 12_000
): UseEmergencyRefundAvailableReturn {
  const { data, isLoading, isError, refetch } = useReadContract({
    address:      CONTRACTS.Exhibition.address,
    abi:          CONTRACTS.Exhibition.abi,
    functionName: 'isEmergencyRefundAvailable',
    args:         [projectId],
    query: {
      enabled:        projectId >= 0n,
      refetchInterval,
    },
  });

  const raw = data as unknown as RawEmergencyRefundStatus | undefined;

  return {
    status: raw ?? null,
    isLoading,
    isError,
    refetch,
  };
}