import { defineChain } from 'viem';

// ============================================================
// Nexus Testnet Chain Definition
// ============================================================
export const nexusTestnet = defineChain({
  id: Number(process.env.NEXT_PUBLIC_NEXUS_CHAIN_ID),
  name: process.env.NEXT_PUBLIC_NEXUS_CHAIN_NAME ?? 'Nexus Testnet',
  nativeCurrency: {
    name: 'Nexus',
    symbol: 'NEX',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_NEXUS_TESTNET_RPC_URL!] },
    public:  { http: [process.env.NEXT_PUBLIC_NEXUS_TESTNET_RPC_URL!] },
  },
  blockExplorers: {
    default: {
      name: 'Nexus Explorer',
      url: process.env.NEXT_PUBLIC_NEXUS_TESTNET_EXPLORER_URL ?? '',
    },
  },
  testnet: true,
});