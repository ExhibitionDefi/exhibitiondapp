'use client';

import { formatBlockToDate, formatBlocksRemaining } from '@/lib/formatters';
import { useLiquidityLock } from '@/hooks/contracts/amm';
import type { Project } from '@/types/project';

interface LaunchTimelineProps {
  launch:       Project;
  currentBlock: bigint;
  fundingEnded: boolean;
}

export function LaunchTimeline({
  launch,
  currentBlock,
  fundingEnded,
}: LaunchTimelineProps) {
  const {
    startBlock,
    endBlock,
    projectToken,
    contributionToken,
    owner,
    liquidityAdded,
  } = launch;

  const { lock } = useLiquidityLock(
    projectToken,
    contributionToken,
    owner
  );

  // ── Derived state ─────────────────────────────────
  const lockEndBlock  = lock?.unlockBlock ?? 0n;
  const lockPending   = liquidityAdded && !lock;
  const lockActive    = lock && !lock.isUnlocked;
  const lockDone      = lock && lock.isUnlocked;

  const fundingStarted = currentBlock >= startBlock;   // funding window is open
  const fundingOpen    = fundingStarted && !fundingEnded; // actively accepting contributions

  // ── Timeline items ────────────────────────────────
  const items: TimelineItem[] = [
    {
      label: 'Launch Start',
      block: startBlock,
      date:  formatBlockToDate(startBlock, currentBlock),
      done:  fundingStarted,
      // Active (pulsing) only while we're still waiting for funding to open
      active: !fundingStarted,
      // Countdown copy: "Opens in ~1w 1d 20h"
      countdownPrefix: 'Opens in',
    },
    {
      label: 'Funding End',
      block: endBlock,
      date:  fundingEnded
        ? 'Ended'
        : formatBlockToDate(endBlock, currentBlock),
      done:  fundingEnded,
      // Active (pulsing) only once funding is actually open
      active: fundingOpen,
      // Countdown copy: "Closes in ~6d 4h"
      countdownPrefix: 'Closes in',
    },
    {
      label: 'Liquidity Lock End',
      block: lockEndBlock,
      date: lock
        ? formatBlockToDate(lock.unlockBlock, currentBlock)
        : liquidityAdded
        ? 'Initializing...'
        : 'Pending',
      done:   lockDone  ?? false,
      active: lockActive ?? false,
      hidden: !liquidityAdded && !lock,
      countdownPrefix: 'Unlocks in',
    },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">Timeline</h2>

      <div className="flex flex-col gap-0">
        {items
          .filter(item => !item.hidden)
          .map((item, index, arr) => (
            <div key={item.label} className="flex gap-3">

              {/* ── Connector ─────────────────────── */}
              <div className="flex flex-col items-center">
                <div className={`
                  flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 mt-0.5
                  ${item.done
                    ? 'border-neon-blue bg-neon-blue'
                    : item.active
                    ? 'border-neon-blue bg-neon-blue-tone'
                    : 'border-border bg-muted/30'
                  }
                `}>
                  {item.done && (
                    <svg
                      className="h-2.5 w-2.5 text-charcoal"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {item.active && !item.done && (
                    <div className="h-1.5 w-1.5 rounded-full bg-neon-blue animate-pulse" />
                  )}
                </div>

                {index < arr.length - 1 && (
                  <div className={`w-0.5 flex-1 my-1 ${
                    item.done ? 'bg-neon-blue/40' : 'bg-border'
                  }`} />
                )}
              </div>

              {/* ── Content ───────────────────────── */}
              <div className="flex flex-col gap-0.5 pb-4">
                <span className={`text-xs font-medium ${
                  item.active
                    ? 'text-neon-blue'
                    : item.done
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}>
                  {item.label}
                </span>

                <span className="text-[11px] text-muted-foreground">
                  {item.date}
                </span>

                {item.block > 0n && (
                  <span className="text-[11px] text-muted-foreground">
                    Block {item.block.toString()}
                  </span>
                )}

                {/* Active countdown — e.g. "Opens in ~1w 1d 20h" or "Closes in ~6d 4h" */}
                {item.active && item.block > currentBlock && (
                  <span className="text-[11px] text-neon-blue font-medium">
                    {item.countdownPrefix} {formatBlocksRemaining(item.block - currentBlock)}
                  </span>
                )}

                {/* Liquidity lock: waiting for on-chain init */}
                {item.label === 'Liquidity Lock End' && lockPending && (
                  <span className="text-[11px] text-neon-orange">
                    Waiting for lock initialization…
                  </span>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

interface TimelineItem {
  label:           string;
  block:           bigint;
  date:            string;
  done:            boolean;
  active:          boolean;
  hidden?:         boolean;
  countdownPrefix: string;
}