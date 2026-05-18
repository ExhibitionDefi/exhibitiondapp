'use client';

export const dynamic = 'force-dynamic';

import { use } from 'react';
import { useProjectData } from '@/hooks/contracts/exhibition';
import { useProjectMetadata } from '@/hooks/auth';
import { PageWrapper } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';
import { SafeImage } from '@/components/ui/SafeImage';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ExternalLink, Globe, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatAmount } from '@/lib/formatters';

const STATUS_BADGE: Record<string, string> = {
  Active:     'border-neon-blue/40 bg-gradient-to-r from-neon-blue/20 to-neon-blue/10 text-neon-blue shadow-sm',
  Upcoming:   'border-yellow-500/40 bg-gradient-to-r from-yellow-400/10 to-yellow-400/5 text-yellow-400 shadow-sm',
  Claimable:  'border-green-500/40 bg-gradient-to-r from-green-400/10 to-green-400/5 text-green-400 shadow-sm',
  Successful: 'border-green-500/40 bg-gradient-to-r from-green-400/10 to-green-400/5 text-green-400 shadow-sm',
  Completed:  'border-muted/40 bg-muted/10 text-muted-foreground',
  Refundable: 'border-neon-orange/40 bg-gradient-to-r from-neon-orange/10 to-neon-orange/5 text-neon-orange shadow-sm',
  Failed:     'border-destructive/40 bg-destructive/10 text-destructive shadow-sm',
  Unknown:    'border-muted/40 bg-muted/10 text-muted-foreground',
};

interface OverviewPageProps {
  params: Promise<{ id: string }>;
}

export default function LaunchOverviewPage({ params }: OverviewPageProps) {
  const { id }      = use(params);
  const projectId   = id ? BigInt(id) : 0n;
  const { project, isLoading: isLoadingProject } = useProjectData(projectId);
  const { metadata, isLoading: isLoadingMeta }   = useProjectMetadata(id);

  const isLoading = isLoadingProject || isLoadingMeta;

  // ── Loading ───────────────────────────────────────────
  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex flex-col gap-6 max-w-3xl">
          <Skeleton className="h-5 w-24 rounded-lg" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </PageWrapper>
    );
  }

  // ── Not found ─────────────────────────────────────────
  if (!project) {
    return (
      <PageWrapper>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">Launch not found.</p>
        </div>
      </PageWrapper>
    );
  }

  const badgeClass    = STATUS_BADGE[project.status.label] ?? STATUS_BADGE.Unknown;
  const hasLinks      = metadata?.website || metadata?.twitter || metadata?.whitepaper;
  const hasAnyContent = metadata?.overview || hasLinks;

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 max-w-3xl">

        {/* ── Back navigation ───────────────────────── */}
        <Link
          href={`/launches/${id}`}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Launch
        </Link>

        {/* ── Token identity card ───────────────────── */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="relative h-14 w-14 min-w-[56px] overflow-hidden rounded-2xl border border-border">
            <SafeImage
              src={project.tokenLogoURI ?? ''}
              alt={project.tokenName || project.tokenSymbol}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground">
                {project.tokenName || project.tokenSymbol}
              </h1>
              <Badge
                variant="outline"
                className={cn('text-[10px] font-medium tracking-wide', badgeClass)}
              >
                {project.status.label}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">{project.tokenSymbol}</span>
          </div>
        </div>

        {/* ── No metadata state ─────────────────────── */}
        {!hasAnyContent && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card">
            <p className="text-sm text-muted-foreground">No overview added yet.</p>
            <p className="text-xs text-muted-foreground/60">
              The project owner hasn't added any details.
            </p>
          </div>
        )}

        {/* ── About ─────────────────────────────────── */}
        {metadata?.overview && (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">About</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {metadata.overview}
            </p>
          </div>
        )}

        {/* ── Links ─────────────────────────────────── */}
        {hasLinks && (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">Links</h2>
            <div className="flex flex-col gap-2">
              {metadata?.website && (
                <LinkRow
                  icon={<Globe className="h-4 w-4" />}
                  label="Website"
                  href={metadata.website}
                />
              )}
              {metadata?.twitter && (
                <LinkRow
                  icon={
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
                    </svg>
                  }
                  label=''
                  href={metadata.twitter}
                />
              )}
              {metadata?.whitepaper && (
                <LinkRow
                  icon={<FileText className="h-4 w-4" />}
                  label="Whitepaper / Tokenomics"
                  href={metadata.whitepaper}
                />
              )}
            </div>
          </div>
        )}

        {/* ── Token info ────────────────────────────── */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Token Info</h2>
          <div className="flex flex-col gap-2">
            <InfoRow label="Symbol"       value={project.tokenSymbol} />
            <InfoRow label="Total Supply" value={formatAmount(BigInt(project.totalSupply), 18)} />
            <InfoRow
              label="Token Address"
              value={
                <a
                  href={`${process.env.NEXT_PUBLIC_NEXUS_TESTNET_EXPLORER_URL}/address/${project.projectToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-neon-blue hover:underline"
                >
                  {project.projectToken.slice(0, 6)}...{project.projectToken.slice(-4)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              }
            />
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}

// ── Link row ──────────────────────────────────────────────
function LinkRow({
  icon,
  label,
  href,
}: {
  icon:  React.ReactNode;
  label: string;
  href:  string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm hover:bg-muted/40 transition-colors group"
    >
      <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
        {icon}
        <span>{label}</span>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
    </a>
  );
}

// ── Info row ──────────────────────────────────────────────
function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}