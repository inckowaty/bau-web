import { SITE_URL, LOCALES, DEFAULT_LOCALE, allPages, pageUrls } from '@/lib/seo';

export default function sitemap() {
  return allPages().flatMap(page => {
    const urls = pageUrls(page);
    const languages = Object.fromEntries(
      [...LOCALES, 'x-default'].map(l => [l, SITE_URL + urls[l === 'x-default' ? DEFAULT_LOCALE : l]])
    );

    return LOCALES.map(lang => ({
      url: SITE_URL + urls[lang],
      changeFrequency: 'monthly',
      priority: page === 'home' ? 1 : 0.8,
      alternates: { languages },
    }));
  });
}
