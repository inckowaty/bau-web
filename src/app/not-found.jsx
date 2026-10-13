import Link from 'next/link';
import { headers } from 'next/headers';
import { LOCALES, DEFAULT_LOCALE, pagePath } from '@/lib/seo';

const TEXT = {
  de: { title: 'Seite nicht gefunden', back: 'Zur Startseite' },
  pl: { title: 'Nie znaleziono strony', back: 'Wróć na stronę główną' },
  en: { title: 'Page not found', back: 'Back to the homepage' },
};

export const metadata = {
  title: '404 | GRP-BAU',
};

export default async function NotFound() {
  const headerLocale = (await headers()).get('x-next-intl-locale');
  const lang = LOCALES.includes(headerLocale) ? headerLocale : DEFAULT_LOCALE;
  const t = TEXT[lang];

  return (
    <main style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem', textAlign: 'center' }}>
      <h1>404 – {t.title}</h1>
      <Link href={pagePath('home', lang)} style={{ textDecoration: 'underline' }}>{t.back}</Link>
    </main>
  );
}
