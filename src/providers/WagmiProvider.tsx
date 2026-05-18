'use client'

import { WagmiProvider as WagmiProviderBase, type State } from 'wagmi';
import { wagmiConfig } from '@/lib/wagmi';

interface Props {
  children:      React.ReactNode;
  initialState?: State;                                   
}

export function WagmiProvider({ children, initialState }: Props) {
  return (
    <WagmiProviderBase config={wagmiConfig} initialState={initialState}>
      {children}
    </WagmiProviderBase>
  );
}