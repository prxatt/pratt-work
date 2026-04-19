import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Align Turbopack root with the repo root on any machine (avoids hardcoded paths; matches Vercel cwd)
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Next.js 16+: local `src` paths must match `localPatterns` or the optimizer returns 400.
    // Needed when `getImageUrl` falls back to `/work/...` (no NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME on
    // that build) and for any plain local `<Image src="/work/...">`.
    // Allow any path served from `public/` (Next 16 blocks local src without a match).
    // Prefer Cloudinary URLs in production; this keeps local/LFS fallbacks working.
    localPatterns: [{ pathname: '/**' }],
    // Cloudinary (absolute URLs from getImageUrl when cloud name is set).
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Compress for faster transfer
  compress: true,
  // Enable React strict mode for better development
  reactStrictMode: true,
  // Production source maps (disable for production builds if concerned about size)
  productionBrowserSourceMaps: false,
  // Performance: experimental features
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', '@react-three/fiber', '@react-three/drei'],
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB', 'INP'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Security: Prevent clickjacking
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Security: Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Security: XSS Protection
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Security: Referrer Policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Security: Permissions Policy (disable unnecessary browser features)
          { 
            key: 'Permissions-Policy', 
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()' 
          },
          // Security: Strict Transport Security (HSTS)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Performance: Keep-alive for HTTP/2
          { key: 'Connection', value: 'keep-alive' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ],
      },
      {
        source: '/videos/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ],
      },
      {
        source: '/:path*.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ],
      },
      {
        source: '/:path*.css',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ],
      },
    ];
  },
};

export default nextConfig;
