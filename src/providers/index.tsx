'use client';

import dynamic from 'next/dynamic';
import { WagmiProvider } from './WagmiProvider';
import { QueryProvider } from './QueryProvider';

const RainbowKitProvider = dynamic(
  () => import('./RainbowKitProvider').then(m => m.RainbowKitProvider),
  { ssr: false }
);

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider>
      <QueryProvider>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryProvider>
    </WagmiProvider>
  );
}