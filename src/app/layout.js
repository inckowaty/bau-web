import './globals.css';
import {Poppins} from 'next/font/google';

const font = Poppins({subsets:['latin'],weight:['400','500','700'],display:'swap'});

export const metadata = {
  title: 'GRP-Bau | Bau- und Innenausbau',
  description: 'Solidne wykończenia wnętrz w Niemczech'
};

export default function RootLayout({children}) {
  return (
    <html lang="de" className={font.className}>
      <body className="bg-primary-900 text-neutral-50">{children}</body>
    </html>
  );
}
