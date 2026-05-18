'use client';

import { useAccount, useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';

interface UserVestingInfo {
  totalAmount: bigint;
  releasedAmount: bigint;
  startBlock: bigint;
  lastClaimBlock: bigint;
  vestedAmount: bigint;
  claimableAmount: bigint;
  nextClaimBlock: bigint;

  // Derived
  progress: number; // 0 → 1 based on vestedAmount / totalAmount
  hasStarted: boolean; // true when vesting has begun (vestedAmount > 0)
  isClaimable: boolean; // true when there are tokens ready to claim
}

interface UseUserVestingInfoReturn {
  vesting: UserVestingInfo | null;
  isLoading: boolean;
  isError: boolean;
}

export function useUserVestingInfo(
  projectId: bigint,
  refetchInterval = 30_000
): UseUserVestingInfoReturn {
  const { address } = useAccount();

  const { data, isLoading, isError } = useReadContract({
    address: CONTRACTS.Exhibition.address,
    abi: CONTRACTS.Exhibition.abi,
    functionName: 'getUserVestingInfo',
    args: address ? [projectId, address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval,
      staleTime: refetchInterval / 2,
    },
  });

  if (!data) return { vesting: null, isLoading, isError };

  const [
    totalAmount,
    releasedAmount,
    startBlock,
    lastClaimBlock,
    vestedAmount,
    claimableAmount,
    nextClaimBlock,
  ] = data as readonly bigint[];

  // Use vestedAmount (not releasedAmount) so progress reflects the vesting
  // schedule, not just what has been claimed so far.
  const progress =
    totalAmount > 0n
      ? Math.min(Number(vestedAmount) / Number(totalAmount), 1)
      : 0;

  const vesting: UserVestingInfo = {
    totalAmount,
    releasedAmount,
    startBlock,
    lastClaimBlock,
    vestedAmount,
    claimableAmount,
    nextClaimBlock,

    // Derived from vestedAmount rather than the raw startBlock storage field.
    // The contract determines vesting has begun when currentBlock >=
    // successBlock + vestingCliffBlocks, which is reflected by vestedAmount > 0.
    progress,
    hasStarted: vestedAmount > 0n,
    isClaimable: claimableAmount > 0n,
  };

  return { vesting, isLoading, isError };
}