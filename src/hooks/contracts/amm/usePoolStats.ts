'use client';

import { useReadContracts } from 'wagmi';
import type { Address } from 'viem';
import { CONTRACTS } from '@/lib/contracts';
import type { PoolStats } from '@/types/amm';

interface RawPoolStatistics {
  volume24h:   bigint;
  tvl:         bigint;
  utilization: bigint;
}

interface RawReserves {
  reserveA:         bigint;
  reserveB:         bigint;
  blockNumberLast_: number;
}

interface UsePoolStatsReturn {
  stats:     PoolStats | null;
  isLoading: boolean;
  isError:   boolean;
  refetch:   () => void;
}

export function usePoolStats(
  tokenA: Address,
  tokenB: Address,
  refetchInterval = 12_000
): UsePoolStatsReturn {
  const enabled = !!tokenA && !!tokenB && tokenA !== tokenB;

  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: [
      {
        address:      CONTRACTS.ExhibitionAMM.address,
        abi:          CONTRACTS.ExhibitionAMM.abi,
        functionName: 'getPoolStatistics',
        args:         [tokenA, tokenB],
      },
      {
        address:      CONTRACTS.ExhibitionAMM.address,
        abi:          CONTRACTS.ExhibitionAMM.abi,
        functionName: 'getReserves',
        args:         [tokenA, tokenB],
      },
    ],
    query: {
      enabled,
      refetchInterval,
    },
  }) as {
    data: Array<{ result: unknown }> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  if (!data || !enabled) {
    return { stats: null, isLoading, isError, refetch };
  }

  const rawStats    = data[0]?.result as [bigint, bigint, bigint] | undefined;
  const rawReserves = data[1]?.result as [bigint, bigint, number] | undefined;

  if (!rawStats || !rawReserves) {
    return { stats: null, isLoading, isError, refetch };
  }

  const reserve0 = rawReserves[0];
  const reserve1 = rawReserves[1];

  const stats: PoolStats = {
    token0:      tokenA,
    token1:      tokenB,
    reserve0,
    reserve1,
    totalSupply: 0n,
    price0:      reserve1 > 0n
      ? (Number(reserve0) / Number(reserve1)).toFixed(6)
      : '0',
    price1:      reserve0 > 0n
      ? (Number(reserve1) / Number(reserve0)).toFixed(6)
      : '0',
    apy:         '0',
  };
  return { stats, isLoading, isError, refetch };
}