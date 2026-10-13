// src/lib/db.js  — replaces src/lib/wp.js
// All functions keep the same signatures so components need minimal changes.

import prisma from './prisma';

// Convert /uploads/... paths to /api/files/... for runtime serving
function fileUrl(path) {
  if (!path) return '';
  if (path.startsWith('/uploads/')) return path.replace('/uploads/', '/api/files/');
  return path;
}

/*──────────────── HOME  ────────────────*/
export async function fetchHome(lang = 'de') {
  const row = await prisma.homePage.findUnique({ where: { lang } });
  if (!row) return null;
  // Return shape compatible with old WP response
  return {
    id: row.id,
    acf: {
      hero_title: row.heroTitle,
      hero_sub_one: row.heroSubOne,
      hero_sub_two: row.heroSubTwo,
      hero_sub_three: row.heroSubThree,
      button_lang: row.buttonLang,
      hero_bg: { url: fileUrl(row.heroBg) },
    },
  };
}

/*──────────────── ABOUT  ──────────────────*/
export async function fetchAbout(lang = 'de') {
  const row = await prisma.aboutPage.findUnique({ where: { lang } });
  if (!row) return null;
  return {
    about_title: row.aboutTitle,
    about_intro: row.aboutIntro,
    about_points_raw: row.aboutPointsRaw,
    about_cta_text: row.aboutCtaText,
  };
}

/*──────────────── NAV  ──────────────────*/
export async function fetchNav(lang = 'de') {
  const rows = await prisma.navItem.findMany({
    where: { lang },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return rows.map(r => ({
    id: r.id,
    title: { rendered: r.title },
    acf: { path: r.path },
    slug: r.path.split('/').filter(Boolean).pop() || '',
    menu_order: r.sortOrder,
  }));
}

/*──────────────── SERVICES  ──────────────────*/
function mapService(r) {
  return {
    id: r.id,
    key: r.key,
    slug: r.slug,
    h1: r.h1,
    body: r.body,
    faqRaw: r.faqRaw,
    metaTitle: r.metaTitle,
    metaDescription: r.metaDescription,
    iconUrl: fileUrl(r.iconUrl),
    title: { rendered: r.title },
    acf: {
      leistung_icon: { url: fileUrl(r.iconUrl) },
      leistung_excerpt: r.excerpt,
      leistung_features_raw: r.featuresRaw,
    },
  };
}

export async function fetchLeistungen(lang = 'de') {
  const rows = await prisma.service.findMany({
    where: { lang },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return rows.map(mapService);
}

// podstrona usługi + adresy jej tłumaczeń ({ de: 'trockenbau', pl: 'zabudowy-g-k', ... })
export async function fetchServiceBySlug(lang, slug) {
  if (!slug) return null;
  const row = await prisma.service.findFirst({ where: { lang, slug } });
  if (!row) return null;
  const siblings = row.key
    ? await prisma.service.findMany({ where: { key: row.key }, select: { lang: true, slug: true } })
    : [{ lang: row.lang, slug: row.slug }];
  const slugs = Object.fromEntries(siblings.filter(x => x.slug).map(x => [x.lang, x.slug]));
  return { ...mapService(row), slugs };
}

// wszystkie podstrony usług pogrupowane po key – dla sitemap.xml
export async function fetchServiceSlugGroups() {
  const rows = await prisma.service.findMany({
    where: { NOT: [{ slug: '' }, { key: '' }] },
    select: { key: true, lang: true, slug: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  const groups = {};
  for (const r of rows) (groups[r.key] ??= {})[r.lang] = r.slug;
  return Object.entries(groups).map(([key, slugs]) => ({ key, slugs }));
}

/*──────────────── PAGE CONTENT (treść + SEO stron) ──────────────────*/
export async function fetchPageContent(page, lang = 'de') {
  return prisma.pageContent.findUnique({ where: { page_lang: { page, lang } } });
}

/*──────────────── GALLERY  ──────────────────*/
export async function fetchGallery(lang = 'de', category) {
  const rows = await prisma.galleryImage.findMany({
    where: category ? { lang, category } : { lang },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  // Return as flat array of image objects (simplifies page.jsx processing)
  return rows.map(r => ({
    id: r.id,
    url: fileUrl(r.url),
    width: r.width,
    height: r.height,
    alt: r.alt,
    caption: r.caption,
    category: r.category,
  }));
}

/*──────────────── KONTAKT  ──────────────────*/
export async function fetchKontakt(lang = 'de') {
  // Contact info is hardcoded in the component — just return a truthy array
  return [{ id: 1, lang }];
}

/* helper – kept for compatibility */
export function imgUrl(img) {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (img.url) return img.url;
  return null;
}
