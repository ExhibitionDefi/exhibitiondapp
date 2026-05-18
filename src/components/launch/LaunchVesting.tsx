'use client';

import type { Project } from '@/types/project';
import { formatPercentage } from '@/lib/formatters';

interface LaunchVestingProps {
  launch: Project;
}

export function LaunchVesting({ launch }: LaunchVestingProps) {
  const { vesting } = launch;

  if (!vesting.enabled) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Vesting</h2>
        <p className="text-xs text-muted-foreground">
          No vesting — tokens are fully claimable after launch succeeds.
        </p>
      </div>
    );
  }

  const safeDuration = vesting.durationDays > 0 ? vesting.durationDays : 1; // avoid division by 0
  const cliffPercent =
    vesting.cliffDays > 0
      ? (vesting.cliffDays / safeDuration) * (100 - vesting.initialReleasePercent)
      : 0;

  const items: VestingItem[] = [
    { label: 'Initial Release', value: `${vesting.initialReleasePercent.toFixed(2)}%` },
    { label: 'Cliff Period', value: vesting.cliffDays > 0 ? `${vesting.cliffDays.toFixed(1)} days` : 'No cliff' },
    { label: 'Vesting Duration', value: `${vesting.durationDays.toFixed(1)} days` },
    { label: 'Claim Interval', value: `Every ${vesting.intervalDays.toFixed(1)} days` },
  ];

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">Vesting</h2>

      {/* ── Vesting Bar ────────────────────────────── */}
      <div className="relative h-6 w-full overflow-hidden rounded-full bg-muted/20">
        {/* Vesting fill with gradient */}
        <div
          className="absolute top-0 h-full rounded-l-full"
          style={{
            left: `${vesting.initialReleasePercent}%`,
            width: `${100 - vesting.initialReleasePercent}%`,
            background: 'linear-gradient(to right, #60a5fa/40, #3b82f6/40)',
          }}
        />

        {/* Initial release */}
        <div
          className="absolute left-0 top-0 h-full bg-neon-orange/70 flex items-center justify-center rounded-l-full"
          style={{ width: `${vesting.initialReleasePercent}%` }}
        >
          {vesting.initialReleasePercent >= 10 && (
            <span className="text-[9px] font-medium text-charcoal">
              {vesting.initialReleasePercent.toFixed(0)}%
            </span>
          )}
        </div>

        {/* Cliff marker */}
        {vesting.cliffDays > 0 && (
          <div
            className="absolute top-0 h-full w-1 bg-neon-blue/80 rounded"
            style={{ left: `${vesting.initialReleasePercent + cliffPercent}%` }}
          />
        )}
      </div>

      {/* ── Legend ─────────────────────────────────── */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <LegendDot color="bg-neon-orange/70" label="Initial Release" />
        <LegendDot color="bg-neon-blue/40" label="Vesting" />
        {vesting.cliffDays > 0 && <LegendDot color="bg-neon-blue/80" label="Cliff" isLine />}
      </div>

      {/* ── Stats Grid ────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        {items.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col gap-0.5 rounded-lg bg-gradient-to-br from-muted/40 to-muted/20 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:shadow-[0_0_10px_rgba(0,200,255,0.08)] transition-all"
          >
            <span className="text-[11px] text-muted-foreground">{label}</span>
            <span className="text-xs font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LegendDot({ color, label, isLine }: { color: string; label: string; isLine?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {isLine ? <div className={`h-2 w-1 ${color} rounded`} /> : <div className={`h-2 w-2 rounded-full ${color}`} />}
      <span>{label}</span>
    </div>
  );
}

interface VestingItem {
  label: string;
  value: string;
}