// src/lib/wp.js

// (opcjonalnie w dev/staging)

const API   = process.env.WP_API_URL;
const DEBUG = process.env.DEBUG_WP === 'true';

/*──────────────── HOME  (CPT “homepage") ────────────────*/
export async function fetchHome(lang = 'de') {
  const url = `${API}/wp-json/wp/v2/homepage?lang=${lang}&per_page=1&acf_format=standard`;
  DEBUG && console.log('[WP] HOME url →', url);

  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error('Home fetch failed');
  const data = (await res.json())[0];
  return data;
}

/*──────────────── ABOUT  (CPT “aboutuspage") ──────────────────*/
export async function fetchAbout(lang = 'de') {
  const cptSlug = 'aboutuspage';  // Twój slug w CPT UI
  const url = `${API}/wp-json/wp/v2/${cptSlug}?lang=${lang}&per_page=1&acf_format=standard`;
  DEBUG && console.log('[WP] ABOUT url →', url);

  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error('About fetch failed');
  const data = (await res.json())[0];
  return data.acf;
}

/* helper – zamienia ID lub Array na URL */
export function imgUrl(img) {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (typeof img === 'number')
    return `${API}/wp-json/wp/v2/media/${img}`;
  if (img.url) return img.url;
  return null;
}

/*──────────────── PAGE (WP Pages) ───────────────────────*/
export async function fetchPage(slug = 'home', lang = 'de') {
  const url = `${API}/wp-json/wp/v2/pages?slug=${slug}&lang=${lang}&acf_format=standard`;
  DEBUG && console.log('[WP] PAGE url →', url);

  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error('Page fetch failed');
  const data = (await res.json())[0];
  return data;
}

/*──────────────── MENU (CPT “navitem") ──────────────────*/
export async function fetchNav(lang = 'de') {
  const url =
    `${API}/wp-json/wp/v2/navitem?lang=${lang}&per_page=100&orderby=menu_order&order=asc&acf_format=standard`;
  DEBUG && console.log('[WP] NAV url →', url);

  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error('Nav fetch failed');
  const data = await res.json();
  return data;
}

/*──────────────── SERVICES  (CPT "leistung") ──────────────────*/
export async function fetchLeistungen(lang='de'){
  const url = `${API}/wp-json/wp/v2/leistung?lang=${lang}&per_page=100&acf_format=standard`;
  const res = await fetch(url,{cache:'force-cache'});
  if(!res.ok) throw new Error('Leistungen fetch failed');
  return await res.json();
}

/*──────────────── GALLERY  (CPT "galerie") ──────────────────*/
export async function fetchGallery(lang = 'de') {
  const url =
    `${API}/wp-json/wp/v2/gallery?` +
    `lang=${lang}` +                 // jeśli CPT jest przetłumaczony
    `&per_page=100` +
    `&acf_format=standard`;
  DEBUG && console.log('[WP] GALLERY url →', url);

  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error('Gallery fetch failed');
  return await res.json();           // tablica wpisów CPT gallery
}
/*──────────────── KONTAKT  (CPT "kontakt") ──────────────────*/
export async function fetchKontakt(lang = 'de') {
  const url =
    `${API}/wp-json/wp/v2/kontakt?` +
    `lang=${lang}` +                 // jeśli CPT jest przetłumaczony
    `&per_page=100` +
    `&acf_format=standard`;
  DEBUG && console.log('[WP] KONTAKT url →', url);

  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error('Kontakt fetch failed');
  return await res.json();           // tablica wpisów CPT gallery
}
