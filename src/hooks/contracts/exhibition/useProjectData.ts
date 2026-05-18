'use client';

import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { formatProjectStatus, blocksToRealDays } from '@/lib/formatters';
import type { Project, VestingInfo, RawProjectDetails } from '@/types/project';
import { erc20ABI } from '@/lib/abis/erc20ABI';
import { formatUnits } from 'viem';
import { keepPreviousData } from '@tanstack/react-query';

interface UseProjectDataReturn {
  project:   Project | null;
  isLoading: boolean;
  isError:   boolean;
  refetch:   () => void;
}

export function useProjectData(
  projectId: bigint,
  refetchInterval = 12_000
): UseProjectDataReturn {
  const { data, isLoading, isError, refetch, isRefetching } = useReadContract({
    address:      CONTRACTS.Exhibition.address,
    abi:          CONTRACTS.Exhibition.abi,
    functionName: 'getProjectDetails',
    args:         [projectId],
    query: {
      enabled:        projectId >= 0n,
      refetchInterval,
      placeholderData: keepPreviousData,
    },
  });

  // ── Extract contribution token address before early return
  const raw = data as unknown as RawProjectDetails | undefined;
  const contributionTokenAddress = raw?.[0]?.contributionTokenAddress;

  // ── Decimals fetch — must be before any early return ─────
  const { data: ctDecimals } = useReadContract({
    address:      contributionTokenAddress as `0x${string}` | undefined,
    abi:          erc20ABI,
    functionName: 'decimals',
    query: {
      enabled:   !!contributionTokenAddress,
      staleTime: Infinity,
    },
  });

  const { data: ctSymbol } = useReadContract({
    address:      contributionTokenAddress as `0x${string}` | undefined,
    abi:          erc20ABI,
    functionName: 'symbol',
    query: {
      enabled:   !!contributionTokenAddress,
      staleTime: Infinity,
    },
  });

  const { data: projectTokenName } = useReadContract({
    address:      raw?.[0]?.projectToken as `0x${string}` | undefined,
    abi:          erc20ABI,
    functionName: 'name',
    query: {
      enabled:   !!raw?.[0]?.projectToken,
      staleTime: Infinity,
    },
  });

  const { data: projectTokenSymbol } = useReadContract({
    address:      raw?.[0]?.projectToken as `0x${string}` | undefined,
    abi:          erc20ABI,
    functionName: 'symbol',
    query: {
      enabled:   !!raw?.[0]?.projectToken,
      staleTime: Infinity,
    },
  });

  const { data: tokenSummary } = useReadContract({
    address:      CONTRACTS.Exhibition.address,
    abi:          CONTRACTS.Exhibition.abi,
    functionName: 'getProjectTokenSummary',
    args:         [projectId],
    query: {
      enabled: projectId >= 0n,
      refetchInterval,
      placeholderData: keepPreviousData,
    },
  });

  const { data: successBlockData } = useReadContract({
    address:      CONTRACTS.Exhibition.address,
    abi:          CONTRACTS.Exhibition.abi,
    functionName: 'successBlock',
    args:         [projectId],
    query: {
      enabled: projectId >= 0n,
      staleTime: Infinity,
    },
  });

  if (!data || (isLoading && !isRefetching) || !raw) {
    return { project: null, isLoading: isLoading && !isRefetching, isError, refetch };
  }

  const p = raw[0];

  // ── Vesting ───────────────────────────────────────────────
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

  // ── Assemble project ──────────────────────────────────────
  const project: Project = {
    projectId,
    owner:               p.projectOwner,
    projectToken:        p.projectToken,
    totalSupply:         p.totalProjectTokenSupply,
    contributionToken:   p.contributionTokenAddress,
    tokenName:           (projectTokenName as string) ?? '',
    tokenSymbol:         (projectTokenSymbol as string) ?? '',
    tokenDecimals:       18,
    tokenLogoURI:        p.projectTokenLogoURI,
    fundingGoal:         p.fundingGoal,
    softCap:             p.softCap,
    minContribution:     p.minContribution,
    maxContribution:     p.maxContribution,
    tokenPrice:          p.tokenPrice,
    amountTokensForSale: p.amountTokensForSale,
    liquidityPercentage: p.liquidityPercentage,
    lockDurationBlocks:  p.lockDurationBlocks,
    startBlock:          p.startBlock,
    endBlock:            p.endBlock,
    totalRaised:         p.totalRaised,
    contributorCount:    raw[6],
    status:              formatProjectStatus(p.status),
    liquidityAdded:      p.liquidityAdded,
    successBlock:        (successBlockData as bigint) ?? 0n,
    vesting,
    progressPercent:     Number(raw[1]) / 100,
    blocksRemaining:     raw[2],
    fundingGoalDisplay:  formatUnits(p.fundingGoal, (ctDecimals as number) ?? 6),
    totalRaisedDisplay:  formatUnits(p.totalRaised, (ctDecimals as number) ?? 6),
    softCapDisplay:      formatUnits(p.softCap, (ctDecimals as number) ?? 6),
    requiredLiquidityTokens:  raw[4],
    depositedLiquidityTokens: raw[5],
    contributionTokenDecimals: (ctDecimals as number) ?? 6,
    contributionTokenSymbol:  (ctSymbol as string) ?? '',
    tokensSold:            (tokenSummary as any)?.[1] ?? 0n,
    unsoldTokensWithdrawn: (tokenSummary as any)?.[3] ?? 0n,
  };

  return { project, isLoading: isLoading && !isRefetching, isError, refetch };
}