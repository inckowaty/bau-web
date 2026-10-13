// src/lib/seo.js
// Jedno źródło prawdy dla adresów stron, języków i metadanych SEO.
// Bez importów serwerowych – używane też w komponentach klienckich.

export const SITE_URL = 'https://grp-bau.de';
export const SITE_NAME = 'GRP-BAU';
export const LOCALES = ['de', 'pl', 'en'];
export const DEFAULT_LOCALE = 'de';

// slug podstrony w każdym języku ('' = strona główna)
export const PAGE_SLUGS = {
  home:     { de: '',           pl: '',        en: ''         },
  services: { de: 'leistungen', pl: 'uslugi',  en: 'services' },
  gallery:  { de: 'galerie',    pl: 'galeria', en: 'gallery'  },
  about:    { de: 'ueber-uns',  pl: 'o-nas',   en: 'about-us' },
  contact:  { de: 'kontakt',    pl: 'kontakt', en: 'contact'  },
};

const OG_LOCALES = { de: 'de_DE', pl: 'pl_PL', en: 'en_GB' };

const META = {
  home: {
    de: {
      title: 'Trockenbau, Malerarbeiten & Bodenbeläge in Sulingen | GRP-BAU',
      description: 'GRP-BAU aus Sulingen: Innenausbau aus einer Hand – Trockenbau, Malerarbeiten und Bodenbeläge. Termintreu, zu fairen Preisen, mit kostenloser Beratung.',
    },
    pl: {
      title: 'Wykończenia wnętrz w Niemczech – Sulingen | GRP-BAU',
      description: 'GRP-BAU z Sulingen: kompleksowe wykończenia wnętrz – zabudowy G-K, malowanie i podłogi. Terminowo, w uczciwych cenach, z bezpłatną wyceną.',
    },
    en: {
      title: 'Drywall, Painting & Flooring in Sulingen | GRP-BAU',
      description: 'GRP-BAU from Sulingen, Germany: interior finishing from a single source – drywall, painting and flooring. On time, at fair prices, with a free consultation.',
    },
  },
  services: {
    de: {
      title: 'Leistungen: Trockenbau, Malerarbeiten, Bodenbeläge | GRP-BAU',
      description: 'Unsere Leistungen im Innenausbau: Trockenbau, Malerarbeiten und Bodenbeläge in Sulingen und Umgebung. Jetzt unverbindlich ein Angebot anfragen.',
    },
    pl: {
      title: 'Usługi: zabudowy G-K, malowanie, podłogi | GRP-BAU',
      description: 'Zakres usług GRP-BAU: zabudowy z płyt G-K, malowanie oraz układanie podłóg w Sulingen i okolicy. Poproś o wycenę.',
    },
    en: {
      title: 'Services: Drywall, Painting & Flooring | GRP-BAU',
      description: 'Our interior finishing services: drywall, painting and flooring in Sulingen and the surrounding area. Request a quote today.',
    },
  },
  gallery: {
    de: {
      title: 'Galerie – Referenzen im Innenausbau | GRP-BAU',
      description: 'Einblicke in abgeschlossene Projekte von GRP-BAU: Trockenbau, Malerarbeiten und Bodenbeläge in Sulingen und Umgebung.',
    },
    pl: {
      title: 'Galeria realizacji – wykończenia wnętrz | GRP-BAU',
      description: 'Zobacz nasze realizacje: zabudowy G-K, malowanie i podłogi wykonane przez GRP-BAU w Sulingen i okolicy.',
    },
    en: {
      title: 'Gallery – Interior Finishing Projects | GRP-BAU',
      description: 'See completed GRP-BAU projects: drywall, painting and flooring work in Sulingen and the surrounding area.',
    },
  },
  about: {
    de: {
      title: 'Über uns – Bauunternehmen aus Sulingen | GRP-BAU',
      description: 'GRP-BAU ist ein zuverlässiges Bauunternehmen mit Sitz in Sulingen: erfahrenes Team, Termintreue und hohe Qualität zu fairen Preisen.',
    },
    pl: {
      title: 'O nas – firma budowlana z Sulingen | GRP-BAU',
      description: 'GRP-BAU to rzetelna firma budowlana z siedzibą w Sulingen: doświadczony zespół, terminowość i wysoka jakość w uczciwych cenach.',
    },
    en: {
      title: 'About Us – Construction Company in Sulingen | GRP-BAU',
      description: 'GRP-BAU is a reliable construction company based in Sulingen, Germany: an experienced team, on-time delivery and high quality at fair prices.',
    },
  },
  contact: {
    de: {
      title: 'Kontakt – Angebot anfragen | GRP-BAU Sulingen',
      description: 'Kontaktieren Sie GRP-BAU in Sulingen per Telefon, WhatsApp oder E-Mail – kostenlose Beratung zu Trockenbau, Malerarbeiten und Bodenbelägen.',
    },
    pl: {
      title: 'Kontakt – poproś o wycenę | GRP-BAU Sulingen',
      description: 'Skontaktuj się z GRP-BAU w Sulingen telefonicznie, przez WhatsApp lub e-mail – bezpłatna wycena zabudów G-K, malowania i podłóg.',
    },
    en: {
      title: 'Contact – Request a Quote | GRP-BAU Sulingen',
      description: 'Contact GRP-BAU in Sulingen by phone, WhatsApp or email – free consultation on drywall, painting and flooring.',
    },
  },
};

// publiczny adres strony: niemiecki bez prefiksu, pozostałe z /pl, /en
export function pagePath(page, lang) {
  const slug = PAGE_SLUGS[page][lang];
  const prefix = lang === DEFAULT_LOCALE ? '' : `/${lang}`;
  if (!slug) return prefix || '/';
  return `${prefix}/${slug}`;
}

// adresy tej samej strony we wszystkich językach – dla flag i hreflang
export function pageUrls(page) {
  return Object.fromEntries(LOCALES.map(l => [l, pagePath(page, l)]));
}

// linki z CMS bez przekierowań: bez prefiksu /de i bez końcowego "/" ("/de/kontakt" → "/kontakt", "/pl/" → "/pl")
export function publicHref(path) {
  if (!path) return '/';
  let p = path.length > 1 ? path.replace(/\/+$/, '') : path;
  if (p === `/${DEFAULT_LOCALE}`) return '/';
  if (p.startsWith(`/${DEFAULT_LOCALE}/`)) p = p.slice(DEFAULT_LOCALE.length + 1);
  return p || '/';
}

// params.slug (po rewrite z middleware zawsze zaczyna się od języka) → { lang, page } | null
export function resolveRoute(slugParam) {
  const segs = !slugParam ? [] : Array.isArray(slugParam) ? slugParam : [slugParam];
  const isLang = LOCALES.includes(segs[0]);
  const lang = isLang ? segs[0] : DEFAULT_LOCALE;
  const rest = isLang ? segs.slice(1) : segs;

  if (rest.length === 0) return { lang, page: 'home' };
  if (rest.length > 1) return null;

  const page = Object.keys(PAGE_SLUGS).find(p => PAGE_SLUGS[p][lang] && PAGE_SLUGS[p][lang] === rest[0]);
  return page ? { lang, page } : null;
}

export function buildMetadata(page, lang) {
  const { title, description } = META[page][lang];
  const urls = pageUrls(page);

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: urls[lang],
      languages: { ...urls, 'x-default': urls[DEFAULT_LOCALE] },
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url: urls[lang],
      locale: OG_LOCALES[lang],
      alternateLocale: LOCALES.filter(l => l !== lang).map(l => OG_LOCALES[l]),
      images: [{ url: '/grp-logo.png', width: 1437, height: 1225, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: ['/grp-logo.png'],
    },
  };
}

// wszystkie publiczne adresy – dla sitemap.xml
export function allPages() {
  return Object.keys(PAGE_SLUGS);
}
