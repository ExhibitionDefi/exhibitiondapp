'use client';

import { proxy, useSnapshot } from 'valtio';
export { useAuth } from './useAuth';
export { useProjectMetadata } from './useProjectMetadata';
export type { ProjectMetadata } from './useProjectMetadata';


interface AuthStore {
  isAuthenticated: boolean;
  csrfToken:       string | null;
  address:         string | null;
}

export const authStore = proxy<AuthStore>({
  isAuthenticated: false,
  csrfToken:       null,
  address:         null,
});

export const authActions = {
  setAuthenticated: (address: string, csrfToken: string) => {
    authStore.isAuthenticated = true;
    authStore.csrfToken       = csrfToken;
    authStore.address         = address.toLowerCase();
  },
  setLoggedOut: () => {
    authStore.isAuthenticated = false;
    authStore.csrfToken       = null;
    authStore.address         = null;
  },
};

export function useAuthStore() {
  return useSnapshot(authStore);
}