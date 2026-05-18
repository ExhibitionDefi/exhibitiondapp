'use client';

import { useReadContract } from 'wagmi';
import type { Address } from 'viem';
import { CONTRACTS } from '@/lib/contracts';
import { getTokenLogo } from '@/lib/tokenLogos';

export function useTokenLogo(tokenAddress: Address | null): string {
  // Check static map first
  const staticLogo = tokenAddress ? getTokenLogo(tokenAddress) : '';
  const hasStaticLogo = staticLogo !== '/logos/unknown.png' && staticLogo !== '';

  // Fetch from factory if no static logo
  const { data: factoryLogo } = useReadContract({
    address:      CONTRACTS.ExhibitionFactory.address,
    abi:          [{
      inputs:  [{ internalType: 'address', name: 'tokenAddress', type: 'address' }],
      name:    'getTokenLogoURI',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type:    'function',
    }],
    functionName: 'getTokenLogoURI',
    args:         tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled:   !!tokenAddress && !hasStaticLogo,
      staleTime: Infinity,
    },
  });

  if (hasStaticLogo) return staticLogo;
  if (factoryLogo && typeof factoryLogo === 'string' && factoryLogo.length > 0) return factoryLogo;
  return '/logos/unknown.png';
}