import { ProjectStatusKey } from '@/lib/constants';

// ============================================================
// Raw getProjectDetails return type
// ============================================================
export type RawProjectDetails = [
  project: {
    projectOwner:             `0x${string}`;
    projectToken:             `0x${string}`;
    contributionTokenAddress: `0x${string}`;
    fundingGoal:              bigint;
    softCap:                  bigint;
    minContribution:          bigint;
    maxContribution:          bigint;
    tokenPrice:               bigint;
    startBlock:               bigint;
    endBlock:                 bigint;
    totalRaised:              bigint;
    totalProjectTokenSupply:  bigint;
    projectTokenLogoURI:      string;
    amountTokensForSale:      bigint;
    liquidityPercentage:      bigint;
    lockDurationBlocks:       bigint;
    status:                   number;
    liquidityAdded:           boolean;
    vestingEnabled:           boolean;
    vestingCliffBlocks:       bigint;
    vestingDurationBlocks:    bigint;
    vestingIntervalBlocks:    bigint;
    vestingInitialRelease:    bigint;
  },
  progressPercentage:       bigint,
  blocksRemaining:          bigint,
  canContribute:            boolean,
  requiredLiquidityTokens:  bigint,
  depositedLiquidityTokens: bigint,
  totalContributors:        bigint,
];


export type RawUserProjectSummary = [
  bigint,  // contributionAmount
  bigint,  // tokensOwed
  bigint,  // tokensVested
  bigint,  // tokensClaimed
  bigint,  // tokensAvailable
  boolean, // userHasRefunded
  boolean, // canClaim
];

// ============================================================
// Derived/UI types (human readable, used in components)
// ============================================================

export interface ProjectStatus {
  code:        ProjectStatusKey;
  label:       string;
  color:       string;
  description: string;
}

export interface VestingInfo {
  enabled:          boolean;
  cliffBlocks:      bigint;
  durationBlocks:   bigint;
  intervalBlocks:   bigint;
  initialRelease:   bigint;
  // derived
  cliffDays:        number;
  durationDays:     number;
  intervalDays:     number;
  initialReleasePercent: number;
}

export interface ContributionInfo {
  contributionAmount: bigint;
  tokensOwed:         bigint;
  tokensVested:       bigint;
  tokensClaimed:      bigint;
  tokensAvailable:    bigint;
  userHasRefunded:    boolean;
  canClaim:           boolean;
}

export interface Project {
  // identity
  projectId:          bigint;
  owner:              `0x${string}`;
  projectToken:       `0x${string}`;
  totalSupply:        bigint;
  contributionToken:  `0x${string}`;
  // token metadata (fetched separately)
  tokenName:          string;
  tokenSymbol:        string;
  tokenDecimals:      number;
  tokenLogoURI:       string;
  // funding config
  fundingGoal:        bigint;
  softCap:            bigint;
  minContribution:    bigint;
  maxContribution:    bigint;
  tokenPrice:         bigint;
  amountTokensForSale: bigint;
  liquidityPercentage: bigint;
  lockDurationBlocks:  bigint;
  // timeline
  startBlock:         bigint;
  endBlock:           bigint;
  // state
  totalRaised:        bigint;
  contributorCount:   bigint;
  status:             ProjectStatus;
  liquidityAdded:     boolean;
  successBlock:       bigint;
  // vesting
  vesting:            VestingInfo;
  // derived display values
  progressPercent:    number;
  blocksRemaining:    bigint;
  fundingGoalDisplay: string;
  totalRaisedDisplay: string;
  softCapDisplay:     string;
  requiredLiquidityTokens:  bigint;
  depositedLiquidityTokens: bigint;
  contributionTokenDecimals: number;
  contributionTokenSymbol:  string;
  tokensSold:            bigint;
  unsoldTokensWithdrawn: bigint;
}

// ============================================================
// Wizard form types
// ============================================================

export interface WizardStep1 {
  tokenName:    string;
  tokenSymbol:  string;
  totalSupply:  string;
  logoURI:      string;
}

export interface WizardStep2 {
  fundingGoal:        string;
  softCap:            string;
  minContribution:    string;
  maxContribution:    string;
  contributionToken:  `0x${string}`;
}

export interface WizardStep3 {
  tokenPrice:        string;
  amountTokensForSale: string;
}

export interface WizardStep4 {
  startDays:    number;
  startHours:   number; // 0-23
  startMins:    number; // 0-59
  durationDays: number; // 0-7
  durationHours: number; // 0-23
}

export interface WizardStep5 {
  liquidityPercentage: number; // 0-100 → converted to basis points on submit
  lockDurationDays:    number; // days → converted to blocks on submit
}

export interface WizardStep6 {
  vestingEnabled:        boolean;
  cliffDays:             number;
  durationDays:          number;
  intervalDays:          number;
  initialReleasePercent: number;
}

export interface WizardFormData {
  step1: WizardStep1;
  step2: WizardStep2;
  step3: WizardStep3;
  step4: WizardStep4;
  step5: WizardStep5;
  step6: WizardStep6;
}