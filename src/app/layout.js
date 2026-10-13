import './globals.css';
import {Poppins} from 'next/font/google';
import {headers} from 'next/headers';
import {SITE_URL, SITE_NAME, LOCALES, DEFAULT_LOCALE} from '@/lib/seo';

const font = Poppins({subsets:['latin'],weight:['400','500','700'],display:'swap'});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} | Bau- und Innenausbau`,
  description: 'GRP-BAU aus Sulingen: Trockenbau, Malerarbeiten und Bodenbeläge.'
};

export default async function RootLayout({children}) {
  // język ustawia middleware next-intl (rewrite na /de, /pl, /en)
  const headerLocale = (await headers()).get('x-next-intl-locale');
  const lang = LOCALES.includes(headerLocale) ? headerLocale : DEFAULT_LOCALE;

  return (
    <html lang={lang} className={font.className}>
      <body className="bg-primary-900 text-neutral-50">{children}</body>
    </html>
  );
}
