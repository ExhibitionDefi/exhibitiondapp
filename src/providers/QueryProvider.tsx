'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export function QueryProvider({ children }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:       10_000,  // don't refetch if data is <10s old
            refetchInterval: false,   // no global polling — each hook opts in
            retry:           2,
            retryDelay:      attemptIndex =>
              Math.min(1_000 * 2 ** attemptIndex, 10_000), // 1s → 2s → 4s … cap 10s
            refetchOnWindowFocus:      false, // don't hammer RPC on tab switch
            refetchOnReconnect:        true,  // do refresh when network comes back
            refetchOnMount:            true,
          },
          mutations: {
            retry: 0, // never auto-retry writes — user must re-submit
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}