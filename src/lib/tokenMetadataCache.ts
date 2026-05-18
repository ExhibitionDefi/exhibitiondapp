// lib/tokenMetadataCache.ts
// Module-level cache — persists across renders, never resets on refetch

interface TokenMetadata {
  name:     string;
  symbol:   string;
  decimals: number;
}

const cache = new Map<string, TokenMetadata>();

export const tokenMetadataCache = {
  get(address: string): TokenMetadata | undefined {
    return cache.get(address.toLowerCase());
  },

  set(address: string, metadata: TokenMetadata): void {
    cache.set(address.toLowerCase(), metadata);
  },

  has(address: string): boolean {
    return cache.has(address.toLowerCase());
  },
};