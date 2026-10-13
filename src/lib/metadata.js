// src/lib/metadata.js (tylko serwer)
// Metadane stron: najpierw wartości z CMS, w razie pustych pól – teksty domyślne.

import defaults from '../../prisma/content/seo-content';
import { SITE_NAME, LOCALES, DEFAULT_LOCALE, pageUrls, serviceUrls } from './seo';

const OG_LOCALES = { de: 'de_DE', pl: 'pl_PL', en: 'en_GB' };
const IN_CITY = { de: 'in', pl: 'w', en: 'in' };
const OG_IMAGE = { url: '/grp-logo.png', width: 1437, height: 1225, alt: SITE_NAME };

function build({ title, description, urls, lang, ogImage }) {
  const own = urls[lang];
  const xDefault = urls[DEFAULT_LOCALE] || own;
  const image = ogImage ? { url: ogImage, alt: title } : OG_IMAGE;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: own,
      languages: { ...urls, 'x-default': xDefault },
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url: own,
      locale: OG_LOCALES[lang],
      alternateLocale: LOCALES.filter(l => l !== lang && urls[l]).map(l => OG_LOCALES[l]),
      images: [image],
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: [image.url],
    },
  };
}

// teksty domyślne strony (z prisma/content/seo-content.js)
export function pageDefaults(page, lang) {
  return defaults.pages?.[page]?.[lang] ?? {};
}

// content = wiersz PageContent z CMS (albo null)
export function buildPageMetadata(page, lang, content, ogImage) {
  const d = pageDefaults(page, lang);
  return build({
    title: content?.metaTitle || d.metaTitle || SITE_NAME,
    description: content?.metaDescription || d.metaDescription || '',
    urls: pageUrls(page),
    lang,
    ogImage,
  });
}

// service = wynik fetchServiceBySlug (z polem slugs)
export function buildServiceMetadata(service, lang, ogImage) {
  const name = service.title.rendered;
  return build({
    title: service.metaTitle || `${name} ${IN_CITY[lang] || 'in'} Sulingen | ${SITE_NAME}`,
    description: service.metaDescription || service.acf.leistung_excerpt || '',
    urls: serviceUrls(service.slugs),
    lang,
    ogImage,
  });
}
