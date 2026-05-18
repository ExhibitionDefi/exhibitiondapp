'use client';

import { useCallback, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BaseError } from 'viem';
import { CONTRACTS } from '@/lib/contracts';
import type { TxStatus } from '@/types/contracts';
import { parseContractError, type WriteResult } from '@/lib/parseContractError';

interface UseEmergencyRefundReturn {
  requestEmergencyRefund: (projectId: bigint) => Promise<WriteResult>;
  txHash:                 `0x${string}` | undefined;
  status:                 TxStatus;
  isPending:              boolean;
  isConfirming:           boolean;
  isSuccess:              boolean;
  isError:                boolean;
  error:                  string | null;
  reset:                  () => void;
}

export function useEmergencyRefund(): UseEmergencyRefundReturn {
  const [localError,   setLocalError]   = useState<string | null>(null);
  const [localIsError, setLocalIsError] = useState(false);

  const {
    writeContractAsync,
    data: txHash,
    isPending,
    isError:   isWriteError,
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

  const requestEmergencyRefund = useCallback(
    async (projectId: bigint): Promise<WriteResult> => {
      reset();
      try {
        await writeContractAsync({
          address:      CONTRACTS.Exhibition.address,
          abi:          CONTRACTS.Exhibition.abi,
          functionName: 'requestEmergencyRefund',
          args:         [projectId],
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
    requestEmergencyRefund,
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