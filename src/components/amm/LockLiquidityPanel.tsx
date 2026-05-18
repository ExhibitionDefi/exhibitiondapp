'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount, useBlockNumber } from 'wagmi';
import { formatUnits } from 'viem';
import type { Address } from 'viem';
import { useLockLiquidity, useLiquidityLock, useLPBalance} from '@/hooks/contracts/amm';
import { TokenSelector } from '@/components/amm/TokenSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TxModal, type TxStep } from '@/components/ui/TxModal';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import type { TokenInfo } from '@/hooks/contracts/amm';

const BLOCKS_PER_DAY = 86400n;

type FlowPhase = 'idle' | 'locking' | 'done' | 'error';

interface LockLiquidityPanelProps {
  initialTokenA?: Address;
  initialTokenB?: Address;
}

export function LockLiquidityPanel({
  initialTokenA,
  initialTokenB,
}: LockLiquidityPanelProps) {
  const { address }            = useAccount();
  const { data: currentBlock } = useBlockNumber({ 
    watch: false,
    query: {
      refetchOnMount:       true,  
      refetchOnWindowFocus: true,
      staleTime:            30_000,
    } 
  });

  const [tokenA, setTokenA] = useState<Address | null>(initialTokenA ?? null);
  const [tokenB, setTokenB] = useState<Address | null>(initialTokenB ?? null);
  const [lpAmount,  setLpAmount]  = useState('');
  const [durationDays, setDurationDays] = useState('');

  const [phase,         setPhase]         = useState<FlowPhase>('idle');
  const [txCurrentStep, setTxCurrentStep] = useState(0);
  const flowStarted = useRef(false);

  // ── LP balance ────────────────────────────────────────────
  const { lpBalance: lpBalanceForPair, refetch: refetchLPBalance } = useLPBalance(
    tokenA ?? '0x',
    tokenB ?? '0x'
  );

  // ── Lock state ────────────────────────────────────────────
  const { lock } = useLiquidityLock(
    tokenA ?? '0x',
    tokenB ?? '0x',
    address
  );

  // ── Lock hook ─────────────────────────────────────────────
  const {
    lockLiquidity,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
    reset,
  } = useLockLiquidity();

  // ── Derived ───────────────────────────────────────────────
  const parsedAmount = lpAmount && !isNaN(Number(lpAmount))
    ? BigInt(Math.floor(Number(lpAmount) * 1e18))
    : 0n;

  const durationBlocks = durationDays && !isNaN(Number(durationDays))
    ? BigInt(Math.floor(Number(durationDays))) * BLOCKS_PER_DAY
    : 0n;

  const hasActiveLock  = !!lock && lock.isUnlocked === false;
  const isInvalid      =
    !tokenA ||
    !tokenB ||
    parsedAmount === 0n ||
    durationBlocks === 0n ||
    hasActiveLock;
  const isLoading = phase === 'locking';
  const txModalOpen = phase !== 'idle';


  // ── Sync hook flags → phase ───────────────────────────────
  useEffect(() => {
    if (!isSuccess || phase !== 'locking') return;
    setPhase('done');
    setLpAmount('');
    setDurationDays('');
    refetchLPBalance();
  }, [isSuccess, phase]);

  useEffect(() => {
    if (isError && phase === 'locking') setPhase('error');
  }, [isError, phase]);

  // ── TxModal steps ─────────────────────────────────────────
  const txSteps: TxStep[] = [
    {
      label:  'Lock LP Tokens',
      status:
        phase === 'locking' && isPending    ? 'pending'
      : phase === 'locking' && isConfirming ? 'confirming'
      : phase === 'done'                    ? 'success'
      : phase === 'error'                   ? 'error'
      : 'idle',
      txHash: txHash ?? undefined,
      error:  phase === 'error' ? error ?? undefined : undefined,
    },
  ];

  // ── Handlers ──────────────────────────────────────────────
  const handleLock = async () => {
    if (!address || !tokenA || !tokenB) return;
    flowStarted.current = true;
    setTxCurrentStep(0);
    setPhase('locking');
    const result = await lockLiquidity({
      tokenA, 
      tokenB, 
      lpAmount: parsedAmount, 
      lockDurationBlocks: durationBlocks 
    });
    if (result === 'rejected') setPhase('idle');
  };
 
  const handleModalClose = () => {
    if (isLoading) return;
    setPhase('idle');
    setTxCurrentStep(0);
    flowStarted.current = false;
    reset();
  };


  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-border bg-card p-4">

      {/* ── Active lock warning ───────────────────────────── */}
      {hasActiveLock && lock && (
        <div className="rounded-xl border border-neon-orange/30 bg-neon-orange/5 px-3 py-2.5">
          <p className="text-xs font-medium text-neon-orange">Active Lock</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {formatUnits(lock.amount, 18)} LP locked · unlocks {lock.unlockDateDisplay}
          </p>
        </div>
      )}

      {/* ── Token A ──────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 rounded-xl bg-muted/20 p-3">
        <span className="text-xs text-muted-foreground">Token A</span>
        <TokenSelector
          selected={tokenA}
          exclude={tokenB ?? undefined}
          onChange={(t: TokenInfo) => setTokenA(t.address)}
        />
      </div>

      {/* ── Token B ──────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 rounded-xl bg-muted/20 p-3">
        <span className="text-xs text-muted-foreground">Token B</span>
        <TokenSelector
          selected={tokenB}
          exclude={tokenA ?? undefined}
          onChange={(t: TokenInfo) => setTokenB(t.address)}
        />
      </div>

      {/* ── LP Amount ────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 rounded-xl bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">LP Amount to Lock</span>
          {lpBalanceForPair > 0n && (
            <button
              onClick={() => setLpAmount(formatUnits(lpBalanceForPair, 18))}
              className="text-[11px] text-neon-blue hover:underline"
            >
              Max: {Number(formatUnits(lpBalanceForPair, 18)).toFixed(6)}
            </button>
          )}
        </div>
        <Input
          type="number"
          placeholder="0.0"
          value={lpAmount}
          onChange={e => setLpAmount(e.target.value)}
          className="border-0 bg-transparent text-xl font-medium p-0 h-auto focus-visible:ring-0"
        />
      </div>

      {/* ── Lock Duration ────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 rounded-xl bg-muted/20 p-3">
        <span className="text-xs text-muted-foreground">Lock Duration (days)</span>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="30"
            value={durationDays}
            onChange={e => setDurationDays(e.target.value)}
            className="border-0 bg-transparent text-xl font-medium p-0 h-auto focus-visible:ring-0"
          />
          {durationBlocks > 0n && (
            <span className="text-[11px] text-muted-foreground shrink-0">
              ≈ {durationBlocks.toString()} blocks
            </span>
          )}
        </div>
        {/* ── Quick select ──────────────────────────────── */}
        <div className="flex gap-1.5 mt-1">
          {[30, 90, 180, 365].map(d => (
            <button
              key={d}
              onClick={() => setDurationDays(String(d))}
              className={cn(
                'rounded-md px-2 py-0.5 text-[11px] border transition-colors',
                durationDays === String(d)
                  ? 'border-neon-blue bg-neon-blue-tone text-neon-blue'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* ── Lock summary ─────────────────────────────────── */}
      {parsedAmount > 0n && durationBlocks > 0n && (
        <div className="flex flex-col gap-1 rounded-lg bg-muted/20 px-3 py-2 text-[11px]">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Amount</span>
            <span className="text-foreground">{Number(lpAmount).toFixed(6)} LP</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Duration</span>
            <span className="text-foreground">{durationDays} days</span>
          </div>
          {currentBlock && (
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Unlock block</span>
              <span className="text-foreground">
                #{(currentBlock + durationBlocks).toString()}
              </span>
            </div>
          )}
          <div className="mt-1 rounded-md border border-neon-orange/20 bg-neon-orange/5 px-2 py-1 text-[11px] text-neon-orange">
            ⚠ Lock is irreversible — no early withdrawal
          </div>
        </div>
      )}

      {!address ? (
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-3 text-center text-sm text-muted-foreground">
          Connect wallet to lock liquidity
        </div>
      ) : (
        <Button
          onClick={handleLock}
          disabled={isInvalid || isLoading}
          className="w-full border border-neon-blue/40 bg-neon-blue-tone text-neon-blue hover:bg-neon-blue/20 disabled:opacity-50"
        >
          <Lock className="mr-2 h-4 w-4" />
          {hasActiveLock ? 'Lock Already Active' : 'Lock Liquidity'}
        </Button>
      )}

      <TxModal
        isOpen={txModalOpen}
        onClose={handleModalClose}
        title="Lock Liquidity"
        steps={txSteps}
        currentStep={txCurrentStep}
      />
    </div>
  );
}