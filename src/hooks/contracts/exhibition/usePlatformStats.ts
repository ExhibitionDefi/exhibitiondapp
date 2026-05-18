'use client';

import { useReadContracts } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';

interface PlatformStats {
  totalLaunches: number;
  activeLaunches: number;
  completedLaunches: number;
}

interface UsePlatformStatsReturn {
  stats:     PlatformStats | null;
  isLoading: boolean;
  isError:   boolean;
}

export function usePlatformStats(
  refetchInterval = 30_000
): UsePlatformStatsReturn {
  const { data, isLoading, isError } = useReadContracts({
    contracts: [
      {
        address:      CONTRACTS.Exhibition.address,
        abi:          CONTRACTS.Exhibition.abi,
        functionName: 'getProjectCount',
        args:         [],
      },
      {
        address:      CONTRACTS.Exhibition.address,
        abi:          CONTRACTS.Exhibition.abi,
        functionName: 'getProjectsByStatus',
        args:         [1], // Active
      },
      {
        address:      CONTRACTS.Exhibition.address,
        abi:          CONTRACTS.Exhibition.abi,
        functionName: 'getProjectsByStatus',
        args:         [6], // Completed
      },
    ],
    query: { refetchInterval },
  }) as {
    data: Array<{ result: unknown }> | undefined;
    isLoading: boolean;
    isError: boolean;
  };

  if (!data) return { stats: null, isLoading, isError };

  const stats: PlatformStats = {
    totalLaunches:     Number((data[0]?.result as bigint) ?? 0n),
    activeLaunches:    ((data[1]?.result as bigint[]) ?? []).length,
    completedLaunches: ((data[2]?.result as bigint[]) ?? []).length,
  };

  return { stats, isLoading, isError };
}