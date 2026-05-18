'use client';

import { useState } from 'react';
import { isAddress } from 'viem';
import type { Address } from 'viem';
import { SafeImage } from '@/components/ui/SafeImage';
import { useTokenList, type TokenInfo } from '@/hooks/contracts/amm';
import { useTokenBalance } from '@/hooks/contracts/tokens';
import { useTokenLogo } from '@/hooks/contracts/tokens';
import { cn } from '@/lib/utils';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TokenSelectorProps {
  selected:   Address | null;
  onChange:   (token: TokenInfo) => void;
  exclude?:   Address;
  className?: string;
}

export function TokenSelector({
  selected,
  onChange,
  exclude,
  className,
}: TokenSelectorProps) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const { tokens }          = useTokenList();

  // ── Selected token metadata ───────────────────────────
  const { symbol: selectedSymbol } = useTokenBalance({
    tokenAddress: selected,
  });
  const selectedLogo = useTokenLogo(selected);

  // ── Custom address detection ──────────────────────────
  const isCustomAddress = isAddress(search) &&
    !tokens.find(t => t.address.toLowerCase() === search.toLowerCase()) &&
    (!exclude || search.toLowerCase() !== exclude.toLowerCase());

  const { symbol: customSymbol, decimals: customDecimals } = useTokenBalance({
    tokenAddress: (isCustomAddress
      ? search
      : '0x0000000000000000000000000000000000000000') as Address,
  });
  const customLogo = useTokenLogo(isCustomAddress ? search as Address : null);

  // ── Filtered list ─────────────────────────────────────
  const filtered = tokens.filter(t => {
    if (exclude && t.address.toLowerCase() === exclude.toLowerCase()) return false;
    if (!search.trim()) return true;
    return t.symbol.toLowerCase().includes(search.toLowerCase()) ||
           t.address.toLowerCase().includes(search.toLowerCase());
  });

  const handleClose = () => { setOpen(false); setSearch(''); };

  const handleSelectCustom = () => {
    if (!isCustomAddress) return;
    onChange({
      address:  search as Address,
      symbol:   customSymbol || '',
      decimals: customDecimals,
      logoURI:  customLogo,
    });
    handleClose();
  };

  return (
    <div className={cn('relative', className)}>
      {/* ── Trigger ───────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2',
          'text-sm font-medium transition-colors hover:border-neon-blue/30 hover:bg-neon-blue-tone/50',
          'min-w-[120px]'
        )}
      >
        {selected ? (
          <>
            <div className="relative h-5 w-5 overflow-hidden rounded-full border border-border shrink-0">
              <SafeImage
                src={selectedLogo}
                alt={selectedSymbol || 'Token'}
                fill
                className="object-cover"
              />
            </div>
            <span className="flex-1 text-left text-foreground">
              {selectedSymbol || selected.slice(0, 6) + '...'}
            </span>
          </>
        ) : (
          <span className="flex-1 text-left text-muted-foreground">Select token</span>
        )}
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>

      {/* ── Dropdown ──────────────────────────────────── */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={handleClose} />
          <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-xl border border-border bg-card shadow-xl">

            {/* Search / address input */}
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search or paste address..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs bg-muted/30 border-border"
                  autoFocus
                />
              </div>
            </div>

            {/* Token list */}
            <div className="max-h-52 overflow-y-auto pb-2">
              {/* Custom address result */}
              {isCustomAddress && (
                <button
                  type="button"
                  onClick={handleSelectCustom}
                  className="flex w-full items-center gap-2.5 px-3 py-2 hover:bg-muted/30 transition-colors"
                >
                  <div className="relative h-6 w-6 overflow-hidden rounded-full border border-border shrink-0">
                    <SafeImage src={customLogo} alt={customSymbol || 'Token'} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col gap-0">
                    <span className="text-xs font-medium text-foreground">
                      {customSymbol || 'Unknown Token'}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {search.slice(0, 6)}...{search.slice(-4)}
                    </span>
                  </div>
                  <span className="text-[10px] text-neon-blue shrink-0">Add</span>
                </button>
              )}

              {/* Regular token list */}
              {filtered.length === 0 && !isCustomAddress ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">No tokens found</p>
              ) : (
                filtered.map(token => (
                  <TokenRow
                    key={token.address}
                    token={token}
                    isSelected={token.address.toLowerCase() === selected?.toLowerCase()}
                    onSelect={() => { onChange(token); handleClose(); }}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Token Row ─────────────────────────────────────────────
function TokenRow({
  token,
  isSelected,
  onSelect,
}: {
  token:      TokenInfo;
  isSelected: boolean;
  onSelect:   () => void;
}) {
  const { balance, symbol, decimals } = useTokenBalance({ tokenAddress: token.address });
  const logoURI                       = useTokenLogo(token.address);

  const displayBalance = balance > 0n && decimals > 0
    ? (Number(balance) / 10 ** decimals).toFixed(4)
    : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors',
        'hover:bg-muted/30',
        isSelected && 'bg-neon-blue-tone'
      )}
    >
      <div className="relative h-6 w-6 overflow-hidden rounded-full border border-border shrink-0">
        <SafeImage src={logoURI} alt={symbol || token.symbol} fill className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-0">
        <span className="text-xs font-medium text-foreground">
          {symbol || token.symbol || 'Unknown'}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">
          {token.address.slice(0, 6)}...{token.address.slice(-4)}
        </span>
      </div>
      {displayBalance && (
        <span className="text-[10px] text-muted-foreground shrink-0">{displayBalance}</span>
      )}
    </button>
  );
}