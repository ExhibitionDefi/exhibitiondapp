import {
  exhibitionABI,
  exhibitionAMMABI,
  exhibitionLPTokensABI,
  exhibitionNEXABI,
  erc20ABI,
} from '@/lib/abis';

export const CONTRACTS = {
  Exhibition: {
    address: process.env.NEXT_PUBLIC_EXHIBITION_ADDRESS as `0x${string}`,
    abi: exhibitionABI,
  },
  ExhibitionAMM: {
    address: process.env.NEXT_PUBLIC_EXHIBITION_AMM_ADDRESS as `0x${string}`,
    abi: exhibitionAMMABI,
  },
  ExhibitionLPTokens: {
    address: process.env.NEXT_PUBLIC_EXHIBITION_LP_TOKENS_ADDRESS as `0x${string}`,
    abi: exhibitionLPTokensABI,
  },
  ExhibitionFactory: {
    address: process.env.NEXT_PUBLIC_EXHIBITION_FACTORY_ADDRESS as `0x${string}`,
  },
  ExhibitionNEX: {
    address: process.env.NEXT_PUBLIC_EXHIBITION_NEX_ADDRESS as `0x${string}`,
    abi: exhibitionNEXABI,
  },
  NexusUSD: {
    address: process.env.NEXT_PUBLIC_NEXUS_USD_ADDRESS as `0x${string}`,
    abi: erc20ABI,
  },
  EXH: {
    address: process.env.NEXT_PUBLIC_EXH_ADDRESS as `0x${string}`,
    abi: erc20ABI,
  },
} as const;