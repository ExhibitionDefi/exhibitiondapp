'use client';

import { useReadContract } from 'wagmi';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { erc20ABI } from '@/lib/abis';

interface UseTokenApprovalOptions {
  tokenAddress:   Address | null;
  spenderAddress: Address;
  requiredAmount: bigint;
  refetchInterval?: number;
}

interface UseTokenApprovalReturn {
  allowance:      bigint;
  isApproved:     boolean;
  isLoading:      boolean;
  isError:        boolean;
  refetch:        () => void;
}

export function useTokenApproval({
  tokenAddress,
  spenderAddress,
  requiredAmount,
  refetchInterval = 12_000,
}: UseTokenApprovalOptions): UseTokenApprovalReturn {
  const { address: connectedAddress } = useAccount();

  const {
    data: allowance,
    isLoading,
    isError,
    refetch,
  } = useReadContract({
    address: tokenAddress ?? '0x0000000000000000000000000000000000000000' as Address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: connectedAddress ? [connectedAddress, spenderAddress] : undefined,
    query: {
      enabled: !!tokenAddress && !!connectedAddress,
      refetchInterval,
    },
  });

  const allowanceBigInt = (allowance as bigint) ?? 0n;

  return {
    allowance:  allowanceBigInt,
    isApproved: allowanceBigInt >= requiredAmount,
    isLoading,
    isError,
    refetch,
  };
}