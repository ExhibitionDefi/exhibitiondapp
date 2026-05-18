'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useUserPortfolio } from '@/hooks/contracts/amm';
import { PositionCard } from '@/components/amm/PositionCard';
import { PageWrapper } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Layers } from 'lucide-react';

export default function PortfolioPage() {
  const { isConnected } = useAccount();
  const { portfolio, isLoading } = useUserPortfolio();

  // ── Collect position values from each PositionCard ───
  const [positionValues, setPositionValues] = useState<Record<string, number>>({});

  const handleValueCalculated = useCallback((key: string, value: number) => {
    setPositionValues(prev => {
      if (prev[key] === value) return prev; // avoid unnecessary re-renders
      return { ...prev, [key]: value };
    });
  }, []);

  // ── Sum all position values for total portfolio USD ──
  const totalPortfolioValue = Object.values(positionValues).reduce((a, b) => a + b, 0);

  if (!isConnected) {
    return (
      <PageWrapper>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Connect your wallet to view your portfolio
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">

        {/* ── Header ───────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Portfolio</h1>
          <p className="text-sm text-muted-foreground">
            Your liquidity positions on the Exhibition AMM.
          </p>
        </div>

        {/* ── Summary bar ──────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : portfolio && (
          <div className="grid grid-cols-3 gap-3">
            <SummaryCard
              label="Total Positions"
              value={portfolio.positionCount.toString()}
            />
            <SummaryCard
              label="Active Pools"
              value={portfolio.activePoolCount.toString()}
            />
            <SummaryCard
              label="Total Portfolio Value"
              value={totalPortfolioValue > 0 ? `$${totalPortfolioValue.toFixed(2)}` : '—'}
              highlight
            />
          </div>
        )}

        {/* ── Positions ────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : !portfolio || portfolio.positions.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card">
            <Layers className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No liquidity positions found</p>
            <a
              href="/amm/liquidity"
              className="text-xs text-neon-blue hover:underline"
            >
              Add liquidity to get started →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {portfolio.positions.map((position, i) => {
              const key = `${position.tokenA}-${position.tokenB}`;
              return (
                <PositionCard
                  key={`${key}-${i}`}
                  position={position}
                  onValueCalculated={(value) => handleValueCalculated(key, value)}
                />
              );
            })}
          </div>
        )}

      </div>
    </PageWrapper>
  );
}

function SummaryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={highlight ? 'text-lg font-bold text-neon-blue' : 'text-lg font-bold text-foreground'}>
        {value}
      </span>
    </div>
  );
}