'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAuth }    from '@/hooks/auth';
import { AuthModal }  from '@/components/auth/AuthModal';

export function AuthProvider() {
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
    <AuthModal
      isOpen={modalOpen}
      status={authStatus}
      error={authError}
      onClose={() => setModalOpen(false)}
    />
  );
}