'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { CONTRACTS } from '@/lib/contracts';

interface UseUserContributedProjectsReturn {
  ids:       bigint[];
  isLoading: boolean;
  isError:   boolean;
}

export function useUserContributedProjects(
  refetchInterval = 30_000
): UseUserContributedProjectsReturn {
  const { address } = useAccount();

  // ── Step 1: Get all project IDs ───────────────────────
  const {
    data:      countData,
    isLoading: isLoadingCount,
  } = useReadContract({
    address:      CONTRACTS.Exhibition.address,
    abi:          CONTRACTS.Exhibition.abi,
    functionName: 'getProjectCount',
    query:        { refetchInterval },
  }) as { data: bigint | undefined; isLoading: boolean };

  const total = Number(countData ?? 0n);

  const {
    data:      idsData,
    isLoading: isLoadingIds,
  } = useReadContract({
    address:      CONTRACTS.Exhibition.address,
    abi:          CONTRACTS.Exhibition.abi,
    functionName: 'getProjects',
    args:         [0n, BigInt(total)],
    query: {
      enabled:        total > 0,
      refetchInterval,
    },
  });

  const allIds = (idsData as bigint[] | undefined) ?? [];

  // ── Step 2: Batch check hasUserContributed ────────────
  const { data: contributedData, isLoading: isLoadingContributed, isError } = useReadContracts({
    contracts: allIds.map(id => ({
      address:      CONTRACTS.Exhibition.address,
      abi:          CONTRACTS.Exhibition.abi,
      functionName: 'hasUserContributed' as const,
      args:         address ? [id, address as Address] : undefined,
    })),
    query: {
      enabled:        !!address && allIds.length > 0,
      refetchInterval,
    },
  }) as {
    data: Array<{ result: unknown }> | undefined;
    isLoading: boolean;
    isError: boolean;
  };

  // ── Step 3: Filter IDs where user has contributed ─────
  const ids = allIds.filter((_, index) =>
    (contributedData?.[index]?.result as boolean) === true
  );

  return {
    ids,
    isLoading: isLoadingCount || isLoadingIds || isLoadingContributed,
    isError,
  };
}