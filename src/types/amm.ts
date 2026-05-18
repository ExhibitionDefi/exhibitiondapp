// ============================================================
// Raw contract return types
// ============================================================

export interface RawPoolInfo {
  token0:    `0x${string}`;
  token1:    `0x${string}`;
  reserve0:  bigint;
  reserve1:  bigint;
  totalSupply: bigint;
}

export interface RawLiquidityLock {
  projectId:      bigint;
  projectOwner:   `0x${string}`;
  unlockBlock:    bigint;
  lockedLPAmount: bigint;
  isActive:       boolean;
}

export interface RawLPSnapshot {
  blockNumber: bigint;
  lpBalance:   bigint;
  reserve0:    bigint;
  reserve1:    bigint;
}

export interface RawTWAPData {
  price0Cumulative: bigint;
  price1Cumulative: bigint;
  blockNumberLast:  bigint;
}

export interface RawEarningsReport {
  unrealizedEarningsA: bigint;
  unrealizedEarningsB: bigint;
  realizedEarningsA:   bigint;
  realizedEarningsB:   bigint;
  totalEarningsA:      bigint;
  totalEarningsB:      bigint;
  currentValue:        bigint;
  originalDeposit:     bigint;
  apy:                 bigint;
  daysActive:          bigint;
}

// ============================================================
// Derived/UI types
// ============================================================

export interface PoolPair {
  tokenA: `0x${string}`;
  tokenB: `0x${string}`;
}

export interface PoolStats {
  token0:          `0x${string}`;
  token1:          `0x${string}`;
  reserve0:        bigint;
  reserve1:        bigint;
  totalSupply:     bigint;
  // derived
  price0:          string;
  price1:          string;
  apy:             string;
}

export interface LiquidityLock {
  owner:            `0x${string}`;
  token0:           `0x${string}`;
  token1:           `0x${string}`;
  amount:           bigint;
  unlockBlock:      bigint;
  // derived
  blocksUntilUnlock: bigint;
  unlockDateDisplay: string;
  isUnlocked:        boolean;
}

export interface SwapQuote {
  amountIn:    bigint;
  amountOut:   bigint;
  priceImpact: string;
  priceImpactNum: number;
  fee:         string;
  route:       string[];
  tradingFeeBps: bigint;
}

export interface LPEarnings {
  lpBalance:    bigint;
  earnedToken0: bigint;
  earnedToken1: bigint;
  apy:          string;
  daysActive:   number;
}

export interface UserPortfolioPosition {
  tokenA:          `0x${string}`;
  tokenB:          `0x${string}`;
  lpBalance:       bigint;
  sharePercentage: bigint;
}

export interface UserPortfolio {
  positions:       UserPortfolioPosition[];
  totalPositions:  bigint;
  hasMore:         boolean;
  positionCount:   bigint;
  activePoolCount: bigint;
}