'use client';

import { wizardActions } from '@/hooks/wizard';
import { Button } from '@/components/ui/button';
import { Rocket, Coins, BarChart3, Lock } from 'lucide-react';

const STEPS = [
  {
    icon: Rocket,
    title: 'Configure Your Launch',
    description: 'Configure your token, funding goal, vesting schedule, timeline, and liquidity percentage.',
  },
  {
    icon: Coins,
    title: 'Deposit Tokens',
    description: 'Deposit your project tokens to activate the launch for contributions.',
  },
  {
    icon: BarChart3,
    title: 'Raise Funds',
    description: 'Contributors send tokens. Reach your soft cap to succeed.',
  },
  {
    icon: Lock,
    title: 'Add Liquidity',
    description: 'Deposit liquidity tokens, finalize and lock LP in the AMM.',
  },
];

export function WizardIntro() {
  return (
    <div className="flex flex-col gap-6">
      {/* ── Headline ──────────────────────────────────── */}
      <div className="flex flex-col gap-2 text-center">
        <h3 className="text-lg font-bold text-foreground">
          Configure Your Launch
        </h3>
        <p className="text-sm text-muted-foreground">
          Deterministic token launch infrastructure — designed for verifiable execution, protocol-enforced liquidity, and predictable outcomes.
        </p>
      </div>

      {/* ── Steps overview ────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {STEPS.map(({ icon: Icon, title, description }, index) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neon-blue-tone border border-neon-blue/20">
              <Icon className="h-4 w-4 text-neon-blue" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-neon-blue/60">
                  0{index + 1}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {title}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Actions ───────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <Button
          onClick={wizardActions.goToWizard}
          className="w-full border border-neon-orange/40 bg-neon-orange-tone text-neon-orange hover:bg-neon-orange/20"
        >
          Configure Launch
        </Button>
        <a
          href="https://docs.exhibition.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-lg border border-border px-4 py-2 text-center text-sm text-muted-foreground transition-colors hover:text-foreground hover:border-neon-blue/30"
        >
          Learn More
        </a>
      </div>
    </div>
  );
}