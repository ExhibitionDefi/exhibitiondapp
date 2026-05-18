import { isAddress, getAddress } from 'viem';

/**
 * Sanitizes and validates EVM addresses.
 * Returns checksummed address or null if invalid.
 */
export function sanitizeAddress(address: string): string | null {
  const trimmed = address.trim();
  if (!isAddress(trimmed)) return null;
  return getAddress(trimmed);
}