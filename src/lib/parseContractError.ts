import { BaseError, UserRejectedRequestError, ContractFunctionRevertedError } from 'viem';

export type WriteResult = 'success' | 'rejected' | 'error';

export interface ParsedContractError {
  result:  'rejected' | 'error';
  message: string;
}

export function parseContractError(err: unknown): ParsedContractError {
  if (err instanceof BaseError) {
    // User rejected in wallet
    const isRejected = err.walk(e => e instanceof UserRejectedRequestError);
    if (isRejected) return { result: 'rejected', message: 'Transaction rejected' };

    // Contract revert with reason
    const revert = err.walk(e => e instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError) {
      return { result: 'error', message: revert.reason ?? revert.shortMessage };
    }

    // Other viem error (RPC, network, etc.)
    return { result: 'error', message: err.shortMessage ?? err.message };
  }

  // Non-viem error
  return {
    result:  'error',
    message: err instanceof Error ? err.message : 'Unknown error',
  };
}