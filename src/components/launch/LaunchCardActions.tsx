'use client';

import { useState } from 'react';
import { LaunchCard } from './LaunchCard';
import { UpdateMetadataModal } from './UpdateMetadataModal';
import { Button } from '@/components/ui/button';
import { ExternalLink, Pencil } from 'lucide-react';
import Link from 'next/link';
import type { Project } from '@/types/project';

interface LaunchCardActionsProps {
  launch: Project;
}

export function LaunchCardActions({ launch }: LaunchCardActionsProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      {/* ── Card — unchanged ──────────────────────── */}
      <LaunchCard launch={launch} />

      {/* ── Action row ────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        <Link href={`/launches/${launch.projectId}/overview`} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-[11px] border-border text-muted-foreground hover:text-foreground gap-1.5"
          >
            <ExternalLink className="h-3 w-3" />
            View
          </Button>
        </Link>
        <Button
          size="sm"
          onClick={() => setModalOpen(true)}
          className="flex-1 h-7 text-[11px] border border-neon-blue/40 bg-neon-blue-tone text-neon-blue hover:bg-neon-blue/20 gap-1.5"
        >
          <Pencil className="h-3 w-3" />
          Update Info
        </Button>
      </div>

      {/* ── Modal ─────────────────────────────────── */}
      <UpdateMetadataModal
        launch={launch}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}