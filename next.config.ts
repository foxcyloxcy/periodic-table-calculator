import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/periodic-table-calculator',
  assetPrefix: '/periodic-table-calculator/',
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
