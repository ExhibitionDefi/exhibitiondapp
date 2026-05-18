const ALLOWED_PROTOCOLS = ['https:', 'http:'];

/**
 * Allowed image hosting domains.
 * Extend this list as needed.
 */
const ALLOWED_IMAGE_DOMAINS = [
  'ipfs.io',
  'cloudflare-ipfs.com',
  'gateway.pinata.cloud',
  'arweave.net',
  'raw.githubusercontent.com',
  'imgur.com',
  'i.imgur.com',
  'pbs.twimg.com',
];

/**
 * Sanitizes image URLs.
 * Validates protocol and optionally restricts to allowed domains.
 * Returns sanitized URL or null if invalid.
 */
export function sanitizeImageURL(
  url: string,
  restrictToDomains: boolean = false
): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // Allow relative paths (next/image local assets)
  if (trimmed.startsWith('/')) return trimmed;

  try {
    const parsed = new URL(trimmed);

    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) return null;

    if (restrictToDomains) {
      const hostname = parsed.hostname.replace(/^www\./, '');
      const isAllowed = ALLOWED_IMAGE_DOMAINS.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      );
      if (!isAllowed) return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}