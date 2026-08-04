import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Browsers request /favicon.ico by convention — serve the shield SVG
      { source: '/favicon.ico', destination: '/icon.svg', permanent: true },
      // Old query-param episode URLs → clean paths (301, preserves rankings)
      {
        source: '/podcast-episode',
        has: [{ type: 'query', key: 'ep', value: '(?<ep>.+)' }],
        destination: '/podcast-episode/:ep',
        permanent: true,
      },
      // Old query-param replay URLs → new separate section
      {
        source: '/webinar-replay',
        has: [{ type: 'query', key: 'replay', value: '(?<replay>.+)' }],
        destination: '/webinar-replays/:replay',
        permanent: true,
      },
      { source: '/webinar-replay', destination: '/webinar-replays', permanent: true },
    ];
  },
};

export default nextConfig;
