'use client';

import { useMemo } from 'react';
import { useAllPools } from '@/hooks/contracts/amm';
import { getTokenLogo } from '@/lib/tokenLogos';
import type { Address } from 'viem';

export interface TokenInfo {
  address:  Address;
  symbol:   string;
  decimals: number;
  logoURI:  string;
}

const PLATFORM_TOKENS: TokenInfo[] = [
  {
    address:  process.env.NEXT_PUBLIC_EXH_ADDRESS! as Address,
    symbol:   'EXH',
    decimals: 18,
    logoURI:  getTokenLogo(process.env.NEXT_PUBLIC_EXH_ADDRESS ?? ''),
  },
  {
    address:  process.env.NEXT_PUBLIC_NEXUS_USD_ADDRESS! as Address,
    symbol:   'USDX',
    decimals: 6,
    logoURI:  getTokenLogo(process.env.NEXT_PUBLIC_NEXUS_USD_ADDRESS ?? ''),
  },
  {
    address:  process.env.NEXT_PUBLIC_EXHIBITION_NEX_ADDRESS! as Address,
    symbol:   'exNEX',
    decimals: 18,
    logoURI:  getTokenLogo(process.env.NEXT_PUBLIC_EXHIBITION_NEX_ADDRESS ?? ''),
  },
];

export function useTokenList() {
  const { pools } = useAllPools();

  const tokens = useMemo<TokenInfo[]>(() => {
    const map = new Map<string, TokenInfo>();

    // Add platform tokens first
    PLATFORM_TOKENS.forEach(t => map.set(t.address.toLowerCase(), t));

    // Add pool tokens (project tokens)
    pools.forEach(pool => {
      if (!map.has(pool.tokenA.toLowerCase())) {
        map.set(pool.tokenA.toLowerCase(), {
          address:  pool.tokenA,
          symbol:   '',   // hydrated by useTokenBalance where needed
          decimals: 18,
          logoURI:  getTokenLogo(pool.tokenA),
        });
      }
      if (!map.has(pool.tokenB.toLowerCase())) {
        map.set(pool.tokenB.toLowerCase(), {
          address:  pool.tokenB,
          symbol:   '',
          decimals: 18,
          logoURI:  getTokenLogo(pool.tokenB),
        });
      }
    });

    return Array.from(map.values());
  }, [pools]);

  return { tokens };
}