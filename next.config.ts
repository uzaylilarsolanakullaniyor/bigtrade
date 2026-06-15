import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    // Lint runs in CI / `npm run lint`. Do not fail production builds on lint.
    ignoreDuringBuilds: false,
  },
  experimental: {
    optimizePackageImports: ['recharts', 'framer-motion'],
  },
};

export default nextConfig;
