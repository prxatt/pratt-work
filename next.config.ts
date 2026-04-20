import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== 'production';
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
  "font-src 'self' data:",
  "media-src 'self' blob: https://*.public.blob.vercel-storage.com",
  "connect-src 'self' https://vitals.vercel-insights.com https://*.vercel-insights.com https://cdn.jsdelivr.net",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join('; ');

const nextConfig: NextConfig = {
  /* config options here */
  // Align Turbopack root with the repo root on any machine (avoids hardcoded paths; matches Vercel cwd)
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Next.js 16.x (see package.json): local `next/image` sources must match `localPatterns` or the
    // optimizer returns 400. Keep this list explicit (narrower than `/**`) so the optimizer is not
    // a catch-all for arbitrary paths under `public/`. Add a segment when new image roots appear.
    // Needed when `getImageUrl` falls back to `/work/...` (no cloud name on that build).
    localPatterns: [
      { pathname: '/work/**' },
      { pathname: '/recognition/**' },
      { pathname: '/ventures/**' },
      { pathname: '/logos/**' },
      { pathname: '/images/**' },
      { pathname: '/playground/**' },
    ],
    // Absolute CDN assets (Vercel Blob).
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
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
          { key: 'X-Frame-Options', value: 'DENY' },
          // Security: Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Security: Referrer Policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Security: Content Security Policy
          { key: 'Content-Security-Policy', value: csp },
          // Security: Cross-Origin isolation controls
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          // Security: Permissions Policy (disable unnecessary browser features)
          {
            key: 'Permissions-Policy',
            value: 'accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()'
          },
          // Security: Strict Transport Security (HSTS)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
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
      // Optional crawler guardrails for non-public/internal paths.
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' },
        ],
      },
      {
        source: '/_next/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' },
        ],
      },
      {
        source: '/private/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' },
        ],
      },
    ];
  },
};

export default nextConfig;
