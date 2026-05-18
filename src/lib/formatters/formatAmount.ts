import { formatUnits } from 'viem';

/**
 * Formats a token amount from raw bigint to readable string.
 * e.g. 1000000000000000000n → "1.00"
 */
export function formatAmount(
  amount: bigint,
  decimals: number = 18,
  displayDecimals: number = 2
): string {
  if (amount === 0n) return '0';

  const formatted = formatUnits(amount, decimals);
  const number = parseFloat(formatted);

  if (number === 0) return '0';
  if (number < 0.0001) return '< 0.0001';

  if (number >= 1_000_000_000) return `${(number / 1_000_000_000).toFixed(displayDecimals)}B`;
  if (number >= 1_000_000)     return `${(number / 1_000_000).toFixed(displayDecimals)}M`;
  if (number >= 1_000)         return `${(number / 1_000).toFixed(displayDecimals)}K`;

  return number.toFixed(displayDecimals);
}

/**
 * Formats exUSD amounts (6 decimals) with $ prefix.
 * e.g. 250000000000n → "$250,000.00"
 */
export function formatUSD(amount: bigint, displayDecimals: number = 2): string {
  if (amount === 0n) return '$0.00';

  const formatted = formatUnits(amount, 6);
  const number = parseFloat(formatted);

  if (number >= 1_000_000_000) return `$${(number / 1_000_000_000).toFixed(displayDecimals)}B`;
  if (number >= 1_000_000)     return `$${(number / 1_000_000).toFixed(displayDecimals)}M`;
  if (number >= 1_000)         return `$${(number / 1_000).toFixed(displayDecimals)}K`;

  return `$${number.toFixed(displayDecimals)}`;
}

/**
 * Formats a liquidity percentage from basis points.
 * e.g. 7600n → "76.00%"
 */
export function formatPercentage(basisPoints: bigint, displayDecimals: number = 2): string {
  const percentage = Number(basisPoints) / 100;
  return `${percentage.toFixed(displayDecimals)}%`;
}