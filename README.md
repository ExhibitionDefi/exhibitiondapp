# Exhibition

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
![Network](https://img.shields.io/badge/network-ARC%20Testnet-purple.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

***Deterministic primary market infrastructure for an enshrined financial system.***

**[Live App →](https://exhibition.perfectinformationlabs.com)**

</div>

---

## Overview

Exhibition is a primary market infrastructure protocol built on Nexus Layer 1 — a blockchain purpose-built for intelligent markets and high-performance financial applications.

It enables projects to launch tokens, raise funds, and bootstrap on-chain liquidity through an integrated AMM — with every parameter configured upfront, enforced by the protocol, and immutable once capital enters.

The core thesis is simple: **if it matters, it must be configured before capital enters** and deterministically executed.

Three core principles guide the system:

- **Deterministic** — Launch configurations — token supply, fund goal, soft cap, token price, liquidity allocation (minimum 70%), lock duration, and vesting schedule — are set before capital enters and enforced on-chain. No discretionary execution. No post-launch amendments.
- **Verifiable** — These exact configurations are fully visible before and during a launch. Contributors can independently confirm what they're entering into before capital moves, and audit exactly how it was executed after.
- **Protected** — Contributors are safeguarded by enforced soft caps, a permissionless pull-refund mechanism, optional vesting schedules for purchased tokens, locked liquidity, and an emergency refund path if the project owner fails to finalize within the protocol deadline.

---

## Features

### Token Launch

- Configure launches with fixed funding goals, soft caps, contribution limits, timelines, and liquidity percentage
- Protocol-enforced liquidity bootstrapping — a preconfigured percentage of raised capital is automatically allocated to the AMM
- Liquidity is locked at creation and remains immutable for the configured duration
- Vesting schedules with configurable cliff, duration, interval, and initial release
- Deterministic full refunds if the soft cap is not met
- Enforced liquidity finalization deadlines with fallback refund paths

### AMM

- Constant product automated market maker
- Native liquidity creation from launch capital
- Time-weighted average price (TWAP) oracle
- Liquidity position tracking — unrealized and realized earnings per position
- Liquidity lock enforcement for launch-created pools

### Platform

- exNEX portal — wrap/unwrap native NEX to exNEX
- Testnet faucet — request EXH and USDX
- Real-time pricing derived directly from on-chain pool reserves
- Unified portfolio view — LP positions, earnings, and lock status
- Project metadata — off-chain launch descriptions, social links, and media managed via a backend API

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Blockchain | wagmi 2 + viem + RainbowKit 2 |
| State | valtio, TanStack Query |
| UI | Tailwind CSS v4, shadcn/ui (Radix) |
| Forms | react-hook-form + zod |
| Language | TypeScript |
| Network | Nexus Testnet |

---

## Network

| Property | Value |

---

## Contracts

All contracts are deployed and live on Nexus Testnet. No local deployment required.

| Contract | Address |
|---|---|
| Exhibition | `0xe69e3E1C5B448c2E594Fd33f0400907798907DF5` |
| ExhibitionAMM | `0x5A8891C782A65083D490814755A167c6bD1b4C13` |
| ExhibitionLPTokens | `0xbf131952cb4Ffc16134989532Eb0aB60d563Af5D` |
| ExhibitionFactory | `0x88b4CcB1d0820C8BE944F8C6B6950252e7835982` |
| USDX | `0x25Ec99546f11Cd98454Dc65f314C72423CB30d57` |
| exNEX | `0xA6168C17807e2c914e4546a2D2040056974bD39f` |
| EXH | `0xa8286B8e01665d03A183aDd918beb0f318939233` |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)

### Installation

```bash
git clone https://github.com/ExhibitionDefi/exhibitiondapp
cd exhibitiondapp
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```dotenv
# Contracts
NEXT_PUBLIC_EXHIBITION_ADDRESS=
NEXT_PUBLIC_EXHIBITION_AMM_ADDRESS=
NEXT_PUBLIC_EXHIBITION_LP_TOKENS_ADDRESS=
NEXT_PUBLIC_EXHIBITION_FACTORY_ADDRESS=

# Tokens
NEXT_PUBLIC_NEXUS_USD_ADDRESS=
NEXT_PUBLIC_EXHIBITION_NEX_ADDRESS=
NEXT_PUBLIC_EXH_ADDRESS=

# Network
NEXT_PUBLIC_NEXUS_CHAIN_ID=3945
NEXT_PUBLIC_NEXUS_CHAIN_NAME=Nexus Testnet
NEXT_PUBLIC_NEXUS_TESTNET_RPC_URL=https://testnet.rpc.nexus.xyz
NEXT_PUBLIC_NEXUS_TESTNET_EXPLORER_URL=https://testnet.explorer.nexus.xyz

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# BACKEND API URLs
NEXT_PUBLIC_API_URL=
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

---

## Project Structure

```
src/
├── app/                       # Next.js App Router pages
│   ├── page.tsx               # Landing page
│   ├── launches/              # Launch list + detail pages
│   ├── amm/                   # Swap, liquidity, pools pages
│   ├── portfolio/             # LP positions page
│   ├── dashboard/             # User launches + contributions
│   └── faucet/                # Faucet + exNEX portal
├── components/
│   ├── ui/                    # shadcn/ui + custom components
│   ├── layout/                # Navbar, Footer, PageWrapper
│   ├── launch/                # Launch cards, panels, wizard
│   └── amm/                   # Swap, liquidity, pool components
├── hooks/
│   ├── contracts/ 
│   │   ├── exhibition/        # Exhibition contract hooks
│   │   ├── amm/               # AMM contract hooks + derived hooks (pricing, token list)
│   │   └── tokens/            # ERC20 approvals, balances, faucet, and NEX wrap/unwrap
│   ├── auth/                  # Auth + project metadata (backend API)
│   ├── ui/                    # Debounce, Modal, Toast
│   └── wizard/                # Create launch wizard state
├── lib/
│   ├── abis/                  # Contract ABIs
│   ├── apiClient.ts           # Custom fetch wrapper — base URL, CSRF headers, auth cookies, typed request helpers
│   ├── constants.ts           # Block constants, status maps
│   ├── contracts.ts           # Contract addresses + ABIs
│   ├── formatters/            # Display formatting utilities
│   ├── sanitizers/            # Input sanitization
│   ├── tokenLogos.ts          # Static token logo resolver
│   ├── validators/            # Zod schemas for wizard
│   ├── parseContractError.ts  # Shared contract error parser — extracts revert reasons, classifies rejections
│   ├── tokenMetadataCache.ts  # Module-level ERC20 metadata cache — persists across renders, never resets on refetch
│   └── wagmi.ts               # Wagmi + RainbowKit config
├── providers/                 # React context providers
└── types/                     # TypeScript type definitions
```

---

## Error Handling

All contract write hooks follow a consistent error handling pattern:

- **User rejection** — if the user rejects in their wallet, the hook returns `'rejected'` and resets silently. No error state is set.
- **Contract revert** — if the contract reverts, the hook returns `'error'` with the revert reason extracted via viem's `ContractFunctionRevertedError`.
- **Network / RPC failure** — if the RPC drops or times out, the hook returns `'error'` with the short error message. The app does not crash.
- **No throws** — write hooks never throw. All errors are captured and surfaced via the `error: string | null` field and `isError: boolean` flag returned from the hook.

All write hooks return `Promise<WriteResult>` where `WriteResult = 'success' | 'rejected' | 'error'`, powered by the shared `parseContractError` utility in `lib/parseContractError.ts`.

---

## Launch Lifecycle

```
Created (Upcoming)
  ↓ Owner deposits project tokens
Active — open for contributions
  ↓ Hard cap reached instantly  OR  duration ends → anyone calls finalizeProject()
Successful — funding goal met, soft cap reached
  ↓ Owner deposits liquidity tokens + calls finalizeLiquidityAndReleaseFunds()
Completed — liquidity locked in AMM, tokens claimable

── Alternative paths ──────────────────────────────────────────
Active      → Failed      — soft cap not reached after end block
Failed      → Refundable  — first contributor calls requestRefund()
Successful  → Refundable  — owner misses liquidity deadline; anyone calls requestEmergencyRefund()
```

---

## Supported Wallets

- MetaMask
- Rainbow
- CoinbaseWallet
- Trust Wallet
- WalletConnect (all compatible wallets)

---

## Contributing

This project is currently in testnet phase. Contributions, bug reports, and feedback are welcome via GitHub Issues.

---

## License

MIT

---

<div align="center">

**Built by the @wucklace**

[App](https://app.exhibitiondefi.xyz) • [GitHub](https://github.com/ExhibitionDefi) • [Twitter](https://twitter.com/exhibitiondefi)

</div>
