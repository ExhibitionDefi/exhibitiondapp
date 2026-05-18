'use client';

import { useReadContract } from 'wagmi';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { CONTRACTS } from '@/lib/contracts';

export interface RawEarningsReport {
  settled0: bigint;
  settled1: bigint;
  pending0: bigint;
  pending1: bigint;
  total0:   bigint;
  total1:   bigint;
}

export interface LPEarnings {
  earnedToken0: bigint; // total0 — settled + pending
  earnedToken1: bigint;
  settledToken0: bigint;
  settledToken1: bigint;
  pendingToken0: bigint;
  pendingToken1: bigint;
}

interface UseLPEarningsReturn {
  earnings:  LPEarnings | null;
  raw:       RawEarningsReport | null;
  isLoading: boolean;
  isError:   boolean;
  refetch:   () => void;
}

export function useLPEarnings(
  tokenA: Address,
  tokenB: Address,
  refetchInterval = 12_000
): UseLPEarningsReturn {
  const { address } = useAccount();

  const enabled = !!address && !!tokenA && !!tokenB && tokenA !== tokenB;

  const { data, isLoading, isError, refetch } = useReadContract({
    address:      CONTRACTS.ExhibitionAMM.address,
    abi:          CONTRACTS.ExhibitionAMM.abi,
    functionName: 'getEarningsReport',
    args:         address ? [address as Address, tokenA, tokenB] : undefined,
    query: {
      enabled,
      refetchInterval,
    },
  });

  const tuple = data as unknown as [bigint, bigint, bigint, bigint, bigint, bigint] | undefined;

  if (!tuple) {
    return { earnings: null, raw: null, isLoading, isError, refetch };
  }

  const [settled0, settled1, pending0, pending1, total0, total1] = tuple;

  const raw: RawEarningsReport = {
    settled0,
    settled1,
    pending0,
    pending1,
    total0,
    total1,
  };

  const earnings: LPEarnings = {
    earnedToken0:  total0,
    earnedToken1:  total1,
    settledToken0: settled0,
    settledToken1: settled1,
    pendingToken0: pending0,
    pendingToken1: pending1,
  };

  return { earnings, raw, isLoading, isError, refetch };
}