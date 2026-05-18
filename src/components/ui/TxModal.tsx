'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTxExplorerUrl } from '@/lib/formatters';
import toast from 'react-hot-toast';

export type TxStepStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

export interface TxStep {
  label:   string;
  status:  TxStepStatus;
  txHash?: `0x${string}`;
  error?:  string;
}

interface TxModalProps {
  isOpen:      boolean;
  onClose:     () => void;
  title:       string;
  steps:       TxStep[];
  currentStep: number;
}

// ── Clean raw viem/wallet errors into readable messages ───
function parseErrorMessage(error: string): string {
  // User rejection
  if (
    error.includes('User rejected') ||
    error.includes('User denied')   ||
    error.includes('user rejected')
  ) return 'Transaction rejected by user';

  // Viem ContractFunctionExecutionError — extract Details line
  if (error.includes('ContractFunctionExecutionError')) {
    const detailsMatch = error.match(/Details:\s*(.+?)(?:\n|Version:|$)/s);
    if (detailsMatch?.[1]) return detailsMatch[1].trim();
  }

  // Solidity revert reason
  const revertMatch = error.match(/reason:\s*(.+?)(?:\n|$)/);
  if (revertMatch?.[1]) return revertMatch[1].trim();

  // Execution reverted message
  const executionMatch = error.match(/execution reverted:?\s*(.+?)(?:\n|$)/i);
  if (executionMatch?.[1]) return executionMatch[1].trim();

  // Fallback — first line only, no wall of text
  return error.split('\n')[0].trim();
}

export function TxModal({
  isOpen,
  onClose,
  title,
  steps,
  currentStep,
}: TxModalProps) {
  const step = steps[currentStep];

  // ── Auto close on success ─────────────────────────────
  useEffect(() => {
    if (!step) return;
    if (step.status === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step?.status, onClose]);

  // ── Close on escape ───────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step?.status !== 'pending' && step?.status !== 'confirming') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [step?.status, onClose]);

  if (!isOpen || !step) return null;

  const isBusy = step.status === 'pending' || step.status === 'confirming';

  const copyTxHash = () => {
    if (!step.txHash) return;
    navigator.clipboard.writeText(step.txHash);
    toast.success('Tx hash copied');
  };

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────── */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={() => { if (!isBusy) onClose(); }}
      />

      {/* ── Modal ─────────────────────────────────────── */}
      <div className={cn(
        'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
        'w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl',
        'p-6'
      )}>

        {/* ── Title ─────────────────────────────────── */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {!isBusy && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Step indicator (if multi-step) ────────── */}
        {steps.length > 1 && (
          <div className="mb-4 flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                  i < currentStep
                    ? 'bg-neon-blue text-charcoal'
                    : i === currentStep
                    ? 'border-2 border-neon-blue bg-neon-blue-tone text-neon-blue'
                    : 'border border-border bg-muted/30 text-muted-foreground'
                )}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={cn(
                    'h-0.5 w-6',
                    i < currentStep ? 'bg-neon-blue/50' : 'bg-border'
                  )} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Current step content ──────────────────── */}
        <div className="flex flex-col items-center gap-4 py-4">

          {step.status === 'pending' && (
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-neon-blue border-t-transparent" />
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-sm font-medium text-foreground">{step.label}</p>
                <p className="text-xs text-muted-foreground">Confirm in your wallet</p>
              </div>
            </div>
          )}

          {step.status === 'confirming' && (
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-neon-blue/50 border-t-neon-blue" />
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-sm font-medium text-foreground">{step.label}</p>
                <p className="text-xs text-muted-foreground">Transaction confirming on chain...</p>
              </div>
            </div>
          )}

          {step.status === 'success' && (
            <div className="flex flex-col items-center gap-3 w-full">
              <CheckCircle className="h-10 w-10 text-green-400" />
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-sm font-medium text-foreground">{step.label}</p>
                <p className="text-xs text-green-400">
                  {currentStep < steps.length - 1 ? 'Confirmed! Moving to next step...' : 'Transaction successful!'}
                </p>
              </div>

              {step.txHash && (
                <div className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <span className="flex-1 truncate text-[11px] text-muted-foreground font-mono">
                    {step.txHash}
                  </span>
                  <button
                    onClick={copyTxHash}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <a
                    href={getTxExplorerUrl(step.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-neon-blue hover:text-neon-blue/80 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              {currentStep === steps.length - 1 && (
                <p className="text-[11px] text-muted-foreground">
                  Closing automatically...
                </p>
              )}
            </div>
          )}

          {step.status === 'error' && (
            <div className="flex flex-col items-center gap-3 w-full">
              <XCircle className="h-10 w-10 text-destructive" />
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-sm font-medium text-foreground">{step.label}</p>
                <p className="text-xs text-destructive">
                  {step.error ? parseErrorMessage(step.error) : 'Transaction failed'}
                </p>
              </div>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="border-border text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </Button>
            </div>
          )}

          {step.status === 'idle' && (
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-sm font-medium text-foreground">{step.label}</p>
              <p className="text-xs text-muted-foreground">Waiting...</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}