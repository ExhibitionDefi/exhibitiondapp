'use client';

import { WagmiProvider }                        from './WagmiProvider';
import { QueryProvider }                        from './QueryProvider';
import { RainbowKitProvider, darkTheme }        from '@rainbow-me/rainbowkit';
import { AuthProvider }                         from './AuthProvider';
import { nexusTestnet }                         from '@/lib/wagmi';

const theme = darkTheme({
  accentColor:           '#15c6e6',
  accentColorForeground: '#0A0A0A',
  borderRadius:          'medium',
  fontStack:             'system',
  overlayBlur:           'small',
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <QueryProvider>
        <RainbowKitProvider initialChain={nexusTestnet} theme={theme}>
          <AuthProvider />
          {children}
        </RainbowKitProvider>
      </QueryProvider>
    </WagmiProvider>
  );
}