import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  rainbowWallet,
  okxWallet,
  walletConnectWallet,
  trustWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { EventEmitter } from 'events';

EventEmitter.defaultMaxListeners = 20;

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
    default: { http: ['/api/rpc'] },
    public:  { http: ['/api/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Nexus Explorer',
      url: process.env.NEXT_PUBLIC_NEXUS_TESTNET_EXPLORER_URL ?? '',
    },
  },
  testnet: true,
});

// ============================================================
// Wallet Connectors
// ============================================================
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [okxWallet, rainbowWallet, metaMaskWallet],
    },
    {
      groupName: 'More',
      wallets: [trustWallet, walletConnectWallet],
    },
  ],
  {
    appName: 'Exhibition',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
  }
);

// ============================================================
// Wagmi Config
// ============================================================
export const wagmiConfig = createConfig({
  chains: [nexusTestnet],
  connectors,
  transports: {
    [nexusTestnet.id]: http('/api/rpc'),
  },
  ssr: true,
});