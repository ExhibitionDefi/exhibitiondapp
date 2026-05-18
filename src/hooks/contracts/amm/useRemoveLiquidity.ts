'use client';

import { useCallback, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import type { Address } from 'viem';
import { BaseError } from 'viem';
import { CONTRACTS } from '@/lib/contracts';
import type { TxStatus } from '@/types/contracts';
import { parseContractError, type WriteResult } from '@/lib/parseContractError';

interface RemoveLiquidityParams {
  tokenA:     Address;
  tokenB:     Address;
  lpAmount:   bigint;
  amountAMin: bigint;
  amountBMin: bigint;
  deadline:   bigint;
}

interface UseRemoveLiquidityReturn {
  removeLiquidity: (params: RemoveLiquidityParams) => Promise<WriteResult>;
  txHash:          `0x${string}` | undefined;
  status:          TxStatus;
  isPending:       boolean;
  isConfirming:    boolean;
  isSuccess:       boolean;
  isError:         boolean;
  error:           string | null;
  reset:           () => void;
}

export function useRemoveLiquidity(): UseRemoveLiquidityReturn {
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

  const removeLiquidity = useCallback(
    async ({
      tokenA,
      tokenB,
      lpAmount,
      amountAMin,
      amountBMin,
      deadline,
    }: RemoveLiquidityParams): Promise<WriteResult> => {
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
          functionName: 'removeLiquidity',
          args: [
            tokenA,
            tokenB,
            lpAmount,
            amountAMin,
            amountBMin,
            address,
            deadline,
          ],
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
    removeLiquidity,
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