'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useProjectsByStatus } from '@/hooks/contracts/exhibition';
import { useAllProjects } from '@/hooks/contracts/exhibition';
import { LaunchCard } from '@/components/launch/LaunchCard';
import { PageWrapper } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBlockNumber }            from 'wagmi';

const STATUS_TABS = [
  { label: 'All',        value: null },
  { label: 'Active',     value: 1 },
  { label: 'Claimable',  value: 4 },
  { label: 'Upcoming',   value: 0 },
  { label: 'Successful', value: 2 },
  { label: 'Completed',  value: 6 },
  { label: 'Refundable', value: 5 },
  { label: 'Failed',     value: 3 },
];

const BATCH_SIZE = 15;

export default function LaunchesPage() {
  const [activeStatus, setActiveStatus] = useState<number | null>(null);
  const [search,       setSearch]       = useState('');
  const [page,         setPage]         = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const loaderRef                       = useRef<HTMLDivElement>(null);

  const { data: currentBlock } = useBlockNumber({
    watch: false,
    query: {
      refetchInterval:      12_000,
      staleTime:            12_000,
      refetchOnWindowFocus: true,
    }
  });

  useEffect(() => { setPage(1); }, [activeStatus]);

  // ── Status-filtered IDs (disabled when "All") ────────────
  const { ids, isLoading: isLoadingIds } = useProjectsByStatus(activeStatus ?? 0);

  // ── Paginate IDs (only used in filtered mode) ────────────
  const visibleIds = useMemo(
    () => activeStatus === null ? [] : ids.slice(0, page * BATCH_SIZE),
    [ids, page, activeStatus]
  );
  const hasMore = visibleIds.length < ids.length;

  // ── Fetch projects ────────────────────────────────────────
  // "All" mode  → pass no ids → useAllProjects fetches everything internally
  // Filter mode → pass visibleIds for the selected status
  const { projects: allProjects, isLoading: isLoadingProjects } = useAllProjects(
    activeStatus === null ? {} : { ids: visibleIds }
  );

  // ── Search filter ─────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return allProjects;
    const q = search.toLowerCase();
    return allProjects.filter(p =>
      p.tokenName.toLowerCase().includes(q) ||
      p.tokenSymbol.toLowerCase().includes(q)
    );
  }, [allProjects, search]);

  // ── Infinite scroll ───────────────────────────────────────
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting && hasMore && !isLoadingProjects) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isLoadingProjects]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  const activeTab = STATUS_TABS.find(t => t.value === activeStatus);
  const isLoading = (activeStatus !== null && isLoadingIds) || isLoadingProjects;

  return (
    <PageWrapper>
      <div className="mb-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Launches
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or symbol..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-card border-border text-sm"
            />
          </div>

          <div className="hidden items-center gap-1 rounded-lg border border-border bg-card p-1 md:flex">
            {STATUS_TABS.map(tab => (
              <button
                key={String(tab.value)}
                onClick={() => setActiveStatus(tab.value)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  activeStatus === tab.value
                    ? 'bg-neon-blue-tone text-neon-blue'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative md:hidden">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {activeTab?.label}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-border bg-card shadow-lg">
                {STATUS_TABS.map(tab => (
                  <button
                    key={String(tab.value)}
                    onClick={() => { setActiveStatus(tab.value); setDropdownOpen(false); }}
                    className={cn(
                      'w-full px-3 py-2 text-left text-xs transition-colors',
                      activeStatus === tab.value
                        ? 'text-neon-blue'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
          {filtered.map(launch => (
            <LaunchCard 
              key={launch.projectId.toString()} 
              launch={launch} 
              currentBlock={currentBlock ?? 0n } 
            />
          ))}
        </div>
      ) : !isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No {activeTab?.label.toLowerCase()} launches found.
          </p>
        </div>
      ) : null}

      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
          {Array.from({ length: BATCH_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      <div ref={loaderRef} className="h-4 w-full" />
    </PageWrapper>
  );
}