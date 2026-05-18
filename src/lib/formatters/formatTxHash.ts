const EXPLORER = process.env.NEXT_PUBLIC_NEXUS_TESTNET_EXPLORER_URL ?? '';

/**
 * Shortens a transaction hash to a readable format.
 * e.g. 0x1234567890abcdef... → 0x1234...cdef
 */
export function formatTxHash(
  hash: `0x${string}`,
  prefixLength: number = 6,
  suffixLength: number = 4
): string {
  if (!hash) return '';
  if (hash.length <= prefixLength + suffixLength) return hash;
  return `${hash.slice(0, prefixLength)}...${hash.slice(-suffixLength)}`;
}

/**
 * Returns explorer URL for a transaction hash.
 */
export function getTxExplorerUrl(hash: `0x${string}`): string {
  return `${EXPLORER}/tx/${hash}`;
}

/**
 * Returns explorer URL for an address.
 */
export function getAddressExplorerUrl(address: string): string {
  return `${EXPLORER}/address/${address}`;
}