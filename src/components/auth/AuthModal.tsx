'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type AuthStatus = 'idle' | 'signing' | 'verifying' | 'success' | 'error';

interface AuthModalProps {
  isOpen:   boolean;
  status:   AuthStatus;
  error?:   string | null;
  onClose:  () => void;
}

export function AuthModal({ isOpen, status, error, onClose }: AuthModalProps) {

  // ── Auto close on success ──────────────────────────
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  // ── Close on escape ────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'signing' && status !== 'verifying') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status, onClose]);

  if (!isOpen) return null;

  const isBusy = status === 'signing' || status === 'verifying';

  return (
    <>
      {/* ── Backdrop ────────────────────────────────── */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={() => { if (!isBusy) onClose(); }}
      />

      {/* ── Modal ───────────────────────────────────── */}
      <div className={cn(
        'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
        'w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl p-6',
      )}>

        {/* ── Header ──────────────────────────────────── */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-neon-blue" />
            <h2 className="text-sm font-semibold text-foreground">
              Wallet Authentication
            </h2>
          </div>
          {!isBusy && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Content ─────────────────────────────────── */}
        <div className="flex flex-col items-center gap-4 py-2">

          {/* ── Signing ─────────────────────────────── */}
          {status === 'signing' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-neon-blue/30 bg-neon-blue-tone">
                <Loader2 className="h-6 w-6 animate-spin text-neon-blue" />
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-medium text-foreground">
                  Welcome to Exhibition
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                 A Deterministic primary market infrastructure for verifiable enshrined financial system, Sign this gasless signature to confirm wallet ownership.
                </p>
              </div>
            </div>
          )}

          {/* ── Verifying ───────────────────────────── */}
          {status === 'verifying' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-neon-blue/30 bg-neon-blue-tone">
                <Loader2 className="h-6 w-6 animate-spin text-neon-blue" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">Verifying signature...</p>
                <p className="text-xs text-muted-foreground">Almost there</p>
              </div>
            </div>
          )}

          {/* ── Success ─────────────────────────────── */}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">Authenticated</p>
                <p className="text-xs text-green-400">
                  You now have full access to Exhibition
                </p>
              </div>
            </div>
          )}

          {/* ── Error ───────────────────────────────── */}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-4 text-center w-full">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">Authentication Failed</p>
                <p className="text-xs text-destructive">
                  {error ?? 'Signature rejected or verification failed'}
                </p>
              </div>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="w-full border-border text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </Button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}