'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useBlockNumber } from 'wagmi';
import type { Address } from 'viem';
import { BLOCKS_PER_HOUR } from '@/lib/constants';
import { parseUnits, decodeEventLog, BaseError } from 'viem';
import { CONTRACTS } from '@/lib/contracts';
import { daysToBlocks } from '@/lib/formatters';
import type { TxStatus } from '@/types/contracts';
import type { WizardFormData } from '@/types/project';
import { parseContractError, type WriteResult } from '@/lib/parseContractError';

// ── Block-rate constants (single source of truth) ─────────────
const BLOCKS_PER_MIN = BigInt(Math.floor(Number(BLOCKS_PER_HOUR) / 60));

interface CreateLaunchResult {
  projectId:           bigint;
  projectTokenAddress: Address;
}

interface UseCreateLaunchReturn {
  createLaunch:  (form: WizardFormData) => Promise<WriteResult>;
  result:        CreateLaunchResult | null;
  txHash:        `0x${string}` | undefined;
  status:        TxStatus;
  isPending:     boolean;
  isConfirming:  boolean;
  isSuccess:     boolean;
  isError:       boolean;
  error:         string | null;
  reset:         () => void;
}

export function useCreateLaunch(
  contributionTokenDecimals: number = 6
): UseCreateLaunchReturn {
  const { data: currentBlock }         = useBlockNumber({ watch: false });
  const [result, setResult]            = useState<CreateLaunchResult | null>(null);
  const [localError,   setLocalError]  = useState<string | null>(null);
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
    data:      receipt,
  } = useWaitForTransactionReceipt({
    hash:  txHash,
    query: { enabled: !!txHash },
  });

  // ── Parse ProjectCreated event from receipt ───────────────
  useEffect(() => {
    if (!receipt || result) return;

    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi:       CONTRACTS.Exhibition.abi,
          eventName: 'ProjectCreated',
          data:      log.data,
          topics:    log.topics,
          strict:    false,
        });

        if (decoded.args) {
          const args         = decoded.args as Record<string, unknown>;
          const projectId    = args.projectId    as bigint  | undefined;
          const projectToken = args.projectToken as Address | undefined;

          if (projectId !== undefined && projectToken) {
            setResult({ projectId, projectTokenAddress: projectToken });
            break;
          }
        }
      } catch {
        // not the ProjectCreated log — continue
      }
    }
  }, [receipt]);

  const reset = useCallback(() => {
    wagmiReset();
    setResult(null);
    setLocalError(null);
    setLocalIsError(false);
  }, [wagmiReset]);

  const createLaunch = useCallback(
    async (form: WizardFormData): Promise<WriteResult> => {
      if (!currentBlock) {
        setLocalError('Could not read current block');
        setLocalIsError(true);
        return 'error';
      }

      reset();

      const { step1, step2, step3, step4, step5, step6 } = form;

      const startBlock = currentBlock
        + daysToBlocks(step4.startDays)
        + BigInt(step4.startHours) * BigInt(BLOCKS_PER_HOUR)
        + BigInt(step4.startMins)  * BLOCKS_PER_MIN;

      const endBlock = startBlock
        + daysToBlocks(step4.durationDays)
        + BigInt(step4.durationHours) * BigInt(BLOCKS_PER_HOUR);

      const lockDurationBlocks    = daysToBlocks(step5.lockDurationDays);
      const vestingCliffBlocks    = daysToBlocks(step6.cliffDays);
      const vestingDurationBlocks = daysToBlocks(step6.durationDays);
      const vestingIntervalBlocks = daysToBlocks(step6.intervalDays);

      const liquidityPercentage   = BigInt(Math.round(step5.liquidityPercentage   * 100));
      const vestingInitialRelease = BigInt(Math.round(step6.initialReleasePercent * 100));

      const fundingGoal         = parseUnits(step2.fundingGoal,         contributionTokenDecimals);
      const softCap             = parseUnits(step2.softCap,             contributionTokenDecimals);
      const minContribution     = parseUnits(step2.minContribution,     contributionTokenDecimals);
      const maxContribution     = parseUnits(step2.maxContribution,     contributionTokenDecimals);
      const tokenPrice          = parseUnits(step3.tokenPrice,          18);
      const amountTokensForSale = parseUnits(step3.amountTokensForSale, 18);
      const initialTotalSupply  = parseUnits(step1.totalSupply,         18);

      try {
        await writeContractAsync({
          address:      CONTRACTS.Exhibition.address,
          abi:          CONTRACTS.Exhibition.abi,
          functionName: 'createLaunchpadProject',
          args: [
            step1.tokenName,
            step1.tokenSymbol,
            initialTotalSupply,
            step1.logoURI ?? '',
            step2.contributionToken as Address,
            fundingGoal,
            softCap,
            minContribution,
            maxContribution,
            tokenPrice,
            startBlock,
            endBlock,
            amountTokensForSale,
            liquidityPercentage,
            lockDurationBlocks,
            step6.vestingEnabled,
            vestingCliffBlocks,
            vestingDurationBlocks,
            vestingIntervalBlocks,
            vestingInitialRelease,
          ],
        });
        return 'success';
      } catch (err) {
        const { result: parsedResult, message } = parseContractError(err);
        setLocalError(message);
        if (parsedResult === 'error') setLocalIsError(true);
        return parsedResult;
      }
    },
    [writeContractAsync, currentBlock, contributionTokenDecimals, reset]
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
    createLaunch,
    result,
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