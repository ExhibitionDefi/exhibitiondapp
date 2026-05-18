'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { wizardActions } from '@/hooks/wizard';
import { formatAddress, getAddressExplorerUrl } from '@/lib/formatters';
import { Menu, X, Copy, ExternalLink, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const NAV_LINKS = [
  { label: 'Launches',  href: '/launches'  },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Faucet',    href: '/faucet'    },
];

const AMM_LINKS = [
  { label: 'Swap',      href: '/amm/swap',      desc: 'Trade tokens instantly'     },
  { label: 'Liquidity', href: '/amm/liquidity',  desc: 'Add or remove liquidity'    },
  { label: 'Pools',     href: '/amm/pools',      desc: 'Browse all liquidity pools' },
  { label: 'Lock Liquidity', href: '/amm/lockLiquidity', desc: 'Lock your LP tokens' }
];

export function Navbar() {
  const pathname                      = usePathname();
  const router                        = useRouter();
  const { address, isConnected }      = useAccount();
  const { disconnect }                = useDisconnect();
  const [menuOpen, setMenuOpen]       = useState(false);
  const [ammMenuOpen, setAmmMenuOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast.success('Address copied');
  };

  const handleDisconnect = () => {
    disconnect();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-charcoal/95 backdrop-blur-md">

      {/* ── Top accent line ───────────────────────────── */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-neon-blue/40 to-transparent" />

      <div className="flex h-14 w-full items-center justify-between px-6">

        {/* ── Brand ─────────────────────────────────────── */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/A_EXH_LOGO.svg"
              alt="Exhibition"
              width={36}
              height={36}
              priority
            />
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              Exhibition
            </span>
            <span className="rounded-sm border border-neon-blue/40 bg-neon-blue/10 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-neon-blue uppercase">
              Testnet
            </span>
          </Link>

          {/* ── Divider ─────────────────────────────────── */}
          <div className="hidden h-5 w-px bg-border/60 md:block" />

          {/* ── Desktop Nav ─────────────────────────────── */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors',
                  pathname === href
                    ? 'text-neon-blue'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
                {pathname === href && (
                  <span className="absolute bottom-0 left-1/2 h-px w-4 -translate-x-1/2 bg-neon-blue rounded-full" />
                )}
              </Link>
            ))}

            {/* ── AMM Dropdown ──────────────────────────── */}
            <div
              className="relative"
              onMouseEnter={() => setAmmMenuOpen(true)}
              onMouseLeave={() => setAmmMenuOpen(false)}
            >
              <button className={cn(
                'relative flex items-center gap-1 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors',
                pathname.startsWith('/amm')
                  ? 'text-neon-blue'
                  : 'text-muted-foreground hover:text-foreground'
              )}>
                AMM
                <ChevronDown className={cn(
                  'h-3 w-3 transition-transform duration-200',
                  ammMenuOpen && 'rotate-180'
                )} />
                {pathname.startsWith('/amm') && (
                  <span className="absolute bottom-0 left-1/2 h-px w-4 -translate-x-1/2 bg-neon-blue rounded-full" />
                )}
              </button>

              {ammMenuOpen && (
                <div className="absolute left-0 top-full z-20 mt-1 w-52 rounded-xl border border-border/80 bg-card shadow-xl shadow-black/20 overflow-hidden">
                  <div className="p-1">
                    {AMM_LINKS.map(({ label, href, desc }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setAmmMenuOpen(false)}
                        className={cn(
                          'flex flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-colors',
                          pathname === href
                            ? 'bg-neon-blue-tone'
                            : 'hover:bg-muted/40'
                        )}
                      >
                        <span className={cn(
                          'text-[13px] font-medium',
                          pathname === href ? 'text-neon-blue' : 'text-foreground'
                        )}>
                          {label}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* ── Desktop Actions ────────────────────────────── */}
        <div className="hidden items-center gap-2.5 md:flex">
          <Button
            size="sm"
            onClick={wizardActions.open}
            className="h-8 border border-neon-orange/50 bg-neon-orange/10 px-4 text-[13px] font-medium text-neon-orange hover:bg-neon-orange/20 transition-colors"
          >
            Configure Launch
          </Button>

          {isConnected && address ? (
            <DropdownMenu open={walletMenuOpen} onOpenChange={setWalletMenuOpen}>
              <div
                className="relative"
                onMouseEnter={() => setWalletMenuOpen(true)}
                onMouseLeave={() => setWalletMenuOpen(false)}
              >
                <DropdownMenuTrigger className={cn(
                  'focus:outline-none focus-visible:outline-none',
                  'inline-flex h-8 items-center gap-2 rounded-md border border-neon-blue/40',
                  'bg-neon-blue/10 px-3 text-[13px] font-medium text-neon-blue',
                  'hover:bg-neon-blue/20 transition-colors'
                )}>
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
                  {formatAddress(address)}
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 border-border/80 bg-card shadow-xl shadow-black/20"
                >
                  {/* ── Address display ─────────────────── */}
                  <div className="px-3 py-2.5 border-b border-border/60">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Connected</p>
                    <p className="text-[12px] font-mono text-foreground">{formatAddress(address)}</p>
                  </div>
                  <div className="p-1">
                    <DropdownMenuItem onClick={copyAddress} className="cursor-pointer gap-2 text-[13px] rounded-lg">
                      <Copy className="h-3.5 w-3.5" />
                      Copy Address
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => window.open(getAddressExplorerUrl(address), '_blank')}
                      className="cursor-pointer gap-2 text-[13px] rounded-lg"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View on Explorer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/60" />
                    <DropdownMenuItem
                      onClick={() => router.push('/dashboard')}
                      className="cursor-pointer gap-2 text-[13px] rounded-lg"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/60" />
                    <DropdownMenuItem
                      onClick={handleDisconnect}
                      className="cursor-pointer gap-2 text-[13px] text-destructive focus:text-destructive rounded-lg"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Disconnect
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </div>
            </DropdownMenu>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button
                  size="sm"
                  onClick={openConnectModal}
                  className="h-8 border border-neon-blue/40 bg-neon-blue/10 px-4 text-[13px] font-medium text-neon-blue hover:bg-neon-blue/20 transition-colors"
                >
                  Connect Wallet
                </Button>
              )}
            </ConnectButton.Custom>
          )}
        </div>

        {/* ── Mobile Hamburger ───────────────────────────── */}
        <button
          className="flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile Menu ────────────────────────────────────── */}
      {menuOpen && (
        <div className="border-t border-border/60 bg-charcoal px-6 pb-5 md:hidden">
          <nav className="flex flex-col gap-0.5 pt-3">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors',
                  pathname === href
                    ? 'bg-neon-blue-tone text-neon-blue'
                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-2">
            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              AMM
            </p>
            {AMM_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'block rounded-lg px-3 py-2.5 pl-5 text-[13px] font-medium transition-colors',
                  pathname === href
                    ? 'bg-neon-blue-tone text-neon-blue'
                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-4">
            <Button
              size="sm"
              onClick={() => { wizardActions.open(); setMenuOpen(false); }}
              className="w-full border border-neon-orange/50 bg-neon-orange/10 text-neon-orange hover:bg-neon-orange/20"
            >
              Create Launch
            </Button>

            {isConnected && address ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAddress}
                  className="w-full border-neon-blue/30 bg-neon-blue/10 text-neon-blue justify-start gap-2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  {formatAddress(address)}
                </Button>
                <button
                  onClick={() => { router.push('/dashboard'); setMenuOpen(false); }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => { handleDisconnect(); setMenuOpen(false); }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Disconnect
                </button>
              </>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <Button
                    size="sm"
                    onClick={openConnectModal}
                    className="w-full border border-neon-blue/40 bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20"
                  >
                    Connect Wallet
                  </Button>
                )}
              </ConnectButton.Custom>
            )}
          </div>
        </div>
      )}
    </header>
  );
}