'use client';

import { useReadContract } from 'wagmi';
import type { Address } from 'viem';
import { CONTRACTS } from '@/lib/contracts';

interface UsePoolReservesReturn {
  reserveA:        bigint;
  reserveB:        bigint;
  reserve0:        bigint;
  reserve1:        bigint;
  token0:          Address;
  token1:          Address;
  blockNumberLast: number;
  isLoading:       boolean;
  isError:         boolean;
  refetch:         () => void;
}

export function usePoolReserves(
  tokenA: Address,
  tokenB: Address,
  refetchInterval = 12_000
): UsePoolReservesReturn {
  // ── Normalize to canonical order ──────────────────────
  const isReversed = tokenA.toLowerCase() > tokenB.toLowerCase();
  const token0     = isReversed ? tokenB : tokenA;
  const token1     = isReversed ? tokenA : tokenB;

  const { data, isLoading, isError, refetch } = useReadContract({
    address:      CONTRACTS.ExhibitionAMM.address,
    abi:          CONTRACTS.ExhibitionAMM.abi,
    functionName: 'getReserves',
    args:         [token0, token1],
    query: {
      enabled:        !!tokenA && !!tokenB && tokenA !== tokenB,
      refetchInterval,
    },
  });

  const raw = data as unknown as [bigint, bigint, number] | undefined;

  const reserve0 = raw?.[0] ?? 0n;
  const reserve1 = raw?.[1] ?? 0n;

  // ── Map back to caller's tokenA/tokenB order ──────────
  const reserveA = isReversed ? reserve1 : reserve0;
  const reserveB = isReversed ? reserve0 : reserve1;

  return {
    reserveA,
    reserveB,
    reserve0,
    reserve1,
    token0,
    token1,
    blockNumberLast: raw?.[2] ?? 0,
    isLoading,
    isError,
    refetch,
  };
}