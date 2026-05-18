'use client';

import { useSearchParams } from 'next/navigation';
import type { Address } from 'viem';
import { LockLiquidityPanel } from '@/components/amm';
import { PageWrapper } from '@/components/layout';
import { Suspense } from 'react';

function LockLiquidityComponent() {
  const searchParams = useSearchParams();
  const tokenA = searchParams.get('tokenA') as Address | null;
  const tokenB = searchParams.get('tokenB') as Address | null;

  return (
    <PageWrapper>
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Lock Liquidity</h1>
          <p className="text-sm text-muted-foreground">
            Lock your LP tokens to signal commitment to your community.
          </p>
        </div>
        <LockLiquidityPanel
          initialTokenA={tokenA ?? undefined}
          initialTokenB={tokenB ?? undefined}
        />
      </div>
    </PageWrapper>
  );
}

export default function LockLiquidityPage() {
  return(
    <Suspense fallback={null}>
      <LockLiquidityComponent/>
    </Suspense>
  );
}