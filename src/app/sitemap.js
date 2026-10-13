import { SITE_URL, LOCALES, DEFAULT_LOCALE, SERVICE_MAX_IMAGES, allPages, pageUrls, serviceUrls } from '@/lib/seo';
import { fetchServiceSlugGroups, fetchGallery } from '@/lib/db';

// czytane z bazy przy każdym żądaniu (nowe usługi i zdjęcia od razu w sitemapie)
export const dynamic = 'force-dynamic';

const abs = path => SITE_URL + (path === '/' ? '' : path);
const absImage = url => (url.startsWith('http') ? url : SITE_URL + url);

function entries(urls, extra = {}, imagesByLang = {}) {
  const languages = Object.fromEntries(
    [...LOCALES.filter(l => urls[l]), 'x-default'].map(l => [l, abs(urls[l === 'x-default' ? DEFAULT_LOCALE : l] || Object.values(urls)[0])])
  );
  return LOCALES.filter(l => urls[l]).map(lang => ({
    url: abs(urls[lang]),
    changeFrequency: 'monthly',
    alternates: { languages },
    ...(imagesByLang[lang]?.length ? { images: imagesByLang[lang] } : {}),
    ...extra,
  }));
}

export default async function sitemap() {
  const [serviceGroups, ...galleries] = await Promise.all([
    fetchServiceSlugGroups().catch(() => []),
    ...LOCALES.map(l => fetchGallery(l).catch(() => [])),
  ]);
  const gallery = Object.fromEntries(LOCALES.map((l, i) => [l, galleries[i]]));
  const galleryImages = Object.fromEntries(LOCALES.map(l => [l, gallery[l].map(img => absImage(img.url))]));

  const pages = allPages().flatMap(page =>
    entries(pageUrls(page), { priority: page === 'home' ? 1 : 0.8 }, page === 'gallery' ? galleryImages : {})
  );

  const services = serviceGroups.flatMap(({ key, slugs }) => {
    const images = Object.fromEntries(
      LOCALES.map(l => [l, gallery[l].filter(img => img.category === key).slice(0, SERVICE_MAX_IMAGES).map(img => absImage(img.url))])
    );
    return entries(serviceUrls(slugs), { priority: 0.9 }, images);
  });

  return [...pages, ...services];
}
