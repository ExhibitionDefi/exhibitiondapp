'use client';

import { useState, useEffect } from 'react';
import { useProjectMetadata } from '@/hooks/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Globe, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';


interface UpdateMetadataModalProps {
  launch:   Project;
  isOpen:   boolean;
  onClose:  () => void;
}

export function UpdateMetadataModal({ launch, isOpen, onClose }: UpdateMetadataModalProps) {
  const { metadata, isUpdating, updateMetadata } = useProjectMetadata(
    launch.projectId.toString()
  );

  const [website,    setWebsite]    = useState('');
  const [twitter,    setTwitter]    = useState('');
  const [whitepaper, setWhitepaper] = useState('');
  const [overview,   setOverview]   = useState('');

  // ── Seed form with existing metadata ──────────────
  useEffect(() => {
    if (metadata) {
      setWebsite(metadata.website       ?? '');
      setTwitter(metadata.twitter       ?? '');
      setWhitepaper(metadata.whitepaper ?? '');
      setOverview(metadata.overview     ?? '');
    }
  }, [metadata]);

  // ── Close on escape ───────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);
  
  const router = useRouter();

  const handleSubmit = async () => {
    const ok = await updateMetadata({
      website:    website.trim()    || undefined,
      twitter:    twitter.trim()    || undefined,
      whitepaper: whitepaper.trim() || undefined,
      overview:   overview.trim()   || undefined,
    });

    if (ok) {
      toast.success('Launch info updated successfully');
      onClose();
      router.push(`/launches/${launch.projectId}/overview`);
    } else {
      toast.error('Failed to update launch info');
    }
  };

  if (!isOpen) return null;

  const overviewCharsLeft = 1000 - overview.length;

  return (
    <>
      {/* ── Backdrop ────────────────────────────────── */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ── Modal ───────────────────────────────────── */}
      <div className={cn(
        'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
        'w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl',
        'max-h-[90vh] overflow-y-auto',
      )}>

        {/* ── Header ────────────────────────────────── */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold text-foreground">Update Launch Info</h2>
            <p className="text-xs text-muted-foreground">
              {launch.tokenName || launch.tokenSymbol}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Form ────────────────────────────────────── */}
        <div className="flex flex-col gap-4 px-5 py-5">

          {/* Overview */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Overview</Label>
              <span className={cn(
                'text-[10px]',
                overviewCharsLeft < 50 ? 'text-destructive' : 'text-muted-foreground/50'
              )}>
                {overviewCharsLeft} left
              </span>
            </div>
            <textarea
              value={overview}
              onChange={e => setOverview(e.target.value.slice(0, 1000))}
              placeholder="Brief description of your project..."
              rows={4}
              className={cn(
                'w-full resize-none rounded-md border border-border bg-muted/30 px-3 py-2',
                'text-sm text-foreground placeholder:text-muted-foreground/50',
                'focus:outline-none focus:ring-1 focus:ring-neon-blue/50',
              )}
            />
          </div>

          {/* Website */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://yourproject.com"
                className="pl-8 bg-muted/30 border-border text-sm"
              />
            </div>
          </div>

          {/* Twitter / X */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">X / Twitter</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current text-muted-foreground/50" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
                </svg>
              </div>
              <Input
                value={twitter}
                onChange={e => setTwitter(e.target.value)}
                placeholder="https://x.com/yourproject"
                className="pl-8 bg-muted/30 border-border text-sm"
              />
            </div>
          </div>

          {/* Whitepaper */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Whitepaper / Tokenomics</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input
                value={whitepaper}
                onChange={e => setWhitepaper(e.target.value)}
                placeholder="https://docs.yourproject.com"
                className="pl-8 bg-muted/30 border-border text-sm"
              />
            </div>
          </div>

        </div>

        {/* ── Footer ──────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUpdating}
            className="border-border text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="border border-neon-blue/40 bg-neon-blue-tone text-neon-blue hover:bg-neon-blue/20 gap-2"
          >
            {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </>
  );
}