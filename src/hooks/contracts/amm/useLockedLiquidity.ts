'use client';

import { useCallback, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import type { Address } from 'viem';
import { BaseError } from 'viem';
import { CONTRACTS } from '@/lib/contracts';
import type { TxStatus } from '@/types/contracts';
import { parseContractError, type WriteResult } from '@/lib/parseContractError';

interface LockLiquidityParams {
  tokenA:             Address;
  tokenB:             Address;
  lpAmount:           bigint;
  lockDurationBlocks: bigint;
}

interface UseLockLiquidityReturn {
  lockLiquidity: (params: LockLiquidityParams) => Promise<WriteResult>;
  txHash:        `0x${string}` | undefined;
  status:        TxStatus;
  isPending:     boolean;
  isConfirming:  boolean;
  isSuccess:     boolean;
  isError:       boolean;
  error:         string | null;
  reset:         () => void;
}

export function useLockLiquidity(): UseLockLiquidityReturn {
  const [localError,   setLocalError]   = useState<string | null>(null);
  const [localIsError, setLocalIsError] = useState(false);

  const { address } = useAccount();

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

  const lockLiquidity = useCallback(
    async ({ tokenA, tokenB, lpAmount, lockDurationBlocks }: LockLiquidityParams): Promise<WriteResult> => {
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
          functionName: 'lockLiquidity',
          args:         [tokenA, tokenB, lpAmount, lockDurationBlocks],
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
    lockLiquidity,
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