import {getRequestConfig} from 'next-intl/server';
import {routing} from '@/i18n/routing';

/**
 * Konfiguracja wywoływana raz na każde żądanie
 * — serwerowe komponenty, akcje, metadata, itp.
 */
export default getRequestConfig(async ({requestLocale}) => {
  // Jeśli locale w URL nie istnieje w routing.locales → fallback
  const locale = routing.locales.includes(requestLocale)
    ? requestLocale
    : routing.defaultLocale;

  /* 
   * Na razie zwracamy puste „messages”.
   * Gdy będziesz miał pliki tłumaczeń (np. /messages/de.json),
   * odczytasz je tu i wstawisz:  messages: (await import(...)).default
   */
  return {
    locale,
    messages: {}
  };
});
