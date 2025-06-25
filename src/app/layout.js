import './globals.css'
import { Poppins } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

import {
  NextIntlClientProvider,
  useLocale,
  useMessages
} from 'next-intl';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata = {
  title: 'GRP-Bau | Bau- und Innenausbau',
  description: 'Solidne wykończenia wnętrz w Niemczech',
}

export default function RootLayout({children}) {
  // Serwerowe hooki next-intl
  const locale   = useLocale();     // 'de' / 'pl' / 'en'
  const messages = useMessages();   // na razie puste {}, ale muszą istnieć

  return (
    <html lang={locale} className={poppins.className}>
      <body className="bg-primary-900 text-neutral-50">

        {/* PROVIDER → wewnątrz niego żyją client-components z next-intl hooks */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>

      </body>
    </html>
  );
}
