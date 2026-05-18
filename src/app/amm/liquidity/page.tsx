'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Address } from 'viem';
import { AddLiquidityPanel }    from '@/components/amm/AddLiquidityPanel';
import { RemoveLiquidityPanel } from '@/components/amm/RemoveLiquidityPanel';
import { PageWrapper }          from '@/components/layout';
import { cn } from '@/lib/utils';

type LiquidityMode = 'add' | 'remove';

function LiquidityComponent() {
  const searchParams        = useSearchParams();
  const [mode, setMode]     = useState<LiquidityMode>('add');

  const tokenA = searchParams.get('tokenA') as Address | null;
  const tokenB = searchParams.get('tokenB') as Address | null;

  return (
    <PageWrapper>
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Liquidity</h1>
          <p className="text-sm text-muted-foreground">
            Add or remove liquidity from Exhibition AMM pools.
          </p>
        </div>

        {/* ── Mode Toggle ──────────────────────────────── */}
        <div className="mb-4 flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setMode('add')}
            className={cn(
              'flex flex-1 items-center justify-center rounded-md py-2 text-sm font-medium transition-colors',
              mode === 'add'
                ? 'bg-neon-blue-tone text-neon-blue'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Add Liquidity
          </button>
          <button
            onClick={() => setMode('remove')}
            className={cn(
              'flex flex-1 items-center justify-center rounded-md py-2 text-sm font-medium transition-colors',
              mode === 'remove'
                ? 'bg-neon-blue-tone text-neon-blue'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Remove Liquidity
          </button>
        </div>

        {mode === 'add' ? (
          <AddLiquidityPanel
            initialTokenA={tokenA ?? undefined}
            initialTokenB={tokenB ?? undefined}
          />
        ) : (
          <RemoveLiquidityPanel
            initialTokenA={tokenA ?? undefined}
            initialTokenB={tokenB ?? undefined}
          />
        )}
      </div>
    </PageWrapper>
  );
}

export default function LiquidityPage() {
  return (
    <Suspense fallback={null}>
      <LiquidityComponent />
    </Suspense>
  );
}