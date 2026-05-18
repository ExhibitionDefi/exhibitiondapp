'use client';

import { useMemo, useCallback } from 'react';
import { useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import type { Address } from 'viem';
import { exhibitionAMMABI } from '@/lib/abis';
import { CONTRACTS } from '@/lib/contracts';
import { USDX_ADDRESS } from '@/lib/constants';

// ============================================================
// Types
// ============================================================

interface UseLocalPricingReturn {
  /** Get token price in USDX terms. Returns null if no path found. */
  getTokenPrice: (tokenAddress: Address) => number | null;
  /** Get formatted token price as USD string e.g. "$1,234.56" or "N/A" */
  getTokenPriceUSD: (tokenAddress: Address) => string;
  /** Calculate total value locked in USD terms */
  calculateTVL: (
    tokenA: Address,
    amountA: bigint,
    tokenB: Address,
    amountB: bigint,
    decimalsA: number,
    decimalsB: number
  ) => number;
  /** The base token address (USDX) */
  USDXAddress: Address;
  /** Whether pricing data is ready */
  isReady: boolean;
  /** Whether any pricing data is currently loading */
  isLoading: boolean;
}

interface UseLocalPricingOptions {
  /** Maximum number of hops to find price path. Default: 4 */
  maxHops?: number;
  /** Refetch interval in milliseconds. Default: 12000 (12 seconds) */
  refetchInterval?: number;
}

// ============================================================
// Hook
// ============================================================

/**
 * Local token pricing using pool reserves and multi-hop price discovery.
 * Calculates token prices relative to USDX by finding paths through
 * liquidity pools via BFS. Testnet utility — not a production oracle.
 *
 * @example
 * ```tsx
 * const { getTokenPrice, calculateTVL, isReady } = useLocalPricing();
 * if (!isReady) return <LoadingSpinner />;
 * const price = getTokenPrice(TOKEN_ADDRESS); // 1.25
 * ```
 */
export function useLocalPricing(
  options: UseLocalPricingOptions = {}
): UseLocalPricingReturn {
  const { maxHops = 4, refetchInterval = 12_000 } = options;
  const USDXAddress = USDX_ADDRESS as Address;

  // ── Step 1: Fetch all pool pairs ──────────────────────────
  const { data: poolsData, isLoading: isLoadingPools } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.ExhibitionAMM.address,
        abi: exhibitionAMMABI,
        functionName: 'getAllPoolPairs',
        args: [],
      },
    ],
    query: {
      refetchInterval,
      staleTime: refetchInterval / 2,
    },
  });

  const allPoolPairsResult = poolsData?.[0]?.result as Address[][] | undefined;

  // ── Step 2: Build pool pairs ───────
  // getAllPoolPairs returns: [tokenA0, tokenB0, tokenA1, tokenB1, ...]
  const poolPairs = useMemo(() => {
    if (!allPoolPairsResult || allPoolPairsResult.length === 0) return [];

    return allPoolPairsResult.map(pair => ({
      tokenA: pair[0] as Address,
      tokenB: pair[1] as Address,
    }));
  }, [allPoolPairsResult]);

  // ── Step 3: Build adjacency graph for pathfinding ─────────
  const poolGraph = useMemo(() => {
    const graph = new Map<Address, Set<Address>>();

    poolPairs.forEach(({ tokenA, tokenB }) => {
      if (!graph.has(tokenA)) graph.set(tokenA, new Set());
      if (!graph.has(tokenB)) graph.set(tokenB, new Set());
      graph.get(tokenA)!.add(tokenB);
      graph.get(tokenB)!.add(tokenA);
    });

    return graph;
  }, [poolPairs]);

  // ── Step 4: BFS pathfinding to USDX ─────────────────────
  const findPathToUSDX = useMemo(() => {
    return (tokenAddress: Address): Address[] | null => {
      if (tokenAddress.toLowerCase() === USDXAddress.toLowerCase()) {
        return [USDXAddress];
      }

      if (poolGraph.size === 0) return null;

      const queue: Array<{ token: Address; path: Address[] }> = [
        { token: tokenAddress, path: [tokenAddress] },
      ];
      const visited = new Set<string>([tokenAddress.toLowerCase()]);

      while (queue.length > 0) {
        const { token, path } = queue.shift()!;

        if (path.length > maxHops) continue;

        const neighbors = poolGraph.get(token);
        if (!neighbors) continue;

        for (const neighbor of neighbors) {
          const neighborLower = neighbor.toLowerCase();

          if (neighborLower === USDXAddress.toLowerCase()) {
            return [...path, neighbor];
          }

          if (visited.has(neighborLower)) continue;

          visited.add(neighborLower);
          queue.push({ token: neighbor, path: [...path, neighbor] });
        }
      }

      return null;
    };
  }, [poolGraph, USDXAddress, maxHops]);

  // ── Step 5: Fetch token decimals ──────────────────────────
  const allTokens = useMemo(() => {
    const tokens = new Set<Address>();
    poolPairs.forEach(({ tokenA, tokenB }) => {
      tokens.add(tokenA);
      tokens.add(tokenB);
    });
    return Array.from(tokens);
  }, [poolPairs]);

  const { data: tokensInfoData, isLoading: isLoadingTokens } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.ExhibitionAMM.address,
        abi: exhibitionAMMABI,
        functionName: 'getTokensInfo',
        args: allTokens.length > 0 ? [allTokens] : undefined,
      },
    ],
    query: {
      enabled: allTokens.length > 0,
      refetchInterval: refetchInterval * 2,
      staleTime: refetchInterval,
    },
  });

  const tokensInfo = tokensInfoData?.[0]?.result as
    | readonly [readonly string[], readonly bigint[], readonly bigint[]]
    | undefined;

  // Build decimals map
  const decimalsMap = useMemo(() => {
    if (!tokensInfo) return new Map<string, number>();

    const [, decimals] = tokensInfo;
    const map = new Map<string, number>();

    allTokens.forEach((token, index) => {
      if (decimals[index]) {
        map.set(token.toLowerCase(), Number(decimals[index]));
      }
    });

    return map;
  }, [tokensInfo, allTokens]);

  // ── Step 6: Normalize token pair to canonical order ───────
  const normalizeTokenPair = useCallback(
    (tokenA: Address, tokenB: Address) => {
      const aLower = tokenA.toLowerCase();
      const bLower = tokenB.toLowerCase();
      return aLower < bLower
        ? { token0: tokenA, token1: tokenB, isReversed: false }
        : { token0: tokenB, token1: tokenA, isReversed: true };
    },
    []
  );

  // ── Step 7: Pre-fetch all pool prices ─────────────────────
  const priceContracts = useMemo(() => {
    return poolPairs.map(({ tokenA, tokenB }) => {
      const { token0, token1 } = normalizeTokenPair(tokenA, tokenB);
      return {
        address: CONTRACTS.ExhibitionAMM.address,
        abi: exhibitionAMMABI,
        functionName: 'getPrice' as const,
        args: [token0, token1] as const,
      };
    });
  }, [poolPairs, normalizeTokenPair]);

  const { data: pricesData, isLoading: isLoadingPrices } = useReadContracts({
    contracts: priceContracts,
    query: {
      enabled: poolPairs.length > 0,
      refetchInterval,
      staleTime: refetchInterval / 2,
    },
  });

   // Build price cache: "token0-token1" -> rawPrice
  const priceCache = useMemo(() => {
    if (!pricesData) return new Map<string, bigint>();

    const cache = new Map<string, bigint>();
    const prices = pricesData as Array<{ result: bigint | undefined }>;

    poolPairs.forEach((pair, index) => {
      const rawPrice = prices[index]?.result;
      if (!rawPrice) return;

      const { token0, token1 } = normalizeTokenPair(pair.tokenA, pair.tokenB);
      const key = `${token0.toLowerCase()}-${token1.toLowerCase()}`;
      cache.set(key, rawPrice);
    });

    return cache;
  }, [pricesData, poolPairs, normalizeTokenPair]);

  // ── Step 8: Get price for a single hop ───────────────────
  const getPriceForHop = useCallback(
    (tokenA: Address, tokenB: Address): number | null => {
      const { token0, token1, isReversed } = normalizeTokenPair(tokenA, tokenB);
      const key = `${token0.toLowerCase()}-${token1.toLowerCase()}`;

      const rawPrice = priceCache.get(key);
      if (!rawPrice) return null;

      const token0Decimals = decimalsMap.get(token0.toLowerCase()) ?? 18;
      const token1Decimals = decimalsMap.get(token1.toLowerCase()) ?? 18;

      // rawPrice = (reserve1 * 10^token1Decimals * 10^18) / (reserve0 * 10^token0Decimals)
      // true price (1 token0 = X token1):
      // price = rawPrice / 10^(token1Decimals - token0Decimals + 18)
      const exponent = token0Decimals - token1Decimals - 18;
      let price = parseFloat(formatUnits(rawPrice, -exponent));

      // Invert if tokenA is actually token1
      if (isReversed) price = 1 / price;

      return price;
    },
    [normalizeTokenPair, priceCache, decimalsMap]
  );

  // ── Step 9: Calculate price along full path ───────────────
  const calculatePriceAlongPath = useCallback(
    (path: Address[]): number | null => {
      if (path.length < 2) return null;

      let finalPrice = 1;

      for (let i = 0; i < path.length - 1; i++) {
        const hopPrice = getPriceForHop(path[i], path[i + 1]);
        if (hopPrice === null) return null;
        finalPrice *= hopPrice;
      }

      return finalPrice;
    },
    [getPriceForHop]
  );

  // ── Derived state ─────────────────────────────────────────
  const isReady =
    !isLoadingPools &&
    !isLoadingTokens &&
    !isLoadingPrices &&
    poolPairs.length > 0;

  // ── Public API ────────────────────────────────────────────
  const getTokenPrice = useCallback(
    (tokenAddress: Address): number | null => {
      if (!isReady) return null;

      if (tokenAddress.toLowerCase() === USDXAddress.toLowerCase()) return 1;

      const path = findPathToUSDX(tokenAddress);
      if (!path || path.length < 2) return null;

      return calculatePriceAlongPath(path);
    },
    [isReady, USDXAddress, findPathToUSDX, calculatePriceAlongPath]
  );

  const getTokenPriceUSD = useCallback(
    (tokenAddress: Address): string => {
      const price = getTokenPrice(tokenAddress);
      if (price === null) return 'N/A';

      if (price < 0.01) {
        return `$${price.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        })}`;
      }

      return `$${price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [getTokenPrice]
  );

  const calculateTVL = useCallback(
    (
      tokenA: Address,
      amountA: bigint,
      tokenB: Address,
      amountB: bigint,
      decimalsA: number,
      decimalsB: number
    ): number => {
      if (!isReady) return 0;

      try {
        const priceA = getTokenPrice(tokenA);
        const priceB = getTokenPrice(tokenB);

        const formattedAmountA = parseFloat(formatUnits(amountA, decimalsA));
        const formattedAmountB = parseFloat(formatUnits(amountB, decimalsB));

        const valueA = priceA !== null ? formattedAmountA * priceA : 0;
        const valueB = priceB !== null ? formattedAmountB * priceB : 0;

        return valueA + valueB;
      } catch {
        return 0;
      }
    },
    [isReady, getTokenPrice]
  );

  return {
    getTokenPrice,
    getTokenPriceUSD,
    calculateTVL,
    USDXAddress,
    isReady,
    isLoading: isLoadingPools || isLoadingTokens || isLoadingPrices,
  };
}