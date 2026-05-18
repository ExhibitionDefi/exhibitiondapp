'use client';

import { useAccount, useBlockNumber } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import type { Address } from 'viem';
import { useSwap, useSwapQuote, useLocalPricing } from '@/hooks/contracts/amm';
import { useApprove, useTokenApproval, useTokenBalance } from '@/hooks/contracts/tokens';
import { TokenSelector } from '@/components/amm/TokenSelector';
import { PriceDisplay } from '@/components/amm/PriceDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TxModal, type TxStep } from '@/components/ui/TxModal';
import { CONTRACTS } from '@/lib/contracts';
import { cn } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react';
import type { TokenInfo } from '@/hooks/contracts/amm';
import { useCallback, useState, useEffect, useRef } from 'react';

const DEADLINE_BLOCKS  = 300n;
const DEFAULT_TOKEN_IN = process.env.NEXT_PUBLIC_NEXUS_USD_ADDRESS! as Address;

// ── Flow phase ─────────────────────────────────────────────
type FlowPhase = 'idle' | 'approving' | 'swapping' | 'done' | 'error';

interface SwapPanelProps {
  initialTokenIn?:  Address;
  initialTokenOut?: Address;
}

export function SwapPanel({
  initialTokenIn  = DEFAULT_TOKEN_IN,
  initialTokenOut,
}: SwapPanelProps) {
  const { address }            = useAccount();
  const { refetch: refetchBlock } = useBlockNumber({ 
    watch: false,
    query: {
      refetchOnMount:       true,  
      refetchOnWindowFocus: true,
      staleTime:            10_000,
    } 
  });

  const [tokenIn,  setTokenIn]  = useState<Address>(initialTokenIn);
  const [tokenOut, setTokenOut] = useState<Address | null>(initialTokenOut ?? null);
  const [amountIn, setAmountIn] = useState('');

  // ── Flow-phase state machine ──────────────────────────────
  const [phase,         setPhase]         = useState<FlowPhase>('idle');
  const [txCurrentStep, setTxCurrentStep] = useState(0);
  // Snapshot whether this flow started needing approval — prevents
  // the step array collapsing when refetchAllowance flips needsApproval.
  const flowIsApprove = useRef(false);

  const { balance: balanceIn,  decimals: decimalsIn,  symbol: symbolIn  } = useTokenBalance({ tokenAddress: tokenIn  });
  const { balance: balanceOut, decimals: decimalsOut, symbol: symbolOut } = useTokenBalance({ tokenAddress: tokenOut });

  const { getTokenPrice } = useLocalPricing();

  const parsedAmountIn = amountIn && !isNaN(Number(amountIn))
    ? parseUnits(amountIn, decimalsIn)
    : 0n;

  // ── USD values ────────────────────────────────────────────
  const priceIn  = getTokenPrice(tokenIn);
  const priceOut = tokenOut ? getTokenPrice(tokenOut) : null;

  const inputUSD = parsedAmountIn > 0n && priceIn !== null
    ? (Number(formatUnits(parsedAmountIn, decimalsIn)) * priceIn).toFixed(2)
    : null;

  // ── Swap quote ────────────────────────────────────────────
  const { quote, isLoading: isLoadingQuote } = useSwapQuote({
    tokenIn,
    tokenOut:  tokenOut ?? tokenIn,
    amountIn:  parsedAmountIn,
  });
  const tradingFeeBps = quote?.tradingFeeBps ?? 30n;

  const outputUSD = quote?.amountOut && quote.amountOut > 0n && priceOut !== null
    ? (Number(formatUnits(quote.amountOut, decimalsOut)) * priceOut).toFixed(2)
    : null;

  // ── Allowance ─────────────────────────────────────────────
  const { allowance, refetch: refetchAllowance } = useTokenApproval({
    tokenAddress:   tokenIn,
    spenderAddress: CONTRACTS.ExhibitionAMM.address,
    requiredAmount: parsedAmountIn,
  });

  const needsApproval = allowance < parsedAmountIn && parsedAmountIn > 0n;

  // ── Approve hook ──────────────────────────────────────────
  const {
    approve,
    isSuccess:    isApproveSuccess,
    isPending:    isApprovePending,
    isConfirming: isApproveConfirming,
    isError:      isApproveError,
    error:        approveError,
    txHash:       approveTxHash,
  } = useApprove({ tokenAddress: tokenIn, spenderAddress: CONTRACTS.ExhibitionAMM.address });

  // ── Swap hook ─────────────────────────────────────────────
  const {
    swap,
    isSuccess:    isSwapSuccess,
    isPending:    isSwapPending,
    isConfirming: isSwapConfirming,
    isError:      isSwapError,
    error:        swapError,
    txHash:       swapTxHash,
    reset:        resetSwap,
  } = useSwap();

  // Extract as a stable helper above the effects
  const getMinAmountOut = useCallback((amountOut: bigint, priceImpactNum: number) => {
    const slippageTolerance = Math.min(Math.ceil(priceImpactNum) + 1, 15);
    const slippageBps       = BigInt(Math.round(slippageTolerance * 100));
    return (amountOut * (10000n - slippageBps)) / 10000n;
  }, []);

  // ── Sync hook flags → phase ───────────────────────────────

  // Approve succeeded → advance step and fire swap
  useEffect(() => {
    if (!isApproveSuccess || phase !== 'approving') return;
    setTxCurrentStep(1);
    setPhase('swapping');
    refetchAllowance();
    if (!tokenOut) return;
    void (async () => {
      const { data: freshBlock } = await refetchBlock();
      if (!freshBlock) return;
      const result = await swap({
        tokenIn, 
        tokenOut,
        amountIn:     parsedAmountIn,
        minAmountOut: quote ? getMinAmountOut(quote.amountOut, quote.priceImpactNum) : 0n,
        deadline:     freshBlock + DEADLINE_BLOCKS,
      })
      if (result === 'rejected') setPhase('idle');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproveSuccess]);

  // Approve errored
  useEffect(() => {
    if (isApproveError && phase === 'approving') setPhase('error');
  }, [isApproveError, phase]);

  // Swap succeeded — set phase to done, clear input.
  // Do NOT call resetSwap() here; that wipes txHash before the modal's
  // 3 s auto-close finishes showing the explorer link.
  // resetSwap is called in handleModalClose instead.
  useEffect(() => {
    if (!isSwapSuccess || phase !== 'swapping') return;
    setPhase('done');
    setAmountIn('');
  }, [isSwapSuccess, phase]);

  // Swap errored
  useEffect(() => {
    if (isSwapError && phase === 'swapping') setPhase('error');
  }, [isSwapError, phase]);

  // ── Build TxModal steps ───────────────────────────────────
  // Status is driven by `phase` (not raw wagmi flags) so `done` always
  // maps to `success` regardless of whether isSwapConfirming is still true.
  const txSteps: TxStep[] = flowIsApprove.current
    ? [
        {
          label:  `Approve ${symbolIn}`,
          status:
            phase === 'approving' && isApprovePending    ? 'pending'
          : phase === 'approving' && isApproveConfirming ? 'confirming'
          : phase === 'error'     && txCurrentStep === 0 ? 'error'
          : (phase === 'swapping' || phase === 'done')   ? 'success'
          : 'idle',
          txHash: approveTxHash ?? undefined,
          error:  phase === 'error' && txCurrentStep === 0
                    ? approveError ?? undefined : undefined,
        },
        {
          label:  `Swap ${symbolIn} → ${symbolOut}`,
          status:
            phase === 'swapping' && isSwapPending    ? 'pending'
          : phase === 'swapping' && isSwapConfirming ? 'confirming'
          : phase === 'done'                         ? 'success'
          : phase === 'error' && txCurrentStep === 1 ? 'error'
          : 'idle',
          txHash: swapTxHash ?? undefined,
          error:  phase === 'error' && txCurrentStep === 1
                    ? swapError ?? undefined : undefined,
        },
      ]
    : [
        {
          label:  `Swap ${symbolIn} → ${symbolOut}`,
          status:
            phase === 'swapping' && isSwapPending    ? 'pending'
          : phase === 'swapping' && isSwapConfirming ? 'confirming'
          : phase === 'done'                         ? 'success'
          : phase === 'error'                        ? 'error'
          : 'idle',
          txHash: swapTxHash ?? undefined,
          error:  phase === 'error' ? swapError ?? undefined : undefined,
        },
      ];
      
  // ── Derived ───────────────────────────────────────────────
  const isInsufficient = parsedAmountIn > balanceIn;
  const isInvalid      = !amountIn || parsedAmountIn === 0n || isInsufficient || !tokenOut;
  const isLoading      = phase === 'approving' || phase === 'swapping';
  const txModalOpen    = phase !== 'idle';

  // ── Handlers ──────────────────────────────────────────────
  const handleSwitch = () => {
    if (!tokenOut) return;
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn('');
  };

  const handleSwap = async () => {
    if (!address || !tokenOut || !quote) return;
    flowIsApprove.current = needsApproval;
    setTxCurrentStep(0);

    if (needsApproval) {
      setPhase('approving');
      const result = await approve(parsedAmountIn);
      if (result === 'rejected') setPhase('idle');
    } else {
      setPhase('swapping');
      const { data: freshBlock } = await refetchBlock();
      if (!freshBlock) return;
      const result = await swap({
        tokenIn,
        tokenOut,
        amountIn:     parsedAmountIn,
        minAmountOut: quote ? getMinAmountOut(quote.amountOut, quote.priceImpactNum) : 0n,
        deadline:     freshBlock + DEADLINE_BLOCKS,
      })
      if (result === 'rejected') setPhase('idle');
    }
  };

  // resetSwap deferred here so txHash stays alive for the full
  // 3 s auto-close success display inside the modal.
  const handleModalClose = () => {
    if (isLoading) return;
    setPhase('idle');
    setTxCurrentStep(0);
    flowIsApprove.current = false;
    resetSwap();
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">

      {/* ── Token In ──────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 rounded-xl bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">You pay</span>
          <button
            onClick={() => setAmountIn(formatUnits(balanceIn, decimalsIn))}
            className="text-[11px] text-neon-blue hover:underline"
          >
            Balance: {Number(formatUnits(balanceIn, decimalsIn)).toFixed(4)}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-1 flex-col">
            <Input
              type="number"
              placeholder="0.0"
              value={amountIn}
              onChange={e => setAmountIn(e.target.value)}
              className="border-0 bg-transparent text-xl font-medium p-0 h-auto focus-visible:ring-0"
            />
            {inputUSD && (
              <span className="text-[11px] text-muted-foreground">${inputUSD}</span>
            )}
          </div>
          <TokenSelector
            selected={tokenIn}
            exclude={tokenOut ?? undefined}
            onChange={(t: TokenInfo) => { setTokenIn(t.address); setAmountIn(''); }}
          />
        </div>
      </div>

      {/* ── Switch ────────────────────────────────────── */}
      <div className="flex justify-center">
        <button
          onClick={handleSwitch}
          disabled={!tokenOut}
          className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>

      {/* ── Token Out ─────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 rounded-xl bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">You receive</span>
          {tokenOut && (
            <span className="text-[11px] text-muted-foreground">
              Balance: {Number(formatUnits(balanceOut, decimalsOut)).toFixed(4)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-1 flex-col">
            {!tokenOut ? (
              <span className="text-base text-muted-foreground">—</span>
            ) : isLoadingQuote ? (
              <span className="text-base text-muted-foreground animate-pulse">Fetching...</span>
            ) : quote ? (
              <>
                <span className="text-xl font-medium text-foreground">
                  {Number(formatUnits(quote.amountOut, decimalsOut)).toFixed(6)}
                </span>
                {outputUSD && (
                  <span className="text-[11px] text-muted-foreground">${outputUSD}</span>
                )}
              </>
            ) : (
              <span className="text-xl font-medium text-muted-foreground">0.0</span>
            )}
          </div>
          <TokenSelector
            selected={tokenOut}
            exclude={tokenIn}
            onChange={(t: TokenInfo) => setTokenOut(t.address)}
          />
        </div>
      </div>

      {/* ── Price display ─────────────────────────────── */}
      {tokenIn && tokenOut && tokenIn !== tokenOut && (
        <PriceDisplay tokenIn={tokenIn} tokenOut={tokenOut} />
      )}

      {/* ── Quote details ─────────────────────────────── */}
      {quote && parsedAmountIn > 0n && tokenOut && (() => {
        const slippageTolerance = Math.min(Math.ceil(quote.priceImpactNum) + 1, 15);
        const slippageBps       = BigInt(Math.round(slippageTolerance * 100));
        const minAmountOut      = (quote.amountOut * (10000n - slippageBps)) / 10000n;

        return (
          <div className="flex flex-col gap-1 rounded-lg bg-muted/20 px-3 py-2 text-[11px]">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Price Impact</span>
              <span className={cn(
                quote.priceImpactNum > 15 ? 'text-destructive' :
                quote.priceImpactNum > 5  ? 'text-neon-orange' :
                'text-green-400'
              )}>
                {quote.priceImpact}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Fee ({(Number(tradingFeeBps) / 100).toFixed(2)}%)</span>
              <span className="text-foreground">
                {quote.fee !== '0' && quote.fee !== ''
                  ? `${Number(formatUnits(BigInt(quote.fee), decimalsIn)).toFixed(6)} ${symbolIn}`
                  : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Min Received ({slippageTolerance}% slippage)</span>
              <span className="text-foreground">
                {Number(formatUnits(minAmountOut, decimalsOut)).toFixed(6)} {symbolOut}
              </span>
            </div>
          </div>
        );
      })()}

      {isInsufficient && amountIn && (
        <p className="text-[11px] text-destructive px-1">Insufficient {symbolIn} balance</p>
      )}

      {!address ? (
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-3 text-center text-sm text-muted-foreground">
          Connect wallet to swap
        </div>
      ) : (
        <Button
          onClick={handleSwap}
          disabled={isInvalid || isLoading}
          className="w-full border border-neon-blue/40 bg-neon-blue-tone text-neon-blue hover:bg-neon-blue/20 disabled:opacity-50"
        >
          {!tokenOut        ? 'Select a token'   :
           needsApproval    ? 'Approve & Swap'   : 'Swap'}
        </Button>
      )}

      <TxModal
        isOpen={txModalOpen}
        onClose={handleModalClose}
        title="Swap Tokens"
        steps={txSteps}
        currentStep={txCurrentStep}
      />
    </div>
  );
}