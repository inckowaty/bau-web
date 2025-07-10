// src/app/[[...slug]]/page.jsx

import { fetchHome, fetchPage, fetchNav, fetchAbout, fetchLeistungen, imgUrl } from '@/lib/wp';
import Hero from '@/sections/Hero';
import About from '@/components/About';
import Navbar from '@/components/NavbarSpirit';
import Footer from '@/components/Footer';
import Services from '@/components/Services';

export const revalidate = 600;
const DEFAULT_SLUG = 'home';

// helper – zawsze zwraca tablicę
const arr = x => (!x ? [] : Array.isArray(x) ? x : [x]);

// parsuje params.slug → [lang, slug]
function parse(params) {
  const segs  = arr(params.slug);
  const langs = ['de', 'pl', 'en'];
  const isLang = langs.includes(segs[0]);
  const lang   = isLang ? segs[0] : 'de';
  const rest   = isLang ? segs.slice(1) : segs;
  const slug   = rest[0] ?? DEFAULT_SLUG;
  return { lang, slug, seg: segs };
}

export default async function Page({ params }) {
  const { lang, slug, seg } = parse(params);

  // zawsze potrzebujemy nav
  const nav = await fetchNav(lang);

  // ------ LEISTUNGEN (Usługi) ------
  // mapujemy slug per język
  const servicesSlugs = { de: 'leistungen', pl: 'uslugi', en: 'services' };
  if (slug === servicesSlugs[lang]) {
    // pobieramy listę usług
    const services = await fetchLeistungen(lang);
    // linki do zmiany języka dla tej sekcji
    const langUrls = {
      de: `/de/${servicesSlugs.de}`,
      pl: `/pl/${servicesSlugs.pl}`,
      en: `/en/${servicesSlugs.en}`,
    };
  
    return (
      <>
        <Navbar items={nav} lang={lang} langUrls={langUrls} />
        <Services list={services} lang={lang} />
        <Footer />
      </>
    );
  }


  // ------ O NAS (About) ------
  // nie hard-kodujemy slugów po jednej, tylko mapujemy per język:
  const aboutSlugs = { de: 'ueber-uns', pl: 'o-nas', en: 'about-us' };
  if (slug === aboutSlugs[lang]) {
    const about = await fetchAbout(lang);
    // rozbijamy punktowaną listę z Textarea
    const points = about.about_points_raw
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);

    // linki do zmiany języka dla tej sekcji
    const langUrls = {
      de: `/de/${aboutSlugs.de}`,
      pl: `/pl/${aboutSlugs.pl}`,
      en: `/en/${aboutSlugs.en}`,
    };

    return (
      <>
        <Navbar items={nav} lang={lang} langUrls={langUrls} />
        <About
          intro={{ title: about.about_title, text: about.about_intro }}
          points={points}
          ctaText={about.about_cta_text}
          langUrl={langUrls[lang]}
          lang={lang}
        />
        <Footer />
      </>
    );
  }

  // ------ HOME ------  
  const isHome =
    seg.length === 0 ||
    (seg.length === 1 && ['de', 'pl', 'en'].includes(seg[0]));

  if (isHome) {
    const home = await fetchHome(lang);
    const acf  = home?.acf ?? {};
    const hero = {
      title         : acf.hero_title ?? 'Willkommen',
      subtitle_one  : acf.hero_sub_one ?? '',
      subtitle_two  : acf.hero_sub_two ?? '',
      subtitle_three: acf.hero_sub_three ?? '',
      button_lang   : acf.button_lang ?? '',
      url           : acf.hero_bg.url ?? '',
    };

    const langUrls = { de: '/de', pl: '/pl', en: '/en' };

    return (
      <>
        <Navbar items={nav} lang={lang} langUrls={langUrls} />
        <Hero
          title={hero.title}
          subtitle_one={hero.subtitle_one}
          subtitle_two={hero.subtitle_two}
          subtitle_three={hero.subtitle_three}
          button_lang={hero.button_lang}
          url={hero.url}
        />
        <Footer />
      </>
    );
  }

  // ------ WP PAGES & FALLBACK 404 ------
  const page = await fetchPage(slug, lang);
  if (!page) return <h1>404 – Not found</h1>;

  return (
    <>
      <Navbar
        items={nav}
        lang={lang}
        langUrls={page._links.language_urls}
      />
      <main style={{ padding: '2rem' }}>
        <h1 dangerouslySetInnerHTML={{ __html: page.title.rendered }} />
        <article dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
      </main>
      <Footer />
    </>
  );
}
