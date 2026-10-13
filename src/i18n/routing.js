// src/i18n/routing.js
export const locales = ['de', 'pl', 'en'];

export const routing = {
  locales,
  defaultLocale: 'de',
  localePrefix: 'as-needed',
  // adres decyduje o języku: bez przekierowań wg przeglądarki/ciasteczka (zalecenie Google)
  localeDetection: false,
  localeCookie: false,
  // hreflang generujemy sami w metadanych (z poprawnymi slugami, np. /pl/uslugi)
  alternateLinks: false
};
