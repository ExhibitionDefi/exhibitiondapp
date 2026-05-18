'use client';

import { useReadContracts, useBalance } from 'wagmi';
import { useAccount } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { exhibitionNEXABI } from '@/lib/abis';

interface UseExNEXPortalReturn {
  nexBalance:    bigint;
  exNEXBalance:  bigint;
  totalSupply:   bigint;
  isLoading:     boolean;
  isError:       boolean;
  refetch:       () => void;
}

export function useExNEXPortal(
  refetchInterval = 12_000
): UseExNEXPortalReturn {
  const { address } = useAccount();

  // ── Native NEX balance ────────────────────────────────
  const {
    data:      nexData,
    isLoading: isLoadingNEX,
  } = useBalance({
    address,
    query: {
      enabled:        !!address,
      refetchInterval,
    },
  });

  // ── exNEX balance + totalSupply ───────────────────────
  const {
    data,
    isLoading: isLoadingExNEX,
    isError,
    refetch,
  } = useReadContracts({
    contracts: [
      {
        address:      CONTRACTS.ExhibitionNEX.address,
        abi:          exhibitionNEXABI,
        functionName: 'balanceOf',
        args:         address ? [address] : undefined,
      },
      {
        address:      CONTRACTS.ExhibitionNEX.address,
        abi:          exhibitionNEXABI,
        functionName: 'totalSupply',
        args:         [],
      },
    ],
    query: {
      enabled:        !!address,
      refetchInterval,
    },
  }) as {
    data: Array<{ result: unknown }> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  return {
    nexBalance:   nexData?.value             ?? 0n,
    exNEXBalance: (data?.[0]?.result as bigint) ?? 0n,
    totalSupply:  (data?.[1]?.result as bigint) ?? 0n,
    isLoading:    isLoadingNEX || isLoadingExNEX,
    isError,
    refetch,
  };
}