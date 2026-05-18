import { BLOCK_TIME_MS, BLOCKS_PER_DAY,} from '@/lib/constants';

/**
 * Estimates a future date from a target block number.
 */
export function formatBlockToDate(
  targetBlock: bigint,
  currentBlock: bigint
): string {
  if (targetBlock <= currentBlock) return 'Ended';

  const blocksRemaining = targetBlock - currentBlock;
  const msRemaining = Number(blocksRemaining) * BLOCK_TIME_MS;
  const date = new Date(Date.now() + msRemaining);

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  });
}

/**
 * Returns blocks remaining as a compound human-readable string.
 * e.g. 172800n → "~2d 4h 30m"
 */
export function formatBlocksRemaining(blocks: bigint): string {
  if (blocks <= 0n) return 'Now';

  const totalSeconds = Math.floor((Number(blocks) * BLOCK_TIME_MS) / 1000);

  if (totalSeconds < 60) {
    return `~${totalSeconds}s`;
  }

  if (totalSeconds < 3_600) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `~${m}m ${s}s`;
  }

  if (totalSeconds < 86_400) {
    const h = Math.floor(totalSeconds / 3_600);
    const m = Math.floor((totalSeconds % 3_600) / 60);
    const s = totalSeconds % 60;
    return `~${h}h ${m}m ${s}s`;
  }

  const totalDays = Math.floor(totalSeconds / 86_400);

  // ≥ 30 days → months + days (+ optional hours)
  if (totalDays >= 30) {
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;
    const hours = Math.floor((totalSeconds % 86_400) / 3_600);

    const parts = [`${months}mo`];

    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 && months < 3) parts.push(`${hours}h`); // hide hours for large spans

    return `~${parts.join(' ')}`;
  }

  // < 30 days → days + hours (+ optional minutes)
  const d = totalDays;
  const h = Math.floor((totalSeconds % 86_400) / 3_600);
  const m = Math.floor((totalSeconds % 3_600) / 60);

  const parts = [`${d}d`];

  if (h > 0) parts.push(`${h}h`);
  if (m > 0 && d < 7) parts.push(`${m}m`);

  return `~${parts.join(' ')}`;
}

/**
 * Converts blocks to real-world days.
 */
export function blocksToRealDays(blocks: bigint): number {
  return Number(blocks) / BLOCKS_PER_DAY;
}

/**
 * Converts real-world days to blocks.
 */
export function daysToBlocks(days: number): bigint {
  return BigInt(Math.floor(days * BLOCKS_PER_DAY));
}

/**
 * Converts a date to estimated block number.
 */
export function dateToBlock(date: Date, currentBlock: bigint): bigint {
  const msFromNow = date.getTime() - Date.now();
  if (msFromNow <= 0) return currentBlock;
  const blocksFromNow = Math.floor(msFromNow / BLOCK_TIME_MS);
  return currentBlock + BigInt(blocksFromNow);
}