'use client';

import { WagmiProvider } from './WagmiProvider';
import { QueryProvider } from './QueryProvider';
import { type State } from 'wagmi';
import { RainbowKitProvider } from './RainbowKitProvider';

interface ProvidersProps {
  children: React.ReactNode;
  initialState?: State;
}

export function Providers({ children, initialState }: ProvidersProps) {
  return (
    <WagmiProvider initialState={initialState}>
      <QueryProvider>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryProvider>
    </WagmiProvider>
  );
}