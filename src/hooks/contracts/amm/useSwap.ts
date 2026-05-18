'use client';

import { useCallback, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import type { Address } from 'viem';
import { BaseError } from 'viem';
import { CONTRACTS } from '@/lib/contracts';
import type { TxStatus } from '@/types/contracts';
import { parseContractError, type WriteResult } from '@/lib/parseContractError';

interface SwapParams {
  tokenIn:      Address;
  tokenOut:     Address;
  amountIn:     bigint;
  minAmountOut: bigint;
  deadline:     bigint;
}

interface UseSwapReturn {
  swap:         (params: SwapParams) => Promise<WriteResult>;
  txHash:       `0x${string}` | undefined;
  status:       TxStatus;
  isPending:    boolean;
  isConfirming: boolean;
  isSuccess:    boolean;
  isError:      boolean;
  error:        string | null;
  reset:        () => void;
}

export function useSwap(): UseSwapReturn {
  const [localError,   setLocalError]   = useState<string | null>(null);
  const [localIsError, setLocalIsError] = useState(false);

  const { address } = useAccount();

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

  const swap = useCallback(
    async ({ tokenIn, tokenOut, amountIn, minAmountOut, deadline }: SwapParams): Promise<WriteResult> => {
      if (!address) {
        setLocalError('Wallet not connected');
        setLocalIsError(true);
        return 'error';
      }
      reset();
      try {
        await writeContractAsync({
          address:      CONTRACTS.ExhibitionAMM.address,
          abi:          CONTRACTS.ExhibitionAMM.abi,
          functionName: 'swapTokenForToken',
          args:         [tokenIn, tokenOut, amountIn, minAmountOut, address, deadline],
        });
        return 'success';
      } catch (err) {
        const { result, message } = parseContractError(err);
        setLocalError(message);
        if (result === 'error') setLocalIsError(true);
        return result;
      }
    },
    [writeContractAsync, address, reset]
  );

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
    swap,
    txHash,
    status,
    isPending,
    isConfirming,
    isSuccess,
    isError: localIsError || isReceiptError,
    error:   localError ?? receiptErrorMessage,
    reset,
  };
}