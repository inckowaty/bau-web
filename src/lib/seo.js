// src/lib/seo.js
// Jedno źródło prawdy dla adresów stron, języków i metadanych SEO.
// Bez importów serwerowych – używane też w komponentach klienckich.
// Metadane (title/description/hreflang) budowane są w src/lib/metadata.js.

export const SITE_URL = 'https://grp-bau.de';
export const SITE_NAME = 'GRP Bau';
export const LOCALES = ['de', 'pl', 'en'];
export const DEFAULT_LOCALE = 'de';

// ile zdjęć z galerii pokazuje podstrona usługi (i ile trafia do sitemapy)
export const SERVICE_MAX_IMAGES = 6;

// slug podstrony w każdym języku ('' = strona główna)
export const PAGE_SLUGS = {
  home:     { de: '',           pl: '',        en: ''         },
  services: { de: 'leistungen', pl: 'uslugi',  en: 'services' },
  gallery:  { de: 'galerie',    pl: 'galeria', en: 'gallery'  },
  about:    { de: 'ueber-uns',  pl: 'o-nas',   en: 'about-us' },
  contact:  { de: 'kontakt',    pl: 'kontakt', en: 'contact'  },
};

// publiczny adres strony: niemiecki bez prefiksu, pozostałe z /pl, /en
export function pagePath(page, lang) {
  const slug = PAGE_SLUGS[page][lang];
  const prefix = lang === DEFAULT_LOCALE ? '' : `/${lang}`;
  if (!slug) return prefix || '/';
  return `${prefix}/${slug}`;
}

// adres podstrony usługi, np. ('de','trockenbau') → '/leistungen/trockenbau'
export function servicePath(lang, slug) {
  return `${pagePath('services', lang)}/${slug}`;
}

// adresy podstrony usługi we wszystkich językach (tylko tam, gdzie jest tłumaczenie)
export function serviceUrls(slugs) {
  return Object.fromEntries(
    LOCALES.filter(l => slugs?.[l]).map(l => [l, servicePath(l, slugs[l])])
  );
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
  if (rest.length === 2 && rest[0] === PAGE_SLUGS.services[lang]) {
    return { lang, page: 'service', serviceSlug: rest[1] };
  }
  if (rest.length > 1) return null;

  const page = Object.keys(PAGE_SLUGS).find(p => PAGE_SLUGS[p][lang] && PAGE_SLUGS[p][lang] === rest[0]);
  return page ? { lang, page } : null;
}

// wszystkie publiczne adresy – dla sitemap.xml
export function allPages() {
  return Object.keys(PAGE_SLUGS);
}
