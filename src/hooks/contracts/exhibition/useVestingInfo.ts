'use client';

import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { blocksToRealDays } from '@/lib/formatters';
import type { VestingInfo, RawProjectDetails } from '@/types/project';

interface UseVestingInfoReturn {
  vesting:   VestingInfo | null;
  isLoading: boolean;
  isError:   boolean;
}

export function useVestingInfo(
  projectId: bigint,
  refetchInterval = 30_000
): UseVestingInfoReturn {
  const { data, isLoading, isError } = useReadContract({
    address:      CONTRACTS.Exhibition.address,
    abi:          CONTRACTS.Exhibition.abi,
    functionName: 'getProjectDetails',
    args:         [projectId],
    query: {
      enabled:        projectId >= 0n,
      refetchInterval,
      staleTime:      refetchInterval / 2,
    },
  });

  if (!data) return { vesting: null, isLoading, isError };

  const raw = data as unknown as RawProjectDetails;
  const p   = raw[0];

  const vesting: VestingInfo = {
    enabled:               p.vestingEnabled,
    cliffBlocks:           p.vestingCliffBlocks,
    durationBlocks:        p.vestingDurationBlocks,
    intervalBlocks:        p.vestingIntervalBlocks,
    initialRelease:        p.vestingInitialRelease,
    cliffDays:             blocksToRealDays(p.vestingCliffBlocks),
    durationDays:          blocksToRealDays(p.vestingDurationBlocks),
    intervalDays:          blocksToRealDays(p.vestingIntervalBlocks),
    initialReleasePercent: Number(p.vestingInitialRelease) / 100,
  };

  return { vesting, isLoading, isError };
}