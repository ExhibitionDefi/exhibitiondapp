'use client';

import { useCallback, useState, useRef } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { apiClient } from '@/lib/apiClient';
import { authStore, authActions, useAuthStore } from './index';
import type { AuthStatus } from '@/components/auth/AuthModal';

interface AuthMessageResponse {
  success: boolean;
  data: { message: string };
}

interface AuthVerifyResponse {
  success: boolean;
  data: {
    address:   string;
    csrfToken: string;
  };
}

interface AuthMeResponse {
  success: boolean;
  data: {
    address:   string;
    expiresAt: number;
    csrfToken: string;
  };
}

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync }     = useSignMessage();
  const { isAuthenticated, csrfToken } = useAuthStore();

  // ── Modal state lives here — not in provider ──────
  const [modalOpen,  setModalOpen]  = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');
  const [authError,  setAuthError]  = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // ── Single signing lock ───────────────────────────
  // Defined outside callbacks so it's never recreated
  const signingRef = useRef(false);

  // ── Logout ────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apiClient.post('/api/auth/logout', {});
    } catch {
      // ignore — clear store regardless
    } finally {
      authActions.setLoggedOut();
    }
  }, []); // no deps — never recreated

  // ── Check existing session ────────────────────────
  const checkSession = useCallback(async (walletAddress: string): Promise<boolean> => {
    try {
      const { data } = await apiClient.get<AuthMeResponse>('/api/auth/me');

      if (data.address.toLowerCase() !== walletAddress.toLowerCase()) {
        return false;
      }

      authActions.setAuthenticated(data.address, data.csrfToken);
      return true;
    } catch {
      return false;
    }
  }, []); // no deps — never recreated

  // ── Full sign flow ────────────────────────────────
  const login = useCallback(async (walletAddress: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setAuthError(null);
    setAuthStatus('signing');
    setModalOpen(true);

    try {
      // 1. Get message
      const { data: { message } } = await apiClient.get<AuthMessageResponse>(
        '/api/auth/message'
      );

      // 2. Sign
      const signature = await signMessageAsync({ message });

      // 3. Verify
      setAuthStatus('verifying');

      const { data } = await apiClient.post<AuthVerifyResponse>('/api/auth/verify', {
        address:   walletAddress,
        signature,
        message,
      });

      // 4. Hydrate store
      authActions.setAuthenticated(data.address, data.csrfToken);
      setAuthStatus('success');
      setTimeout(() => setModalOpen(false), 1200);
      return true;

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';

      const isRejection =
        msg.toLowerCase().includes('rejected') ||
        msg.toLowerCase().includes('denied');

      setAuthStatus('error');
      setAuthError(isRejection ? 'You rejected the signature request' : msg);

      if (!isRejection) setError(msg);
      return false;

    } finally {
      setIsLoading(false);
      signingRef.current = false; // always release lock here
    }
  }, [signMessageAsync]); // only real dep

  // ── Main auth controller ──────────────────────────
  // Called by RainbowKitProvider — handles the full
  // connect/reconnect/wallet-change flow in one place
  const handleWalletConnection = useCallback(async () => {
    if (!isConnected || !address) {
      signingRef.current = false;
      return;
    }

    const normalized = address.toLowerCase();

    // Wallet changed — reset and logout first
    if (authStore.isAuthenticated && normalized !== authStore.address) {
      signingRef.current = false;
      await logout();
      // fall through to re-auth
    }

    // Already authenticated for this wallet — nothing to do
    if (authStore.isAuthenticated && authStore.address === normalized) {
      return;
    }

    // Guard duplicate attempts
    if (signingRef.current) return;
    signingRef.current = true;

    // 1. Check existing session — no signing if cookie still valid
    const sessionValid = await checkSession(normalized);
    if (sessionValid) {
      signingRef.current = false;
      return;
    }

    // 2. No valid session — full sign flow
    await login(normalized);
    // signingRef released inside login's finally block

  }, [address, isConnected, checkSession, login, logout]);

  // ── ensureAuth ────────────────────────────────────
  // Used by useProjectMetadata and any owner action
  const ensureAuth = useCallback(async (): Promise<boolean> => {
    if (!isConnected || !address) return false;

    const normalized = address.toLowerCase();

    if (authStore.isAuthenticated && authStore.address === normalized) {
      return true;
    }

    const sessionValid = await checkSession(normalized);
    if (sessionValid) return true;

    return login(normalized);
  }, [address, isConnected, checkSession, login]);

  return {
    // auth state
    isAuthenticated,
    isLoading,
    error,
    csrfToken,
    // modal state — consumed by RainbowKitProvider
    modalOpen,
    authStatus,
    authError,
    setModalOpen,
    // actions
    handleWalletConnection,
    logout,
    ensureAuth,
  };
}