// next.config.js
const createNextIntlPlugin = require('next-intl/plugin');

/** @type {import('next').NextConfig} */
module.exports = createNextIntlPlugin({
  locales: ['de', 'pl', 'en'],
  defaultLocale: 'de',
  localePrefix: 'as-needed',   //  /     → de   |   /pl … /en …
  localeDetection: false       //  NIE przekierowuje wg Accept-Language
})();