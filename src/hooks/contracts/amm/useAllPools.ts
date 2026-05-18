'use client';

import { useReadContracts } from 'wagmi';
import type { Address } from 'viem';
import { CONTRACTS } from '@/lib/contracts';
import type { PoolPair } from '@/types/amm';


interface UseAllPoolsReturn {
  pools:      PoolPair[];
  total:      number;
  hasMore:    boolean;
  isLoading:  boolean;
  isError:    boolean;
  refetch:    () => void;
}

export function useAllPools(
  offset          = 0,
  refetchInterval = 12_000
): UseAllPoolsReturn {

  // ── Step 1: Get pool count first ──────────────────────
  const { data: countData, isLoading: isLoadingCount } = useReadContracts({
    contracts: [{
      address:      CONTRACTS.ExhibitionAMM.address,
      abi:          CONTRACTS.ExhibitionAMM.abi,
      functionName: 'getPoolCount',
      args:         [],
    }],
    query: { refetchInterval },
  }) as { data: Array<{ result: unknown }> | undefined; isLoading: boolean };

  const total = Number((countData?.[0]?.result as bigint) ?? 0n);

  // ── Step 2: Fetch pools using actual count as limit ───
  const { data, isLoading: isLoadingPools, isError, refetch } = useReadContracts({
    contracts: [{
      address:      CONTRACTS.ExhibitionAMM.address,
      abi:          CONTRACTS.ExhibitionAMM.abi,
      functionName: 'getPoolsPaginated',
      args:         [BigInt(offset), BigInt(total)],
    }],
    query: {
      enabled:        total > 0,
      refetchInterval,
    },
  }) as {
    data: Array<{ result: unknown }> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  if (!data || total === 0) {
    return { pools: [], total, hasMore: false, isLoading: isLoadingCount || isLoadingPools, isError, refetch: refetch ?? (() => {}) };
  }

  const raw = data[0]?.result as unknown as [
    Address[],
    Address[],
    bigint,
    boolean,
  ] | undefined;

  if (!raw || !Array.isArray(raw[0])) {
    return { pools: [], total, hasMore: false, isLoading: isLoadingCount || isLoadingPools, isError, refetch };
  }

  const pools: PoolPair[] = raw[0].map((tokenA, index) => ({
    tokenA,
    tokenB: raw[1][index],
  }));

  return {
    pools,
    total,
    hasMore:   raw[3],
    isLoading: isLoadingCount || isLoadingPools,
    isError,
    refetch,
  };
}