'use client';

import { useCallback, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import type { Address } from 'viem';
import { BaseError } from 'viem';
import { erc20ABI } from '@/lib/abis';
import type { TxStatus } from '@/types/contracts';
import { parseContractError, type WriteResult } from '@/lib/parseContractError';

interface UseApproveOptions {
  tokenAddress:   Address | null;
  spenderAddress: Address;
}

interface UseApproveReturn {
  approve:      (amount: bigint) => Promise<WriteResult>;
  txHash:       `0x${string}` | undefined;
  status:       TxStatus;
  isPending:    boolean;
  isConfirming: boolean;
  isSuccess:    boolean;
  isError:      boolean;
  error:        string | null;
  reset:        () => void;
}

export function useApprove({
  tokenAddress,
  spenderAddress,
}: UseApproveOptions): UseApproveReturn {
  const [localError,   setLocalError]   = useState<string | null>(null);
  const [localIsError, setLocalIsError] = useState(false);

  const {
    writeContractAsync,
    data: txHash,
    isPending,
    isError:   isWriteError,
    error:     writeError,
    reset:     wagmiReset,
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

  const approve = useCallback(
    async (amount: bigint): Promise<WriteResult> => {
      if (!tokenAddress) {
        setLocalError('No token address');
        setLocalIsError(true);
        return 'error';
      }
      reset();
      try {
        await writeContractAsync({
          address:      tokenAddress,
          abi:          erc20ABI,
          functionName: 'approve',
          args:         [spenderAddress, amount],
        });
        return 'success';
      } catch (err) {
        const { result, message } = parseContractError(err);
        setLocalError(message);
        if (result === 'error') setLocalIsError(true);
        return result;
      }
    },
    [writeContractAsync, tokenAddress, spenderAddress, reset]
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
    approve,
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