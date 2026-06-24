// src/lib/db.js  — replaces src/lib/wp.js
// All functions keep the same signatures so components need minimal changes.

import prisma from './prisma';

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
      hero_bg: { url: row.heroBg },
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
    orderBy: { sortOrder: 'asc' },
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
export async function fetchLeistungen(lang = 'de') {
  const rows = await prisma.service.findMany({
    where: { lang },
    orderBy: { sortOrder: 'asc' },
  });
  return rows.map(r => ({
    id: r.id,
    title: { rendered: r.title },
    acf: {
      leistung_icon: { url: r.iconUrl },
      leistung_excerpt: r.excerpt,
      leistung_features_raw: r.featuresRaw,
    },
  }));
}

/*──────────────── GALLERY  ──────────────────*/
export async function fetchGallery(lang = 'de') {
  const rows = await prisma.galleryImage.findMany({
    where: { lang },
    orderBy: { sortOrder: 'asc' },
  });
  // Return as flat array of image objects (simplifies page.jsx processing)
  return rows.map(r => ({
    id: r.id,
    url: r.url,
    width: r.width,
    height: r.height,
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
