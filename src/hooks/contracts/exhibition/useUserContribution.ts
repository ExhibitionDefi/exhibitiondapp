'use client';

import { useReadContracts } from 'wagmi';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { CONTRACTS } from '@/lib/contracts';
import type { ContributionInfo } from '@/types/project';

type RawUserProjectSummary = readonly [
  bigint,  // 0 contributionAmount
  bigint,  // 1 tokensOwed
  bigint,  // 2 tokensVested
  bigint,  // 3 tokensClaimed
  bigint,  // 4 tokensAvailable
  boolean, // 5 userHasRefunded
  boolean, // 6 canClaim
];

interface UseUserContributionReturn {
  contribution:   ContributionInfo | null;
  hasContributed: boolean;
  isLoading:      boolean;
  isError:        boolean;
  refetch:        () => void;
}

export function useUserContribution(
  projectId: bigint,
  refetchInterval = 12_000
): UseUserContributionReturn {
  const { address } = useAccount();

  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: [
      {
        address:      CONTRACTS.Exhibition.address,
        abi:          CONTRACTS.Exhibition.abi,
        functionName: 'hasUserContributed',
        args:         address ? [projectId, address as Address] : undefined,
      },
      {
        address:      CONTRACTS.Exhibition.address,
        abi:          CONTRACTS.Exhibition.abi,
        functionName: 'getUserProjectSummary',
        args:         address ? [projectId, address as Address] : undefined,
      },
    ],
    query: {
      enabled:        !!address,
      refetchInterval,
      staleTime:      refetchInterval / 2,
    },
  });

  const empty = { contribution: null, hasContributed: false, isLoading, isError, refetch };

  if (!data || !address) return empty;

  const hasContributed = (data[0]?.result as boolean) ?? false;
  const raw = data[1]?.result as RawUserProjectSummary | undefined;

  if (!raw || !hasContributed) {
    return { ...empty, hasContributed };
  }

  const [
    contributionAmount,
    tokensOwed,
    tokensVested,
    tokensClaimed,
    tokensAvailable,
    userHasRefunded,
    canClaim,
  ] = raw;

  const contribution: ContributionInfo = {
    contributionAmount,
    tokensOwed,
    tokensVested,
    tokensClaimed,
    tokensAvailable,
    userHasRefunded,
    canClaim,
  };

  return { contribution, hasContributed, isLoading, isError, refetch };
}