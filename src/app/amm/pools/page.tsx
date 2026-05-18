import { Suspense } from 'react';
import { PoolsPanel } from '@/components/amm/PoolsPanel';
import { PageWrapper } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';

export default function PoolsPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Pools</h1>
          <p className="text-sm text-muted-foreground">
            Browse all liquidity pools on the Exhibition AMM.
          </p>
        </div>
        <Suspense fallback={
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        }>
          <PoolsPanel />
        </Suspense>
      </div>
    </PageWrapper>
  );
}