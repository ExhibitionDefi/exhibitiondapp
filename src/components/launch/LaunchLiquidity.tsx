'use client';

import { formatBlockToDate, formatBlocksRemaining, formatPercentage,blocksToRealDays  } from '@/lib/formatters';
import { useLiquidityLock } from '@/hooks/contracts/amm';
import type { Project } from '@/types/project';

interface LaunchLiquidityProps {
  launch:       Project;
  currentBlock: bigint;
}

export function LaunchLiquidity({ launch, currentBlock }: LaunchLiquidityProps) {
  const {
    projectToken,
    contributionToken,
    owner,
    liquidityPercentage,
    lockDurationBlocks,
    liquidityAdded,
    requiredLiquidityTokens,
    depositedLiquidityTokens,
  } = launch;

  // Use project owner, not connected user
  const { lock } = useLiquidityLock(
    projectToken,
    contributionToken,
    owner
  );

  // ── Derived values ────────────────────────────────
  const liquidityPercent = liquidityPercentage !== undefined
    ? Number(liquidityPercentage) / 100
    : 0;

  const depositProgress = requiredLiquidityTokens > 0n
    ? Math.min(
        Number((depositedLiquidityTokens * 100n) / requiredLiquidityTokens),
        100
      )
    : 0;

  // ── Lock State Machine ────────────────────────────
  let lockStatus: 'Pending' | 'Locked' | 'Unlocked' = 'Pending';

  if (!liquidityAdded) {
    lockStatus = 'Pending';
  } else if (lock) {
    lockStatus = lock.isUnlocked ? 'Unlocked' : 'Locked';
  }

  const lockColor =
    lockStatus === 'Locked'
      ? 'text-neon-orange'
      : lockStatus === 'Unlocked'
      ? 'text-green-400'
      : 'text-muted-foreground';

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">Liquidity</h2>

      {/* ── Stats Grid ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-1">
        <StatCard label="Liquidity Allocation" value={formatPercentage(BigInt(Math.round(liquidityPercent * 100)))} />
        <StatCard label="Lock Duration" value={`${blocksToRealDays(lockDurationBlocks).toFixed(1)} days`} />
        <StatCard label="Liquidity Status" value={liquidityAdded ? 'Added' : 'Pending'} valueColor={liquidityAdded ? 'text-green-400' : 'text-muted-foreground'} />
        <StatCard label="Lock Status" value={lockStatus} valueColor={lockColor} />
      </div>

      {/* ── Deposit Progress (before liquidity added) ───── */}
      {!liquidityAdded && requiredLiquidityTokens > 0n && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Deposit Progress</span>
            <span className="text-foreground">{formatPercentage(BigInt(Math.round(depositProgress * 100)))}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/20">
            <div
              className="h-full rounded-full bg-neon-blue/60 transition-all duration-500 ease-out"
              style={{ width: `${depositProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Active Lock Timer ───────────────────────── */}
      {liquidityAdded && lock && currentBlock && !lock.isUnlocked && (
        <div className="flex items-center justify-between rounded-lg border border-neon-orange/20 bg-gradient-to-r from-neon-orange/10 to-transparent px-3 py-2 text-xs">
          <span className="text-neon-orange font-medium flex items-center gap-1">
            ⏱ Lock ends
          </span>
          <span className="text-neon-orange font-medium">
            {formatBlocksRemaining(lock.blocksUntilUnlock)} · {formatBlockToDate(lock.unlockBlock, currentBlock)}
          </span>
        </div>
      )}

      {/* ── Unlock State ───────────────────────────── */}
      {liquidityAdded && lock && lock.isUnlocked && (
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs bg-gradient-to-r from-green-400/10 to-transparent">
          <span className="text-green-400 font-medium flex items-center gap-1">🔓 Lock ended</span>
          <span className="text-green-400 font-medium">{formatBlockToDate(lock.unlockBlock, currentBlock)}</span>
        </div>
      )}
    </div>
  );
}

// ── Small reusable stat card ───────────────────────────
function StatCard({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-gradient-to-br from-muted/40 to-muted/20 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:shadow-[0_0_10px_rgba(0,200,255,0.08)] transition-all">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${valueColor ?? 'text-foreground'}`}>{value}</span>
    </div>
  );
}