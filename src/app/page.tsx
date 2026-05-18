'use client';

import Link from 'next/link';
import { wizardActions } from '@/hooks/wizard';
import { usePlatformStats } from '@/hooks/contracts/exhibition';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, BarChart2, Lock, Rocket, Upload, Users, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRINCIPLES = [
  {
    icon: BarChart2,
    title: 'Deterministic',
    description:
    'Launch parameters, liquidity allocation, and pricing are configured and enforced on-chain. No discretionary decisions — every outcome is governed by protocol rules.',
  },
  {
    icon: Shield,
    title: 'Verifiable',
    description:
    'All launch activity, contributions, and liquidity events are transparent and verifiable on Nexus Layer 1.',
  },
  {
    icon: Lock,
    title: 'Protected',
    description:
    'Launch-time liquidity is locked as a protocol-enforced invariant. Contributors are protected by enforced soft caps, refund mechanisms, and sale vesting schedules that prevent immediate market flooding.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Configure Launch',
    description:
    'Configure your token, funding goal, timeline, liquidity allocation and vesting schedule.',
    icon: Rocket,
  },
  {
    step: '02',
    title: 'Deposit & Activate',
    description:
    'Deposit your project tokens to activate the launch and open it for public contributions.',
    icon: Upload,
  },
  {
    step: '03',
    title: 'Raise Funds',
    description:
    'Contributors participate during the funding window. Soft cap must be reached for success.',
    icon: Users,
  },
  {
    step: '04',
    title: 'Initialize Liquidity',
    description:
    'On success, liquidity is deposited and locked in the AMM. Raised funds are released to the project.',
    icon: LinkIcon,
  },
];

export default function HomePage() {
  const { stats, isLoading: isLoadingStats } = usePlatformStats();

  return (
    <div className="flex flex-col gap-1 w-full">

      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-40 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-neon-blue/10 blur-[140px]" />
        </div>

        <div className="grid items-center gap-14 lg:grid-cols-[2fr_1fr]">
          {/* LEFT */}
          <div className="flex flex-col gap-5">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              Deterministic
              <span className="text-neon-blue block"> 
                primary market infrastructure
              </span>
              <span className="block lg:whitespace-nowrap">
                for verifiable enshrined financial system
              </span>
            </h1>

            <p className="max-w-lg text-muted-foreground">
              Exhibition is a deterministic token launch infrastructure built on Nexus — designed for verifiable execution, protocol-enforced liquidity, and predictable outcomes.
            </p>
            
            <span className="w-fit rounded-full border border-neon-orange/40 bg-neon-orange-tone px-3 py-1 text-xs text-neon-orange">
              Live on Nexus Testnet
            </span>

            <div className="flex gap-3 pt-2">
              <Link href="/launches">
                <Button
                  variant="outline"
                  className="border-neon-blue/40 bg-neon-blue-tone text-neon-blue"
                >
                  Explore Launches
                </Button>
            </Link>

              <Button
                onClick={wizardActions.open}
                className="border border-neon-orange/40 bg-neon-orange-tone text-neon-orange"
              >
                Configure Launch
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
                Rules are configured upfront. Execution is deterministic.
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-6">
            {/* Launch Configuration */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="flex justify-between text-xs text-muted-foreground pb-4 border-b border-border">
                <span>Launch Configuration</span>
                <span>Nexus L1</span>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <div className="flex justify-between text-sm">
                  <span>Target Raise</span>
                  <span className="font-medium text-neon-orange">1.00M USDX</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Liquidity Commitment</span>
                  <span className="font-medium">70%</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Execution Threshold</span>
                  <span className="font-medium text-neon-blue">510K USDX</span>
                </div>

                <div className="h-2 rounded bg-border overflow-hidden">
                  <div className="h-full w-[65%] bg-neon-blue" />
                </div>

                <span className="text-xs text-muted-foreground">
                  Liquidity is created and locked by the protocol on execution
                </span>
              </div>
            </div>

            {/* Stats under preview */}
            <div className="grid grid-cols-3 gap-3">
              {isLoadingStats ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))
              ) : (
                <>
                  <StatCard value={stats?.totalLaunches ?? 0} label="Launches" />
                  <StatCard value={stats?.activeLaunches ?? 0} label="Active" accent="blue" />
                  <StatCard value={stats?.completedLaunches ?? 0} label="Executed" accent="green" />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS – Zigzag / Alternating Layout */}
      <section className="px-6 py-15 bg-gradient-to-b from-background to-card/20">
        <div className="flex flex-col gap-16 max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How Exhibition Works</h2>
            <p className="text-muted-foreground mt-3 text-base">
              From creation to locked liquidity — fully on-chain and deterministic.
            </p>
          </div>

          <div className="space-y-16 md:space-y-24">
            {HOW_IT_WORKS.map((item, index) => {
              const isEven = index % 2 === 0;
              const Icon = item.icon;

              return (
                <div
                  key={item.step}
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center",
                    !isEven && "md:flex-row-reverse"
                  )}
                >
                  {/* Visual / Icon side */}
                  <div
                    className={cn(
                      "flex justify-center md:justify-start",
                      isEven ? "md:pr-8" : "md:pl-8 md:order-2"
                    )}
                  >
                    <div className="relative">
                      {/* Faint large step number */}
                      <div className="absolute -top-8 -left-10 text-9xl font-black text-neon-blue/5 select-none pointer-events-none">
                        {item.step}
                      </div>

                      {/* Icon container */}
                      <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center shadow-lg shadow-neon-blue/10 transition-transform hover:scale-105">
                        <Icon className="w-10 h-10 md:w-14 md:h-14 text-neon-blue" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>

                  {/* Text side */}
                  <div className={cn(isEven ? "md:pl-8" : "md:pr-8 md:order-1")}>
                    <h3 className="text-xl md:text-2xl font-semibold mb-4 text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="px-6 py-15 bg-card/30">
        <div className="mx-auto max-w-5xl flex flex-col gap-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Core Principles</h2>
            <p className="text-sm text-muted-foreground">
              Every design decision is derived from these three properties.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {PRINCIPLES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="border border-border bg-card rounded-xl p-8 flex flex-col gap-4 hover:border-neon-blue/40 transition"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-neon-blue-tone border border-neon-blue/20">
                  <Icon className="w-5 h-5 text-neon-blue" />
                </div>

                <h3 className="font-semibold text-sm">{title}</h3>

                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-15">
        <div className="mx-auto max-w-2xl text-center flex flex-col gap-6">
          <h2 className="text-3xl font-bold">Ready to Launch?</h2>

          <p className="text-muted-foreground text-sm">
            Configure your launch on Exhibition — protocol-enforced liquidity, verifiable on-chain from day one.
          </p>

          <div className="flex justify-center gap-4">
            <Link href="/launches">
              <Button variant="outline">View Launches</Button>
            </Link>

            <Button onClick={wizardActions.open}>Configure Launch</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: 'blue' | 'green';
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col items-center">
      <span
        className={cn(
          'text-lg font-semibold',
          accent === 'blue' && 'text-neon-blue',
          accent === 'green' && 'text-green-400',
          !accent && 'text-foreground'
        )}
      >
        {value.toLocaleString()}
      </span>

      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}