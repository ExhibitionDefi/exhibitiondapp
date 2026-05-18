'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useAccount, useBlockNumber } from 'wagmi';
import { formatUnits, parseEther } from 'viem';
import { useFaucet } from '@/hooks/contracts/tokens';
import { useExNEXPortal } from '@/hooks/contracts/tokens';
import { useWrapNEX } from '@/hooks/contracts/tokens';
import { useUnwrapNEX } from '@/hooks/contracts/tokens';
import { PageWrapper } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { TxModal, type TxStep } from '@/components/ui/TxModal';
import { formatBlocksRemaining } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Droplets, ArrowLeftRight } from 'lucide-react';
import toast from 'react-hot-toast';

type FaucetTab = 'faucet' | 'portal';
type PortalMode = 'wrap' | 'unwrap';

export default function FaucetPage() {
  const { address, isConnected } = useAccount();
  const { data: currentBlock } = useBlockNumber({ 
    watch: false,
    query: {
      refetchOnMount:       true,
      refetchOnWindowFocus: true,
      refetchInterval:      30_000, // cooldown display — 30s is fine
      staleTime:            30_000,
    }
  });
  const [activeTab, setActiveTab] = useState<FaucetTab>('faucet');

  return (
    <PageWrapper>
      <div className="mx-auto max-w-lg">

        {/* ── Page Header ──────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Faucet
          </h1>
          <p className="text-sm text-muted-foreground">
            Request testnet tokens or wrap/unwrap exNEX.
          </p>
        </div>

        {/* ── Tabs ─────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setActiveTab('faucet')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'faucet'
                ? 'bg-neon-blue-tone text-neon-blue'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Droplets className="h-4 w-4" />
            Faucet
          </button>
          <button
            onClick={() => setActiveTab('portal')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'portal'
                ? 'bg-neon-blue-tone text-neon-blue'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ArrowLeftRight className="h-4 w-4" />
            exNEX Portal
          </button>
        </div>

        {/* ── Content ──────────────────────────────────── */}
        {!isConnected ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to continue
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'faucet' && (
              <FaucetPanel currentBlock={currentBlock} />
            )}
            {activeTab === 'portal' && (
              <ExNEXPortal />
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}

// ── Faucet Panel ──────────────────────────────────────────
function FaucetPanel({ currentBlock }: { currentBlock: bigint | undefined }) {
  const [txModalOpen, setTxModalOpen] = useState(false);

  const { request, settings, isSuccess, isPending, isConfirming, isError, error, reset, txHash } = useFaucet(currentBlock);

  const txSteps: TxStep[] = [{
    label:  'Request Tokens',
    status: isPending    ? 'pending'
          : isConfirming ? 'confirming'
          : isSuccess    ? 'success'
          : isError      ? 'error'
          : 'idle',
    txHash: isSuccess ? txHash : undefined,
    error:  isError ? error ?? undefined : undefined,
  }];

  useEffect(() => {
    if (isSuccess) {
      reset();
      setTxModalOpen(false);
    }
  }, [isSuccess, reset]);

  useEffect(() => {
    if (isError) {
      toast.error(error ?? 'Request failed');
      reset();
    }
  }, [isError, error, reset]);

  const handleRequest = async () => {
    setTxModalOpen(true);
    const result = await request();
   if (result === 'rejected') setTxModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-foreground">Request Testnet Tokens</h2>
        <p className="text-xs text-muted-foreground">
          Receive EXH and USDX tokens for testing.
        </p>
      </div>

      {/* ── Token amounts ─────────────────────────────── */}
      {settings ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-0.5 rounded-lg bg-muted/30 px-3 py-2.5">
            <span className="text-[11px] text-muted-foreground">EXH Amount</span>
            <span className="text-sm font-medium text-foreground">
              {formatUnits(settings.amountEXH, 18)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-lg bg-muted/30 px-3 py-2.5">
            <span className="text-[11px] text-muted-foreground">USDX Amount</span>
            <span className="text-sm font-medium text-foreground">
              {formatUnits(settings.amountUSDX, 6)}
            </span>
          </div>
        </div>
      ) : (
        <Skeleton className="h-16 rounded-lg" />
      )}

      {/* ── Cooldown ──────────────────────────────────── */}
      {settings && !settings.canRequest && settings.blocksUntilNext > 0n && (
        <div className="flex items-center justify-between rounded-lg border border-neon-orange/20 bg-neon-orange-tone px-3 py-2.5 text-xs">
          <span className="text-neon-orange">Next request available in</span>
          <span className="font-medium text-neon-orange">
            {formatBlocksRemaining(settings.blocksUntilNext)}
          </span>
        </div>
      )}

      {/* ── Request Button ────────────────────────────── */}
      <Button
        onClick={handleRequest}
        disabled={!settings?.canRequest || isPending || isConfirming}
        className={cn(
          'w-full border border-neon-blue/40 bg-neon-blue-tone text-neon-blue',
          'hover:bg-neon-blue/20 disabled:opacity-50'
        )}
      >
        {isPending || isConfirming ? 'Requesting...' : 'Request Tokens'}
      </Button>

      <TxModal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        title="Faucet Request"
        steps={txSteps}
        currentStep={0}
      />
    </div>
  );
}

// ── exNEX Portal ──────────────────────────────────────────
function ExNEXPortal() {
  const [mode, setMode]           = useState<PortalMode>('wrap');
  const [amount, setAmount]       = useState('');
  const [txModalOpen, setTxModalOpen] = useState(false);

  const {
    nexBalance,
    exNEXBalance,
    totalSupply,
    isLoading,
    refetch,
  } = useExNEXPortal();

  const {
    wrap,
    isSuccess:    isWrapSuccess,
    isPending:    isWrapPending,
    isConfirming: isWrapConfirming,
    isError:      isWrapError,
    error:        wrapError,
    txHash:       wrapTxHash,
    reset:        resetWrap,
  } = useWrapNEX();

  const {
    unwrap,
    isSuccess:    isUnwrapSuccess,
    isPending:    isUnwrapPending,
    isConfirming: isUnwrapConfirming,
    isError:      isUnwrapError,
    error:        unwrapError,
    txHash:       unwrapTxHash,
    reset:        resetUnwrap,
  } = useUnwrapNEX();

  const isSuccess    = mode === 'wrap' ? isWrapSuccess    : isUnwrapSuccess;
  const isPending    = mode === 'wrap' ? isWrapPending    : isUnwrapPending;
  const isConfirming = mode === 'wrap' ? isWrapConfirming : isUnwrapConfirming;
  const isError      = mode === 'wrap' ? isWrapError      : isUnwrapError;
  const error        = mode === 'wrap' ? wrapError        : unwrapError;
  const txHash       = mode === 'wrap' ? wrapTxHash       : unwrapTxHash;
  const reset        = mode === 'wrap' ? resetWrap        : resetUnwrap;

  const parsedAmount = amount ? parseEther(amount) : 0n;
  const maxBalance   = mode === 'wrap' ? nexBalance : exNEXBalance;
  const isInvalid    = !amount || parsedAmount === 0n || parsedAmount > maxBalance;

  const txSteps: TxStep[] = [{
    label:  mode === 'wrap' ? 'Wrap NEX → exNEX' : 'Unwrap exNEX → NEX',
    status: isPending    ? 'pending'
          : isConfirming ? 'confirming'
          : isSuccess    ? 'success'
          : isError      ? 'error'
          : 'idle',
    txHash: isSuccess ? txHash : undefined,
    error:  isError ? error ?? undefined : undefined,
  }];

  useEffect(() => {
    if (isSuccess) {
      setAmount('');
      reset();
      refetch();
      setTxModalOpen(false);
    }
  }, [isSuccess, reset, refetch]);

  useEffect(() => {
    if (isError) {
      toast.error(error ?? 'Transaction failed');
      reset();
    }
  }, [isError, error, reset]);

  const handleAction = async () => {
    if (isInvalid) return;
    setTxModalOpen(true);
    const fn = mode === 'wrap' ? wrap : unwrap;
    const result = await fn(parsedAmount);
    if (result === 'rejected') setTxModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-foreground">exNEX Portal</h2>
        <p className="text-xs text-muted-foreground">
          Wrap native NEX into exNEX or unwrap back to NEX.
        </p>
      </div>

      {/* ── Balances ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/30 px-3 py-2.5">
          <span className="text-[11px] text-muted-foreground">NEX Balance</span>
          <span className="text-xs font-medium text-foreground">
            {isLoading ? '...' : Number(formatUnits(nexBalance, 18)).toFixed(4)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/30 px-3 py-2.5">
          <span className="text-[11px] text-muted-foreground">exNEX Balance</span>
          <span className="text-xs font-medium text-foreground">
            {isLoading ? '...' : Number(formatUnits(exNEXBalance, 18)).toFixed(4)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-muted/30 px-3 py-2.5">
          <span className="text-[11px] text-muted-foreground">Total Supply</span>
          <span className="text-xs font-medium text-foreground">
            {isLoading ? '...' : Number(formatUnits(totalSupply, 18)).toFixed(2)}
          </span>
        </div>
      </div>

      {/* ── Mode Toggle ───────────────────────────────── */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/20 p-1">
        <button
          onClick={() => { setMode('wrap'); setAmount(''); }}
          className={cn(
            'flex flex-1 items-center justify-center rounded-md py-2 text-xs font-medium transition-colors',
            mode === 'wrap'
              ? 'bg-neon-blue-tone text-neon-blue'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Wrap NEX → exNEX
        </button>
        <button
          onClick={() => { setMode('unwrap'); setAmount(''); }}
          className={cn(
            'flex flex-1 items-center justify-center rounded-md py-2 text-xs font-medium transition-colors',
            mode === 'unwrap'
              ? 'bg-neon-blue-tone text-neon-blue'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Unwrap exNEX → NEX
        </button>
      </div>

      {/* ── Amount Input ──────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Amount</Label>
          <button
            onClick={() => setAmount(formatUnits(maxBalance, 18))}
            className="text-[11px] text-neon-blue hover:underline"
          >
            Max: {Number(formatUnits(maxBalance, 18)).toFixed(4)} {mode === 'wrap' ? 'NEX' : 'exNEX'}
          </button>
        </div>
        <div className="relative">
          <Input
            type="number"
            placeholder="0.0000"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            disabled={isPending || isConfirming}
            className={cn(
              'pr-16 bg-muted/30 border-border text-sm',
              isInvalid && amount ? 'border-destructive' : ''
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {mode === 'wrap' ? 'NEX' : 'exNEX'}
          </span>
        </div>
        {parsedAmount > maxBalance && amount && (
          <p className="text-[11px] text-destructive">Insufficient balance</p>
        )}
      </div>

      {/* ── Action Button ─────────────────────────────── */}
      <Button
        onClick={handleAction}
        disabled={isInvalid || isPending || isConfirming}
        className={cn(
          'w-full border border-neon-blue/40 bg-neon-blue-tone text-neon-blue',
          'hover:bg-neon-blue/20 disabled:opacity-50'
        )}
      >
        {isPending || isConfirming
          ? mode === 'wrap' ? 'Wrapping...' : 'Unwrapping...'
          : mode === 'wrap' ? 'Wrap NEX' : 'Unwrap exNEX'
        }
      </Button>

      <TxModal
        isOpen={txModalOpen}
        onClose={() => { if (!isPending && !isConfirming) setTxModalOpen(false); }}
        title={mode === 'wrap' ? 'Wrap NEX' : 'Unwrap exNEX'}
        steps={txSteps}
        currentStep={0}
      />
    </div>
  );
}