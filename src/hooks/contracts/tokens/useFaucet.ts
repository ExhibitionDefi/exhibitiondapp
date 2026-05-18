'use client';

import { useCallback, useState } from 'react';
import { useReadContracts, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { BaseError } from 'viem';
import { CONTRACTS } from '@/lib/contracts';
import type { TxStatus } from '@/types/contracts';
import { parseContractError, type WriteResult } from '@/lib/parseContractError';

interface FaucetSettings {
  cooldownBlocks:   bigint;
  amountEXH:        bigint;
  amountUSDX:       bigint;
  lastRequestBlock: bigint;
  blocksUntilNext:  bigint;
  canRequest:       boolean;
}

interface UseFaucetReturn {
  request:           () => Promise<WriteResult>;
  settings:          FaucetSettings | null;
  txHash:            `0x${string}` | undefined;
  status:            TxStatus;
  isPending:         boolean;
  isConfirming:      boolean;
  isSuccess:         boolean;
  isError:           boolean;
  error:             string | null;
  isLoadingSettings: boolean;
  reset:             () => void;
}

export function useFaucet(
  currentBlock?: bigint,
  refetchInterval = 12_000
): UseFaucetReturn {
  const [localError,   setLocalError]   = useState<string | null>(null);
  const [localIsError, setLocalIsError] = useState(false);

  const { address } = useAccount();

  const { data: settingsData, isLoading: isLoadingSettings } = useReadContracts({
    contracts: [
      {
        address:      CONTRACTS.Exhibition.address,
        abi:          CONTRACTS.Exhibition.abi,
        functionName: 'getFaucetSettings',
        args:         [],
      },
      {
        address:      CONTRACTS.Exhibition.address,
        abi:          CONTRACTS.Exhibition.abi,
        functionName: 'lastFaucetRequest',
        args:         address ? [address] : undefined,
      },
    ],
    query: {
      enabled:        !!address,
      refetchInterval,
    },
  }) as {
    data: Array<{ result: unknown }> | undefined;
    isLoading: boolean;
  };

  const {
    writeContractAsync,
    data: txHash,
    isPending,
    isError:  isWriteError,
    reset:    wagmiReset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError:   isReceiptError,
    error:     receiptError,
  } = useWaitForTransactionReceipt({
    hash:  txHash,
    query: { enabled: !!txHash },
  });

  const reset = useCallback(() => {
    wagmiReset();
    setLocalError(null);
    setLocalIsError(false);
  }, [wagmiReset]);

  const request = useCallback(async (): Promise<WriteResult> => {
    reset();
    try {
      await writeContractAsync({
        address:      CONTRACTS.Exhibition.address,
        abi:          CONTRACTS.Exhibition.abi,
        functionName: 'requestFaucetTokens',
        args:         [],
      });
      return 'success';
    } catch (err) {
      const { result, message } = parseContractError(err);
      setLocalError(message);
      if (result === 'error') setLocalIsError(true);
      return result;
    }
  }, [writeContractAsync, reset]);

  let settings: FaucetSettings | null = null;

  const rawSettings      = settingsData?.[0]?.result as unknown as [bigint, bigint, bigint] | undefined;
  const lastRequestBlock = (settingsData?.[1]?.result as bigint) ?? 0n;

  if (rawSettings) {
    const exhAmount      = rawSettings[0];
    const usdtAmount     = rawSettings[1];
    const cooldownBlocks = rawSettings[2];

    const nextAllowedBlock = lastRequestBlock + cooldownBlocks;
    const blocksUntilNext  = nextAllowedBlock > (currentBlock ?? 0n)
      ? nextAllowedBlock - (currentBlock ?? 0n)
      : 0n;

    settings = {
      cooldownBlocks,
      amountEXH:        exhAmount,
      amountUSDX:       usdtAmount,
      lastRequestBlock,
      blocksUntilNext,
      canRequest:       blocksUntilNext === 0n,
    };
  }

  const receiptErrorMessage = receiptError
    ? ((receiptError as BaseError).shortMessage ?? receiptError.message)
    : null;

  const status: TxStatus = isPending
    ? 'pending'
    : isConfirming
    ? 'confirming'
    : isSuccess
    ? 'success'
    : localIsError || isWriteError || isReceiptError
    ? 'error'
    : 'idle';

  return {
    request,
    settings,
    txHash,
    status,
    isPending,
    isConfirming,
    isSuccess,
    isError:           localIsError || isReceiptError,
    error:             localError ?? receiptErrorMessage,
    isLoadingSettings,
    reset,
  };
}