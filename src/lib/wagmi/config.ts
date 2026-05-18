'use client';

import { createConfig, http, cookieStorage, createStorage } from 'wagmi';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet, rainbowWallet, okxWallet,
  walletConnectWallet, trustWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { EventEmitter } from 'events';
import { nexusTestnet } from './chain';

EventEmitter.defaultMaxListeners = 20;

const connectors = connectorsForWallets(
  [
    { groupName: 'Recommended', wallets: [okxWallet, rainbowWallet, metaMaskWallet] },
    { groupName: 'More',        wallets: [trustWallet, walletConnectWallet] },
  ],
  {
    appName:   'Exhibition',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
  }
);

export const wagmiConfig = createConfig({
  chains: [nexusTestnet],
  connectors,
  transports: {
    [nexusTestnet.id]: http('/api/rpc'),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});