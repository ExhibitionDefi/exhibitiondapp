'use client';

import { useCallback, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BaseError } from 'viem';
import { CONTRACTS } from '@/lib/contracts';
import type { TxStatus } from '@/types/contracts';
import { parseContractError, type WriteResult } from '@/lib/parseContractError';

interface UseDepositTokensReturn {
  depositTokens: (projectId: bigint, amount: bigint) => Promise<WriteResult>;
  txHash:        `0x${string}` | undefined;
  status:        TxStatus;
  isPending:     boolean;
  isConfirming:  boolean;
  isSuccess:     boolean;
  isError:       boolean;
  error:         string | null;
  reset:         () => void;
}

export function useDepositTokens(): UseDepositTokensReturn {
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

  const depositTokens = useCallback(
    async (projectId: bigint, amount: bigint): Promise<WriteResult> => {
      reset();
      try {
        await writeContractAsync({
          address:      CONTRACTS.Exhibition.address,
          abi:          CONTRACTS.Exhibition.abi,
          functionName: 'depositProjectTokens',
          args:         [projectId, amount],
        });
        return 'success';
      } catch (err) {
        const { result, message } = parseContractError(err);
        setLocalError(message);
        if (result === 'error') setLocalIsError(true);
        return result;
      }
    },
    [writeContractAsync, reset]
  );

  // Receipt error also needs a parsed message
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
    depositTokens,
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