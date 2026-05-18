import { useCallback, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import type { Address } from 'viem';
import { BaseError } from 'viem';
import { CONTRACTS } from '@/lib/contracts';
import type { TxStatus } from '@/types/contracts';
import { parseContractError, type WriteResult } from '@/lib/parseContractError';

interface AddLiquidityParams {
  tokenA:         Address;
  tokenB:         Address;
  amountADesired: bigint;
  amountBDesired: bigint;
  amountAMin:     bigint;
  amountBMin:     bigint;
  deadline:       bigint;
}

interface AddLiquidityResult {
  amountA:   bigint;
  amountB:   bigint;
  liquidity: bigint;
}

interface UseAddAMMLiquidityReturn {
  addLiquidity:  (params: AddLiquidityParams) => Promise<WriteResult>;
  result:        AddLiquidityResult | null;
  txHash:        `0x${string}` | undefined;
  status:        TxStatus;
  isPending:     boolean;
  isConfirming:  boolean;
  isSuccess:     boolean;
  isError:       boolean;
  error:         string | null;
  reset:         () => void;
}

export function useAddAMMLiquidity(): UseAddAMMLiquidityReturn {
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

  const addLiquidity = useCallback(
    async ({
      tokenA,
      tokenB,
      amountADesired,
      amountBDesired,
      amountAMin,
      amountBMin,
      deadline,
    }: AddLiquidityParams): Promise<WriteResult> => {
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
          functionName: 'addLiquidity',
          args: [
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
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
    addLiquidity,
    result:      null,
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