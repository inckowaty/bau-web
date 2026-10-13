// src/lib/jsonld.js – dane strukturalne schema.org
import { COMPANY } from './company';
import { SITE_URL, pagePath } from './seo';

const BUSINESS_ID = `${SITE_URL}/#business`;
const abs = path => (path?.startsWith('http') ? path : SITE_URL + (path === '/' ? '' : path));

export function localBusinessLd(lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': BUSINESS_ID,
    name: COMPANY.name,
    slogan: COMPANY.slogan,
    url: abs(pagePath('home', lang)),
    logo: `${SITE_URL}/grp-logo.png`,
    image: `${SITE_URL}/grp-logo.png`,
    telephone: COMPANY.phone,
    email: COMPANY.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.street,
      postalCode: COMPANY.postalCode,
      addressLocality: COMPANY.city,
      addressRegion: COMPANY.region,
      addressCountry: COMPANY.country,
    },
    areaServed: COMPANY.areaServed.map(name => ({ '@type': 'City', name })),
  };
}

export function serviceLd({ name, description, path, image }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    serviceType: name,
    description,
    url: abs(path),
    ...(image ? { image: abs(image) } : {}),
    provider: { '@id': BUSINESS_ID },
    areaServed: COMPANY.areaServed.map(n => ({ '@type': 'City', name: n })),
  };
}

// items: [{ name, path }]
export function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export { abs as absoluteUrl };
