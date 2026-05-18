'use client';

import { useSearchParams } from 'next/navigation';
import type { Address } from 'viem';
import { SwapPanel } from '@/components/amm/SwapPanel';
import { PageWrapper } from '@/components/layout';
import { Suspense } from 'react';

function SwapComponent() {
  const searchParams = useSearchParams();
  const tokenA = searchParams.get('tokenA') as Address | null;
  const tokenB = searchParams.get('tokenB') as Address | null;

  return (
    <PageWrapper>
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Swap</h1>
          <p className="text-sm text-muted-foreground">
            Swap tokens instantly via the Exhibition AMM.
          </p>
        </div>
        <SwapPanel
          initialTokenIn={tokenA ?? undefined}
          initialTokenOut={tokenB ?? undefined}
        />
      </div>
    </PageWrapper>
  );
}

export default function SwapPage() {
  return (
    <Suspense fallback={null}>
      <SwapComponent/>
    </Suspense>
  );
}