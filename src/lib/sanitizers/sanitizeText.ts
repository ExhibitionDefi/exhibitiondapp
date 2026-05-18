/**
 * Sanitizes plain text inputs.
 * Strips dangerous characters while preserving normal text.
 */
export function sanitizeText(text: string, maxLength: number = 64): string | null {
  if (!text || typeof text !== 'string') return null;

  const cleaned = text
    .trim()
    .replace(/[<>'"`;\\]/g, '')
    .replace(/\s+/g, ' ');

  if (!cleaned) return null;
  if (cleaned.length > maxLength) return null;

  return cleaned;
}