'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { erc20ABI } from '@/lib/abis';
import { formatProjectStatus, blocksToRealDays } from '@/lib/formatters';
import type { Project, VestingInfo, RawProjectDetails } from '@/types/project';
import { formatUnits } from 'viem';
import { keepPreviousData } from '@tanstack/react-query';
import { tokenMetadataCache } from '@/lib/tokenMetadataCache';

// ── Bigint-safe structural sharing ───────────────────────────────────────────
// React Query's default deep-equal stumbles on bigints. This serialises them
// as strings for comparison and returns the OLD reference when nothing changed,
// so consumers only re-render when on-chain data actually differs.
function bigintStructuralSharing<T>(oldData: T, newData: T): T {
  const serialize = (_: string, v: unknown) =>
    typeof v === 'bigint' ? v.toString() : v;
  return JSON.stringify(oldData, serialize) === JSON.stringify(newData, serialize)
    ? oldData
    : newData;
}

interface UseAllProjectsOptions {
  ids?:             bigint[];
  offset?:          number;
  limit?:           number;
  refetchInterval?: number;
  enabled?:         boolean;
}

interface UseAllProjectsReturn {
  projects:  Project[];
  total:     number;
  isLoading: boolean;
  isError:   boolean;
  refetch:   () => void;
}

export function useAllProjects({
  ids,
  offset          = 0,
  limit           = 50,
  refetchInterval = 12_000,
  enabled         = true,
}: UseAllProjectsOptions = {}): UseAllProjectsReturn {

  // ── Step 1: Total count ───────────────────────────────────
  const {
    data:      projectCount,
    isLoading: isLoadingCount,
  } = useReadContract({
    address:      CONTRACTS.Exhibition.address,
    abi:          CONTRACTS.Exhibition.abi,
    functionName: 'getProjectCount',
    query: {
      enabled,
      refetchInterval,
      placeholderData:     keepPreviousData,
      structuralSharing:   bigintStructuralSharing,
      notifyOnChangeProps: ['data'],
    },
  }) as { data: bigint | undefined; isLoading: boolean };

  const total = Number(projectCount ?? 0n);

  // ── Step 2: Paginated project IDs ────────────────────────
  // Only runs when no explicit ids are passed (browse/all-projects mode)
  const {
    data:      projectIds,
    isLoading: isLoadingIds,
  } = useReadContract({
    address:      CONTRACTS.Exhibition.address,
    abi:          CONTRACTS.Exhibition.abi,
    functionName: 'getProjects',
    args:         [BigInt(offset), BigInt(limit)],
    query: {
      enabled:             enabled && !ids && total > 0,
      refetchInterval,
      placeholderData:     keepPreviousData,
      structuralSharing:   bigintStructuralSharing,
      notifyOnChangeProps: ['data'],
    },
  });

  const resolvedIds = ids ?? (projectIds as bigint[] | undefined) ?? [];

  // ── Step 3: Project details ───────────────────────────────
  const detailContracts = resolvedIds.map((id) => ({
    address:      CONTRACTS.Exhibition.address,
    abi:          CONTRACTS.Exhibition.abi,
    functionName: 'getProjectDetails' as const,
    args:         [id] as const,
  }));

  const {
    data:         detailsData,
    isLoading:    isLoadingDetails,
    isRefetching: isRefetchingDetails,
    isError,
    refetch,
  } = useReadContracts({
    contracts: detailContracts,
    query: {
      enabled:             enabled && resolvedIds.length > 0,
      refetchInterval,
      placeholderData:     keepPreviousData,
      structuralSharing:   bigintStructuralSharing,
      notifyOnChangeProps: ['data'],
    },
  });

  // ── Step 3b: Token summaries ──────────────────────────────
  const summaryContracts = resolvedIds.map((id) => ({
    address:      CONTRACTS.Exhibition.address,
    abi:          CONTRACTS.Exhibition.abi,
    functionName: 'getProjectTokenSummary' as const,
    args:         [id] as const,
  }));

  const { data: summaryData } = useReadContracts({
    contracts: summaryContracts,
    query: {
      enabled:             enabled && resolvedIds.length > 0,
      refetchInterval,
      placeholderData:     keepPreviousData,
      structuralSharing:   bigintStructuralSharing,
      notifyOnChangeProps: ['data'],
    },
  });

  // ── Step 4: Determine which addresses need fetching ───────
  const projectTokenAddresses = (detailsData ?? []).map((result) => {
    const raw = result?.result as unknown as RawProjectDetails | undefined;
    return raw?.[0]?.projectToken as `0x${string}` | undefined;
  });

  const contributionTokenAddresses = (detailsData ?? []).map((result) => {
    const raw = result?.result as unknown as RawProjectDetails | undefined;
    return raw?.[0]?.contributionTokenAddress as `0x${string}` | undefined;
  });

  const hasDetails                  = !!detailsData && detailsData.length > 0;
  const needsProjectTokenFetch      = projectTokenAddresses.some(a => a && !tokenMetadataCache.has(a));
  const needsContributionTokenFetch = contributionTokenAddresses.some(a => a && !tokenMetadataCache.has(a));

  // ── Step 5: Fetch project token name + symbol ────────────
  const {
    data:      projectTokenNames,
    isLoading: isLoadingTokenNames,
  } = useReadContracts({
    contracts: projectTokenAddresses.map(address => ({
      address:      (address ?? '0x0') as `0x${string}`,
      abi:          erc20ABI,
      functionName: 'name' as const,
      args:         [] as const,
    })),
    query: {
      enabled:   hasDetails && needsProjectTokenFetch,
      staleTime: Infinity,
    },
  });

  const {
    data:      projectTokenSymbols,
    isLoading: isLoadingTokenSymbols,
  } = useReadContracts({
    contracts: projectTokenAddresses.map(address => ({
      address:      (address ?? '0x0') as `0x${string}`,
      abi:          erc20ABI,
      functionName: 'symbol' as const,
      args:         [] as const,
    })),
    query: {
      enabled:   hasDetails && needsProjectTokenFetch,
      staleTime: Infinity,
    },
  });

  // ── Step 6: Fetch contribution token decimals + symbol ───
  const {
    data:      decimalsData,
    isLoading: isLoadingDecimals,
  } = useReadContracts({
    contracts: contributionTokenAddresses.map(address => ({
      address:      (address ?? '0x0') as `0x${string}`,
      abi:          erc20ABI,
      functionName: 'decimals' as const,
      args:         [] as const,
    })),
    query: {
      enabled:   hasDetails && needsContributionTokenFetch,
      staleTime: Infinity,
    },
  });

  const {
    data:      ctSymbols,
    isLoading: isLoadingCtSymbols,
  } = useReadContracts({
    contracts: contributionTokenAddresses.map(address => ({
      address:      (address ?? '0x0') as `0x${string}`,
      abi:          erc20ABI,
      functionName: 'symbol' as const,
      args:         [] as const,
    })),
    query: {
      enabled:   hasDetails && needsContributionTokenFetch,
      staleTime: Infinity,
    },
  });

  // ── Step 7: Populate cache with fresh data ────────────────
  projectTokenAddresses.forEach((address, i) => {
    if (!address || tokenMetadataCache.has(address)) return;
    const name   = projectTokenNames?.[i]?.result   as string | undefined;
    const symbol = projectTokenSymbols?.[i]?.result as string | undefined;
    if (name && symbol) {
      tokenMetadataCache.set(address, { name, symbol, decimals: 18 });
    }
  });

  contributionTokenAddresses.forEach((address, i) => {
    if (!address || tokenMetadataCache.has(address)) return;
    const decimals = decimalsData?.[i]?.result as number | undefined;
    const symbol   = ctSymbols?.[i]?.result   as string | undefined;
    if (decimals !== undefined && symbol) {
      tokenMetadataCache.set(address, { name: symbol, symbol, decimals });
    }
  });

  // ── Step 8 prep: check if all metadata is already cached ─
  const allMetadataCached = resolvedIds.length > 0 &&
    projectTokenAddresses.length > 0 &&
    projectTokenAddresses.every(a => !a || tokenMetadataCache.has(a)) &&
    contributionTokenAddresses.every(a => !a || tokenMetadataCache.has(a));

  // ── Step 8: Build projects from cache ────────────────────
  const projects: Project[] = [];
  let allMetadataReady = resolvedIds.length === 0; // vacuously true when nothing to process

  if (detailsData && resolvedIds.length > 0) {
    // Guard against keepPreviousData length mismatch between resolvedIds and detailsData
    const safeLength = Math.min(resolvedIds.length, detailsData.length);
    let readyCount = 0;

    for (let index = 0; index < safeLength; index++) {
      const projectId = resolvedIds[index];
      if (!projectId) continue;

      const raw = detailsData[index]?.result as unknown as RawProjectDetails | undefined;
      if (!raw || !raw[0]) continue;

      const p = raw[0];
      if (p.vestingEnabled === undefined) continue;

      const projectTokenMeta      = tokenMetadataCache.get(p.projectToken);
      const contributionTokenMeta = tokenMetadataCache.get(p.contributionTokenAddress);

      // Skip project if metadata not cached yet — readyCount won't increment
      if (!projectTokenMeta || !contributionTokenMeta) continue;

      readyCount++;

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

      const ctDecimals = contributionTokenMeta.decimals;

      projects.push({
        projectId,
        owner:                     p.projectOwner,
        projectToken:              p.projectToken,
        totalSupply:               p.totalProjectTokenSupply,
        contributionToken:         p.contributionTokenAddress,
        tokenName:                 projectTokenMeta.name,
        tokenSymbol:               projectTokenMeta.symbol,
        tokenDecimals:             18,
        tokenLogoURI:              p.projectTokenLogoURI,
        fundingGoal:               p.fundingGoal,
        softCap:                   p.softCap,
        minContribution:           p.minContribution,
        maxContribution:           p.maxContribution,
        tokenPrice:                p.tokenPrice,
        amountTokensForSale:       p.amountTokensForSale,
        liquidityPercentage:       p.liquidityPercentage,
        lockDurationBlocks:        p.lockDurationBlocks,
        startBlock:                p.startBlock,
        endBlock:                  p.endBlock,
        totalRaised:               p.totalRaised,
        contributorCount:          raw[6],
        status:                    formatProjectStatus(p.status),
        liquidityAdded:            p.liquidityAdded,
        successBlock:              0n,
        vesting,
        progressPercent:           Number(raw[1]) / 100,
        blocksRemaining:           raw[2],
        fundingGoalDisplay:        formatUnits(p.fundingGoal, ctDecimals),
        totalRaisedDisplay:        formatUnits(p.totalRaised, ctDecimals),
        softCapDisplay:            formatUnits(p.softCap,     ctDecimals),
        requiredLiquidityTokens:   raw[4],
        depositedLiquidityTokens:  raw[5],
        contributionTokenDecimals: ctDecimals,
        contributionTokenSymbol:   contributionTokenMeta.symbol,
        tokensSold:            (summaryData?.[index]?.result as any)?.[1] ?? 0n,
        unsoldTokensWithdrawn: (summaryData?.[index]?.result as any)?.[3] ?? 0n,
      });
    }

    // All valid (non-skipped) entries must have had their metadata ready
    allMetadataReady = readyCount === safeLength;
  }

  const isFetchingUncachedProjectTokens =
    needsProjectTokenFetch && (isLoadingTokenNames || isLoadingTokenSymbols);
  const isFetchingUncachedCtTokens =
    needsContributionTokenFetch && (isLoadingDecimals || isLoadingCtSymbols);

  return {
    projects,
    total,
    isLoading: isLoadingCount                              ||
               isLoadingIds                               ||
               (isLoadingDetails && !isRefetchingDetails) ||
               isFetchingUncachedProjectTokens            ||
               isFetchingUncachedCtTokens                 ||
               (!allMetadataReady && !allMetadataCached),
    isError,
    refetch,
  };
}