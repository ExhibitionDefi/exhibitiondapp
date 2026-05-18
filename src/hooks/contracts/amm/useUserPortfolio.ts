'use client';

import { useReadContract } from 'wagmi';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { CONTRACTS } from '@/lib/contracts';
import type { UserPortfolio, UserPortfolioPosition } from '@/types/amm';

interface UseUserPortfolioReturn {
  portfolio:  UserPortfolio | null;
  isLoading:  boolean;
  isError:    boolean;
  refetch:    () => void;
}

export function useUserPortfolio(
  offset          = 0,
  limit           = 20,
  refetchInterval = 12_000
): UseUserPortfolioReturn {
  const { address } = useAccount();
  const enabled     = !!address;

  const { data, isLoading, isError, refetch } = useReadContract({
    address:      CONTRACTS.ExhibitionAMM.address,
    abi:          CONTRACTS.ExhibitionAMM.abi,
    functionName: 'getUserPortfolio',
    args:         address
      ? [address as Address, BigInt(offset), BigInt(limit)]
      : undefined,
    query: {
      enabled,
      refetchInterval,
    },
  });

  if (!data || !enabled) {
    return { portfolio: null, isLoading, isError, refetch };
  }

  // getUserPortfolio returns tuple:
  // [tokenAs[], tokenBs[], lpBalances[], sharePercentages[], totalPositions, hasMore]
  const raw = data as unknown as [
    Address[],
    Address[],
    bigint[],
    bigint[],
    bigint,
    boolean,
  ] | undefined;

  if (!raw || !Array.isArray(raw[0])) {
    return { portfolio: null, isLoading, isError, refetch };
  }

  const positions: UserPortfolioPosition[] = raw[0].map((tokenA, index) => ({
    tokenA,
    tokenB:          raw[1][index],
    lpBalance:       raw[2][index],
    sharePercentage: raw[3][index],
  }));

  const portfolio: UserPortfolio = {
    positions,
    totalPositions:  raw[4],
    hasMore:         raw[5],
    // ── Derived from positions array ──────────────────
    positionCount:   BigInt(positions.length),
    activePoolCount: BigInt(positions.length),
  };

  return { portfolio, isLoading, isError, refetch };
}