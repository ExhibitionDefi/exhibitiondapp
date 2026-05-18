// ============================================================
// Nexus Testnet Block Constants
// ============================================================
export const BLOCK_TIME_MS = 1000;
export const BLOCKS_PER_SECOND = 1;
export const BLOCKS_PER_MINUTE = 60;
export const BLOCKS_PER_HOUR = 3_600;
export const BLOCKS_PER_DAY = 86_400;
export const BLOCKS_PER_WEEK = 604_800;
export const BLOCKS_PER_MONTH = 2_592_000;
export const BLOCKS_PER_YEAR = 31_536_000;

// ============================================================
// Contract Constants (mirrors Solidity)
// ============================================================
export const MIN_START_DELAY_BLOCKS = 3_600n;
export const MAX_END_DURATION_BLOCKS = 691_200n;
export const MIN_LOCK_DURATION_BLOCKS = 1_209_600n;
export const WITHDRAWAL_UNSOLD_DELAY_BLOCKS = 86_400n;
export const LIQUIDITY_FINALIZATION_DEADLINE_BLOCKS = 604_800n;

// ============================================================
// Project Status
// ============================================================
export const PROJECT_STATUS = {
  0: { label: 'Upcoming',   color: 'gray',   description: 'Awaiting token deposit'              },
  1: { label: 'Active',     color: 'blue',   description: 'Open for contributions'               },
  2: { label: 'Successful', color: 'green',  description: 'Soft cap reached, awaiting liquidity' },
  3: { label: 'Failed',     color: 'red',    description: 'Soft cap not reached'                 },
  4: { label: 'Claimable',  color: 'orange', description: 'Tokens available to claim'            },
  5: { label: 'Refundable', color: 'yellow', description: 'Contributions available to refund'    },
  6: { label: 'Completed',  color: 'purple', description: 'Project fully completed'              },
} as const;

export type ProjectStatusKey = keyof typeof PROJECT_STATUS;

// ============================================================
// Contribution Token Decimals
// ============================================================
export const TOKEN_DECIMALS = {
  USDX: 6,
  exNEX: 18,
  EXH:   18,
} as const;

// ============================================================
// Wizard Steps
// ============================================================
export const WIZARD_STEPS = [
  { step: 1, label: 'Token Details'   },
  { step: 2, label: 'Funding Config'  },
  { step: 3, label: 'Price & Sale'    },
  { step: 4, label: 'Timeline'        },
  { step: 5, label: 'Liquidity'       },
  { step: 6, label: 'Vesting'         },
  { step: 7, label: 'Review'          },
] as const;

export const TOTAL_WIZARD_STEPS = WIZARD_STEPS.length;

// ============================================================
// UI Constants
// ============================================================
export const MAX_TOKEN_NAME_LENGTH = 64;
export const MAX_TOKEN_SYMBOL_LENGTH = 10;
export const MIN_LIQUIDITY_PERCENTAGE = 7000n;  // 70%
export const MAX_LIQUIDITY_PERCENTAGE = 10000n; // 100%
export const MIN_LOCK_DURATION_DAYS = 14;

// ============================================================
// Token Addresses (from env)
// ============================================================
export const USDX_ADDRESS = process.env.NEXT_PUBLIC_NEXUS_USD_ADDRESS       as `0x${string}`;
export const EXNEX_ADDRESS = process.env.NEXT_PUBLIC_EXHIBITION_NEX_ADDRESS as `0x${string}`;
export const EXH_ADDRESS   = process.env.NEXT_PUBLIC_EXH_ADDRESS            as `0x${string}`;