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
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
};

module.exports = createNextIntlPlugin({
  locales: ['de', 'pl', 'en'],
  defaultLocale: 'de',
  localePrefix: 'as-needed',
  localeDetection: false
})(nextConfig);
