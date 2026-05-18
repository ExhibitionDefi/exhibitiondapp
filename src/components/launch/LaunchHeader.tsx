'use client';

import { SafeImage } from '@/components/ui/SafeImage';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatAddress, getAddressExplorerUrl } from '@/lib/formatters';
import { ExternalLink } from 'lucide-react';
import { useProjectMetadata } from '@/hooks/auth';
import Link from 'next/link';
import type { Project } from '@/types/project';

const STATUS_BADGE: Record<string, string> = {
  Active:     'border-neon-orange/40 bg-gradient-to-r from-neon-orange/10 to-neon-orange/5 text-neon-orange shadow-sm',
  Upcoming:   'border-yellow-500/40 bg-gradient-to-r from-yellow-400/10 to-yellow-400/5 text-yellow-400 shadow-sm',
  Claimable:  'border-green-500/40 bg-gradient-to-r from-green-400/10 to-green-400/5 text-green-400 shadow-sm',
  Successful: 'border-green-500/40 bg-gradient-to-r from-green-400/10 to-green-400/5 text-green-400 shadow-sm',
  Completed:  'border-neon-blue/40 bg-gradient-to-r from-neon-blue/20 to-neon-blue/10 text-neon-blue shadow-sm',
  Refundable: 'border-destructive/40 bg-destructive/10 text-destructive shadow-sm',
  Failed:     'border-destructive/40 bg-destructive/10 text-destructive shadow-sm',
  Unknown:    'border-muted/40 bg-muted/10 text-muted-foreground',
};

const STATUS_BORDER: Record<string, string> = {
  Active:     'border-neon-orange/25',
  Upcoming:   'border-yellow-400/20',
  Claimable:  'border-green-400/20',
  Successful: 'border-green-400/20',
  Completed:  'border-neon-blue/25',
  Refundable: 'border-destructive/20',
  Failed:     'border-destructive/20',
  Unknown:    'border-border',
};

const STATUS_BG: Record<string, string> = {
  Active:     'bg-neon-orange/[0.03]',
  Upcoming:   'bg-yellow-400/[0.02]',
  Claimable:  'bg-green-400/[0.02]',
  Successful: 'bg-green-400/[0.02]',
  Completed:  'bg-neon-blue/[0.03]',
  Refundable: 'bg-destructive/[0.02]',
  Failed:     'bg-destructive/[0.02]',
  Unknown:    '',
};

interface LaunchHeaderProps {
  launch: Project;
}

export function LaunchHeader({ launch }: LaunchHeaderProps) {
  const {
    tokenLogoURI,
    tokenName,
    tokenSymbol,
    projectToken,
    owner,
    status,
    projectId,
  } = launch;

  const { metadata } = useProjectMetadata(projectId.toString());
  const badgeClass    = STATUS_BADGE[status.label]  ?? STATUS_BADGE.Unknown;
  const statusBorder  = STATUS_BORDER[status.label] ?? 'border-border';
  const statusBg      = STATUS_BG[status.label]     ?? '';

  return (
    <div className={cn(
      'flex flex-col gap-4 rounded-xl border p-4',
      statusBorder,
      statusBg,
    )}>
      {/* ── Logo + Name + Status ─────────────────────── */}
      <div className="flex items-start gap-4">

        {/* Logo */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border">
          <SafeImage
            src={tokenLogoURI ?? ''}
            alt={tokenName || tokenSymbol}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>

        {/* Name + badge + meta */}
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {tokenName || tokenSymbol}
            </h1>
            <Badge
              variant="outline"
              className={cn('text-[10px] font-medium tracking-wide', badgeClass)}
            >
              {status.label}
            </Badge>
          </div>

          {/* Symbol + Overview + Twitter */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="font-mono text-neon-blue/70">{tokenSymbol}</span>
            <span>·</span>
            <Link
              href={`/launches/${projectId}/overview`}
              className="hover:text-foreground hover:underline transition-colors"
            >
              Overview
            </Link>
            {metadata?.twitter && (
              <>
                <span>·</span>
                <a
                  href={metadata.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                  aria-label="X / Twitter"
                >
                
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3 w-3 fill-current"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
                  </svg>
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Address row ──────────────────────────────── */}
      <div className="flex flex-col gap-2 rounded-lg border border-neon-blue/30 bg-gradient-to-r from-neon-blue/20 via-neon-blue/10 to-neon-orange/15 p-3 shadow-md">
        <AddressRow label="Token" address={projectToken} />
        <AddressRow label="Owner" address={owner} />
      </div>
    </div>
  );
}

function AddressRow({ label, address }: { label: string; address: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <a
        href={getAddressExplorerUrl(address)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-neon-blue hover:underline"
      >
        {formatAddress(address)}
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}