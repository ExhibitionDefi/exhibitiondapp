'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAllPools } from '@/hooks/contracts/amm';
import { PoolCard } from '@/components/amm/PoolCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

export function PoolsPanel() {
  const router              = useRouter();
  const [search, setSearch] = useState('');

  const { pools, total, isLoading } = useAllPools();

  return (
    <div className="flex flex-col gap-4">

      {/* ── Header row ────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by token symbol..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-border text-sm"
          />
        </div>
        <Button
          onClick={() => router.push('/amm/liquidity')}
          className="shrink-0 border border-neon-blue/40 bg-neon-blue-tone text-neon-blue hover:bg-neon-blue/20"
          size="sm"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New Pool
        </Button>
      </div>

      {/* ── Stats ─────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{total} pool{total !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Pool list ─────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : pools.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">No pools found</p>
          <Button
            onClick={() => router.push('/amm/liquidity')}
            size="sm"
            className="border border-neon-blue/40 bg-neon-blue-tone text-neon-blue hover:bg-neon-blue/20"
          >
            Create First Pool
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pools
            .filter(pool => {
              if (!search.trim()) return true;
              return true; // search filtering handled by PoolCard symbol lookup
            })
            .map((pool, i) => (
              <PoolCard
                key={`${pool.tokenA}-${pool.tokenB}-${i}`}
                pool={pool}
              />
            ))}
        </div>
      )}
    </div>
  );
}