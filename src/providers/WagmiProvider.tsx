'use client';

import { WagmiProvider as WagmiProviderBase } from 'wagmi';
import { wagmiConfig } from '@/lib/wagmi';


interface Props {
  children: React.ReactNode;
}

export function WagmiProvider({ children }: Props) {
  return (
    <WagmiProviderBase config={wagmiConfig}>
      {children}
    </WagmiProviderBase>
  );
}