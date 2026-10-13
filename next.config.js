// next.config.js
const createNextIntlPlugin = require('next-intl/plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wp.grp-bau.de',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
  output: 'standalone',
  poweredByHeader: false,
  // niemiecki jest bez prefiksu – stare adresy /de/... przekierowujemy na stałe (308)
  async redirects() {
    return [
      { source: '/de', destination: '/', permanent: true },
      { source: '/de/:path*', destination: '/:path*', permanent: true },
    ];
  },
  async headers() {
    return [
      { source: '/admin', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
};

module.exports = createNextIntlPlugin({
  locales: ['de', 'pl', 'en'],
  defaultLocale: 'de',
  localePrefix: 'as-needed',
  localeDetection: false
})(nextConfig);
