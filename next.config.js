// next.config.js
const createNextIntlPlugin = require('next-intl/plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // domains: ['wp.grp-bau.de'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wp.grp-bau.de',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
  // tu możesz w przyszłości dodać inne ustawienia Next.js
};

module.exports = createNextIntlPlugin({
  locales: ['de', 'pl', 'en'],
  defaultLocale: 'de',
  localePrefix: 'as-needed',
  localeDetection: false
})(nextConfig);