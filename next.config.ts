import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: '/api/rpc',
        destination: process.env.NEXT_PUBLIC_NEXUS_TESTNET_RPC_URL!,
      },
    ];
  },
};

export default nextConfig;
