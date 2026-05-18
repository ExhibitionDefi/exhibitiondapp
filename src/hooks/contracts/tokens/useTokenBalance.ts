'use client';

import { useReadContract } from 'wagmi';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { erc20ABI } from '@/lib/abis';
import { getTokenLogo } from '@/lib/tokenLogos';

interface UseTokenBalanceOptions {
  tokenAddress:     Address | null;
  walletAddress?:   Address;
  refetchInterval?: number;
}

interface UseTokenBalanceReturn {
  balance:   bigint;
  decimals:  number;
  symbol:    string;
  logoURI:   string;
  isLoading: boolean;
  isError:   boolean;
  refetch:   () => void;
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;

export function useTokenBalance({
  tokenAddress,
  walletAddress,
  refetchInterval = 12_000,
}: UseTokenBalanceOptions): UseTokenBalanceReturn {
  const { address: connectedAddress } = useAccount();
  const targetAddress = walletAddress ?? connectedAddress;
  const enabled       = !!tokenAddress && tokenAddress !== ZERO_ADDRESS;

  const { data: balance, isLoading: isLoadingBalance, isError: isErrorBalance, refetch } = useReadContract({
    address:      tokenAddress ?? ZERO_ADDRESS,
    abi:          erc20ABI,
    functionName: 'balanceOf',
    args:         targetAddress ? [targetAddress] : undefined,
    query: {
      enabled:        enabled && !!targetAddress,
      refetchInterval,
    },
  });

  const { data: decimals, isLoading: isLoadingDecimals } = useReadContract({
    address:      tokenAddress ?? ZERO_ADDRESS,
    abi:          erc20ABI,
    functionName: 'decimals',
    query: {
      enabled,
      staleTime: Infinity,
    },
  });

  const { data: symbol, isLoading: isLoadingSymbol } = useReadContract({
    address:      tokenAddress ?? ZERO_ADDRESS,
    abi:          erc20ABI,
    functionName: 'symbol',
    query: {
      enabled,
      staleTime: Infinity,
    },
  });

  return {
    balance:   enabled ? ((balance  as bigint)  ?? 0n)  : 0n,
    decimals:  enabled ? ((decimals as number)  ?? 18)  : 18,
    symbol:    enabled ? ((symbol   as string)  ?? '')  : '',
    logoURI:   enabled ? getTokenLogo(tokenAddress!)    : '/logos/unknown.png',
    isLoading: enabled && (isLoadingBalance || isLoadingDecimals || isLoadingSymbol),
    isError:   isErrorBalance,
    refetch,
  };
}