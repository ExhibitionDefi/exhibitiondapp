'use client';

import {
  RainbowKitProvider as RainbowKitProviderBase,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { nexusTestnet } from '@/lib/wagmi';
import { useAuth } from '@/hooks/auth';
import { AuthModal } from '@/components/auth/AuthModal';

interface Props {
  children: React.ReactNode;
}

export function RainbowKitProvider({ children }: Props) {
  const { address, isConnected } = useAccount();

  const {
    handleWalletConnection,
    modalOpen,
    authStatus,
    authError,
    setModalOpen,
  } = useAuth();

  useEffect(() => {
    handleWalletConnection();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isConnected]);

  return (
    <RainbowKitProviderBase
      initialChain={nexusTestnet}
      theme={darkTheme({
        accentColor:           '#15c6e6',
        accentColorForeground: '#0A0A0A',
        borderRadius:          'medium',
        fontStack:             'system',
        overlayBlur:           'small',
      })}
    >
      {children}

      <AuthModal
        isOpen={modalOpen}
        status={authStatus}
        error={authError}
        onClose={() => setModalOpen(false)}
      />
    </RainbowKitProviderBase>
  );
}