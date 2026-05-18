'use client';

import { useReadContract } from 'wagmi';
import { useAccount, useBlockNumber } from 'wagmi';
import type { Address } from 'viem';
import { CONTRACTS } from '@/lib/contracts';
import type { LiquidityLock, RawLiquidityLock } from '@/types/amm';
import { formatBlockToDate } from '@/lib/formatters';

interface UseLiquidityLockReturn {
  lock:      LiquidityLock | null;
  isLoading: boolean;
  isError:   boolean;
  refetch:   () => void;
}

export function useLiquidityLock(
  tokenA: Address,
  tokenB: Address,
  owner?: Address,
  refetchInterval = 12_000
): UseLiquidityLockReturn {
  const { address } = useAccount();
  const { data: currentBlock } = useBlockNumber({ watch: true });

  const targetOwner = owner ?? address;
  const enabled = !!targetOwner && !!tokenA && !!tokenB && tokenA !== tokenB;

  const { data, isLoading, isError, refetch } = useReadContract({
    address:      CONTRACTS.ExhibitionAMM.address,
    abi:          CONTRACTS.ExhibitionAMM.abi,
    functionName: 'getLiquidityLock',
    args:         targetOwner ? [tokenA, tokenB, targetOwner] : undefined,
    query: {
      enabled,
      refetchInterval,
    },
  });

  if (!data || !enabled || !currentBlock) {
    return { lock: null, isLoading, isError, refetch };
  }

  const [raw, blocksUntilUnlock] = data as [RawLiquidityLock, bigint];

  if (!raw?.isActive) {
    return { lock: null, isLoading, isError, refetch };
  }

  const lock: LiquidityLock = {
    owner:             raw.projectOwner,
    token0:            tokenA,
    token1:            tokenB,
    amount:            raw.lockedLPAmount,
    unlockBlock:       raw.unlockBlock,
    blocksUntilUnlock,
    unlockDateDisplay: formatBlockToDate(raw.unlockBlock, currentBlock),
    isUnlocked:        blocksUntilUnlock === 0n,
  };

  return { lock, isLoading, isError, refetch };
}