'use client';

import { useState } from 'react';
import { useAccount, useBlockNumber } from 'wagmi';
import { PageWrapper } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Rocket, HandCoins } from 'lucide-react';
import { wizardActions } from '@/hooks/wizard';
import { Button } from '@/components/ui/button';
import { LaunchCard } from '@/components/launch/LaunchCard';
import { LaunchCardActions } from '@/components/launch/LaunchCardActions';
import { useProjectsByOwner, useUserContributedProjects, useAllProjects } from '@/hooks/contracts/exhibition';

type DashboardTab = 'launches' | 'contributions';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<DashboardTab>('launches');

  if (!isConnected) {
    return (
      <PageWrapper>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Connect your wallet to view your dashboard
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Your launches and contributions on Exhibition.
          </p>
        </div>

        {/* ── Tabs ─────────────────────────────────────── */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 w-fit">
          <button
            onClick={() => setActiveTab('launches')}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'launches'
                ? 'bg-neon-blue-tone text-neon-blue'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Rocket className="h-4 w-4" />
            My Launches
          </button>
          <button
            onClick={() => setActiveTab('contributions')}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'contributions'
                ? 'bg-neon-blue-tone text-neon-blue'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <HandCoins className="h-4 w-4" />
            My Contributions
          </button>
        </div>

        {/* ── Content ──────────────────────────────────── */}
        {activeTab === 'launches'      && <MyLaunches />}
        {activeTab === 'contributions' && <MyContributions />}

      </div>
    </PageWrapper>
  );
}

// ── Skeletons ─────────────────────────────────────────────
function LaunchesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}

function ContributionsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}

// ── My Launches ───────────────────────────────────────────
function MyLaunches() {
  const { address } = useAccount();
  const { ids, isLoading: isLoadingIds } = useProjectsByOwner();

  const { projects, isLoading: isLoadingProjects } = useAllProjects({
    ids:     ids.length > 0 ? ids : undefined,
    limit:   50,
    enabled: !isLoadingIds && ids.length > 0,
  });

  const isLoading = isLoadingIds || isLoadingProjects;

  const myOwnedProjects = projects.filter(
    p => p.owner.toLowerCase() === address?.toLowerCase()
  );

  if (isLoading) return <LaunchesSkeleton />;

  if (myOwnedProjects.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card">
        <Rocket className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          You haven't created any launches yet
        </p>
        <Button onClick={wizardActions.open}>Launch a Token</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {myOwnedProjects.map(launch => (
        <LaunchCardActions key={launch.projectId.toString()} launch={launch} />
      ))}
    </div>
  );
}

// ── My Contributions ──────────────────────────────────────
function MyContributions() {
  const { ids, isLoading } = useUserContributedProjects();

  if (isLoading) return <ContributionsSkeleton />;

  if (ids.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card">
        <HandCoins className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          You haven't contributed to any launches yet
        </p>
      </div>
    );
  }

  return <ContributionsList ids={ids} />;
}

function ContributionsList({ ids }: { ids: bigint[] }) {
  const { projects, isLoading } = useAllProjects({ ids, limit: 50 });
  const { data: currentBlock }  = useBlockNumber({
    watch: false,
    query: { refetchInterval: 12_000, staleTime: 12_000 },
  });

  if (isLoading) return <ContributionsSkeleton />;

  const filtered = projects.filter(p =>
    ids.some(id => id.toString() === p.projectId.toString())
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {filtered.map(launch => (
        <LaunchCard
          key={launch.projectId.toString()}
          launch={launch}
          currentBlock={currentBlock ?? 0n}
        />
      ))}
    </div>
  );
}