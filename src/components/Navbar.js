'use client';

import {Link} from '@/i18n/navigation';      // już nie potrzebujemy useRouter / usePathname
import {useState} from 'react';
import {Menu} from 'lucide-react';

import {Button} from '@/components/ui/button'; // tylko do przycisku „hamburger”
import LocaleSwitch from '@/components/LocaleSwitch';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // ścieżki BEZ prefiksu językowego – Link doda je sam
  const links = [
    {href: '/', label: 'Start'},
    {href: '/leistungen', label: 'Leistungen'},
    {href: '/ueber-uns', label: 'Über uns'},
    {href: '/galerie', label: 'Galerie'},
    {href: '/kontakt', label: 'Kontakt'}
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-primary-900 text-neutral-50 shadow">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="h-6 w-6 rounded bg-accent-500" /> Bau&nbsp;GmbH
        </Link>

        {/* desktop nav */}
        <nav className="flex gap-6 max-md:hidden">
          {links.map(({href, label}) => (
            <Link key={href} href={href} className="hover:text-accent-500">
              {label}
            </Link>
          ))}
        </nav>

        {/* flagi + hamburger */}
        <div className="flex items-center gap-2">
          <LocaleSwitch />

          {/* hamburger tylko < 768 px */}
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            <Menu />
          </Button>
        </div>
      </div>

      {/* mobile nav */}
      {open && (
        <nav className="md:hidden">
          {links.map(({href, label}) => (
            <Link
              key={href}
              href={href}
              className="block border-t border-primary-700 px-6 py-4 hover:bg-primary-700"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
