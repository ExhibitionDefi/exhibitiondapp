/**
 * Sanitizes token amount inputs.
 * Removes non-numeric characters except decimals.
 * Returns cleaned string or null if invalid.
 */
export function sanitizeAmount(amount: string, decimals: number = 18): string | null {
  const cleaned = amount.trim().replace(/[^0-9.]/g, '');

  if (!cleaned || cleaned === '.') return null;
  if ((cleaned.match(/\./g) || []).length > 1) return null;
  if (parseFloat(cleaned) < 0) return null;

  const parts = cleaned.split('.');
  if (parts[1] && parts[1].length > decimals) return null;

  return cleaned;
}