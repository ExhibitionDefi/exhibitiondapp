import { z } from 'zod';
import { MIN_START_DELAY_BLOCKS, BLOCKS_PER_HOUR, MIN_LOCK_DURATION_DAYS } from '@/lib/constants';;
import { daysToBlocks } from '@/lib/formatters';

// ── Helpers ───────────────────────────────────────────────
const positiveDecimalString = (field: string) =>
  z.string()
    .min(1, `${field} is required`)
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, {
      message: `${field} must be a positive number`,
    });

const nonNegativeDecimalString = (field: string) =>
  z.string()
    .min(1, `${field} is required`)
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
      message: `${field} must be 0 or greater`,
    });

// ── Step 1 — Token Details ────────────────────────────────
export const step1Schema = z.object({
  tokenName:   z.string().min(1, 'Token name is required').max(50, 'Max 50 characters'),
  tokenSymbol: z.string()
    .min(1, 'Token symbol is required')
    .max(10, 'Max 10 characters')
    .regex(/^[A-Z0-9]+$/, 'Symbol must be uppercase letters and numbers only'),
  totalSupply: positiveDecimalString('Total supply'),
  logoURI:     z.string().url('Must be a valid URL'),
});

// ── Step 2 — Funding Config ───────────────────────────────
export const step2Schema = z.object({
  fundingGoal:       positiveDecimalString('Funding goal'),
  softCap:           positiveDecimalString('Soft cap'),
  minContribution:   positiveDecimalString('Minimum contribution'),
  maxContribution:   positiveDecimalString('Maximum contribution'),
  contributionToken: z.string()
    .refine(val => /^0x[a-fA-F0-9]{40}$/.test(val), {
      message: 'Invalid contribution token address',
    }),
}).superRefine((data, ctx) => {
  const goal = Number(data.fundingGoal);
  const soft = Number(data.softCap);
  const minC = Number(data.minContribution);
  const maxC = Number(data.maxContribution);

  if (soft > goal) {
    ctx.addIssue({
      code:    z.ZodIssueCode.custom,
      path:    ['softCap'],
      message: 'Soft cap cannot exceed funding goal',
    });
  }
  if (minC > maxC) {
    ctx.addIssue({
      code:    z.ZodIssueCode.custom,
      path:    ['minContribution'],
      message: 'Min contribution cannot exceed max contribution',
    });
  }
  if (maxC > goal) {
    ctx.addIssue({
      code:    z.ZodIssueCode.custom,
      path:    ['maxContribution'],
      message: 'Max contribution cannot exceed funding goal',
    });
  }
});

// ── Step 3 — Price & Sale ─────────────────────────────────
export const step3Schema = z.object({
  tokenPrice:          positiveDecimalString('Token price'),
  amountTokensForSale: positiveDecimalString('Tokens for sale'),
});

// ── Step 4 — Timeline ─────────────────────────────────────
// MIN_START_DELAY is in blocks — convert to days for validation
export const TX_BUFFER_BLOCKS = BigInt(BLOCKS_PER_HOUR / 12);

export const step4Schema = z.object({
  startDays:     z.number().int('Must be a whole number').min(0, 'Cannot be negative'),
  startHours:    z.number().int('Must be a whole number').min(0).max(23),
  startMins:     z.number().int('Must be a whole number').min(0).max(59),
  durationDays:  z.number().int('Must be a whole number').min(0).max(365),
  durationHours: z.number().int('Must be a whole number').min(0).max(23),
}).superRefine((data, ctx) => {
  const totalStartBlocks =
    daysToBlocks(data.startDays) +
    BigInt(data.startHours * BLOCKS_PER_HOUR) +
    BigInt(Math.floor(data.startMins * Number(BLOCKS_PER_HOUR) / 60));

  const totalDurationBlocks =
    daysToBlocks(data.durationDays) +
    BigInt(data.durationHours * BLOCKS_PER_HOUR);

  const MIN_START_WITH_BUFFER = MIN_START_DELAY_BLOCKS + TX_BUFFER_BLOCKS;

  if (totalStartBlocks < MIN_START_WITH_BUFFER) {
    ctx.addIssue({
      code:    z.ZodIssueCode.custom,
      path:    ['startMins'],
      message: `Start delay too low — add at least ${Number(TX_BUFFER_BLOCKS / BigInt(BLOCKS_PER_HOUR / 60))} min buffer`,
    });
  }

  if (totalDurationBlocks === 0n) {
    ctx.addIssue({
      code:    z.ZodIssueCode.custom,
      path:    ['durationDays'],
      message: 'Duration must be at least  2 hour',
    });
  }
});

// ── Step 5 — Liquidity ────────────────────────────────────
const MIN_LOCK_DAYS = MIN_LOCK_DURATION_DAYS;

export const step5Schema = z.object({
  liquidityPercentage: z.number()
    .min(70,   'Liquidity percentage must be at least 70%')
    .max(100, 'Liquidity percentage cannot exceed 100%'),
  lockDurationDays: z.number()
    .int('Must be a whole number')
    .min(MIN_LOCK_DAYS, `Lock duration must be at least ${MIN_LOCK_DAYS} day`),
});

// ── Step 6 — Vesting ─────────────────────────────────────
export const step6Schema = z.object({
  vestingEnabled:        z.boolean(),
  cliffDays:             z.number().min(0, 'Cliff cannot be negative'),
  durationDays:          z.number().min(0, 'Duration cannot be negative'),
  intervalDays:          z.number().min(0, 'Interval cannot be negative'),
  initialReleasePercent: z.number().min(0).max(100),
}).superRefine((data, ctx) => {
  if (!data.vestingEnabled) return; // skip validation if vesting is off

  if (data.durationDays < 1) {
    ctx.addIssue({
      code:    z.ZodIssueCode.custom,
      path:    ['durationDays'],
      message: 'Vesting duration must be at least 1 day when vesting is enabled',
    });
  }

  if (data.intervalDays < 1) {
    ctx.addIssue({
      code:    z.ZodIssueCode.custom,
      path:    ['intervalDays'],
      message: 'Vesting interval must be at least 1 day when vesting is enabled',
    });
  }

  if (data.cliffDays > data.durationDays) {
    ctx.addIssue({
      code:    z.ZodIssueCode.custom,
      path:    ['cliffDays'],
      message: 'Cliff cannot exceed vesting duration',
    });
  }

  if (data.intervalDays > data.durationDays) {
    ctx.addIssue({
      code:    z.ZodIssueCode.custom,
      path:    ['intervalDays'],
      message: 'Interval cannot exceed vesting duration',
    });
  }

  if (data.initialReleasePercent >= 100) {
    ctx.addIssue({
      code:    z.ZodIssueCode.custom,
      path:    ['initialReleasePercent'],
      message: 'Initial release cannot be 100% — disable vesting instead',
    });
  }
});

// ── Full wizard schema ────────────────────────────────────
export const wizardSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
  step5: step5Schema,
  step6: step6Schema,
});

// ── Per-step type exports ─────────────────────────────────
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type Step6Data = z.infer<typeof step6Schema>;
export type WizardData = z.infer<typeof wizardSchema>;