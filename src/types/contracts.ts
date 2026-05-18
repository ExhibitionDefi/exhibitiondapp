// ============================================================
// Generic contract interaction types
// ============================================================

export interface ContractWriteResult {
  hash:      `0x${string}`;
  isPending:  boolean;
  isSuccess:  boolean;
  isError:    boolean;
  error:      Error | null;
}

export interface ContractReadResult<T> {
  data:      T | undefined;
  isLoading: boolean;
  isError:   boolean;
  error:     Error | null;
}

// ============================================================
// Token metadata
// ============================================================

export interface TokenMetadata {
  address:  `0x${string}`;
  name:     string;
  symbol:   string;
  decimals: number;
  logoURI?: string;
}

// ============================================================
// Transaction state
// ============================================================

export type TxStatus =
  | 'idle'
  | 'pending'
  | 'confirming'
  | 'success'
  | 'error';

export interface TxState {
  status:  TxStatus;
  hash:    `0x${string}` | null;
  error:   Error | null;
}