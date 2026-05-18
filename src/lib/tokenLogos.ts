// lib/tokenLogos.ts
export function getTokenLogo(address: string): string {
  const logos: Record<string, string> = {
    [process.env.NEXT_PUBLIC_NEXUS_USD_ADDRESS?.toLowerCase() ?? '']: '/logos/usdx.avif',
    [process.env.NEXT_PUBLIC_EXHIBITION_NEX_ADDRESS?.toLowerCase() ?? '']: '/logos/exnex.svg',
    [process.env.NEXT_PUBLIC_EXH_ADDRESS?.toLowerCase()            ?? '']: '/logos/exe.svg',
  };
  return logos[address.toLowerCase()] ?? '/logos/unknown.png';
}
export const TOKEN_LOGOS = {} as Record<string, string>;