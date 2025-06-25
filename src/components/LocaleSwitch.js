import {Link, usePathname} from '@/i18n/navigation';

const locales = ['de', 'pl', 'en'];
const icons   = {
  de: '/flags/de.svg',
  pl: '/flags/pl.svg',
  en: '/flags/gb.svg'
};

export default function LocaleSwitch() {
  const pathnameWithLocale = usePathname();               // np. /pl/leistungen
  const internalPathname    =
    pathnameWithLocale.replace(/^\/(de|pl|en)(?=\/|$)/, '') || '/';
    //       ^^^^^^^^^^^^^^^^^  zdejmuje pierwszy segment, jeżeli jest locale

  return (
    <div className="flex gap-2">
      {locales.map(l => (
        <Link key={l} href={internalPathname} locale={l}>
          <img
            src={icons[l]}
            alt={l}
            className="h-6 w-6 rounded-full shadow ring-1 ring-neutral-400
                       transition hover:ring-accent-500"
          />
        </Link>
      ))}
    </div>
  );
}
