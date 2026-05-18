'use client';

import dynamic from 'next/dynamic';
import { WagmiProvider } from './WagmiProvider';
import { QueryProvider } from './QueryProvider';
import { type State } from 'wagmi';

const RainbowKitProvider = dynamic(
  () => import('./RainbowKitProvider').then(m => m.RainbowKitProvider),
  { ssr: false }
);

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