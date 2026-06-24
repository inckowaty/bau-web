import '../globals.css';
import { Poppins } from 'next/font/google';

const font = Poppins({ subsets: ['latin'], weight: ['400', '500', '700'], display: 'swap' });

export const metadata = {
  title: 'GRP-BAU Admin',
};

export default function AdminLayout({ children }) {
  return (
    <html lang="de" className={font.className}>
      <body>{children}</body>
    </html>
  );
}
