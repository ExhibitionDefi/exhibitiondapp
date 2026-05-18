'use client';


import { use } from 'react';
import { useBlockNumber } from 'wagmi';
import { useProjectData } from '@/hooks/contracts/exhibition';
import { PageWrapper } from '@/components/layout';
import { LaunchHeader }    from '@/components/launch/LaunchHeader';
import { LaunchStats }     from '@/components/launch/LaunchStats';
import { LaunchTimeline }  from '@/components/launch/LaunchTimeline';
import { LaunchVesting }   from '@/components/launch/LaunchVesting';
import { LaunchLiquidity } from '@/components/launch/LaunchLiquidity';
import { ActionPanel }     from '@/components/launch/panels/ActionPanel';
import { Skeleton } from '@/components/ui/skeleton';

interface LaunchDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function LaunchDetailPage({ params }: LaunchDetailPageProps) {
  const { id }             = use(params);
  const projectId          = id ? BigInt(id) : 0n;
  const { data: currentBlock } = useBlockNumber({ 
    watch: false,
    query: {
      refetchInterval:      12_000,
      staleTime:            12_000,
      refetchOnWindowFocus: true,
    }
  });
  const { project, isLoading, isError } = useProjectData(projectId);
  const block = currentBlock ?? 0n;

  if (!id) {
    return (
      <PageWrapper>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">Invalid launch ID.</p>
        </div>
      </PageWrapper>
    );
  }

  // ── Loading state ─────────────────────────────────────
  if (isLoading || !currentBlock) {
    return (
      <PageWrapper>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  // ── Error state ───────────────────────────────────────
  if (isError || !project) {
    return (
      <PageWrapper>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Launch not found or failed to load.
          </p>
        </div>
      </PageWrapper>
    );
  }

  // ── Derived conditions ────────────────────────────────
  const fundingEnded = currentBlock > project.endBlock &&
                       project.status.label === 'Active';

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">

        {/* ── Left Column — Launch Data ─────────────── */}
        <div className="flex flex-col gap-4">
          <LaunchHeader
            launch={project}
          />
          <LaunchStats
            launch={project}
            fundingEnded={fundingEnded}
          />
          <LaunchTimeline
            launch={project}
            currentBlock={currentBlock}
            fundingEnded={fundingEnded}
          />
          <LaunchLiquidity
            launch={project}
            currentBlock={currentBlock}
          />
          {project.vesting.enabled && (
            <LaunchVesting launch={project} />
          )}
        </div>

        {/* ── Right Column — Action Panel ───────────── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ActionPanel launch={project} currentBlock={block} />
        </div>
        
      </div>
    </PageWrapper>
  );
}