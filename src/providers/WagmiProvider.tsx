'use client';

import { WagmiProvider as WagmiProviderBase } from 'wagmi';
import { wagmiClientConfig } from '@/lib/wagmiClient';
import { type State } from 'wagmi';

interface Props {
  children: React.ReactNode;
  initialState?: State;
}

export function WagmiProvider({ children, initialState }: Props) {
  return (
    <WagmiProviderBase config={wagmiClientConfig} initialState={initialState}>
      {children}
    </WagmiProviderBase>
  );
}