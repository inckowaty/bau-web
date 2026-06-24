// src/app/[[...slug]]/page.jsx

import { fetchHome, fetchNav, fetchAbout, fetchLeistungen, fetchGallery, fetchKontakt } from '@/lib/db';
import Hero from '@/sections/Hero';
import About from '@/components/About';
import Navbar from '@/components/NavbarSpirit';
import Footer from '@/components/Footer';
import Services from '@/components/Services';
import GallerySection from '@/sections/GallerySection';
import ContactSection from '@/sections/ContactSection';

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

const gallerySlugs = { de: 'galerie', pl: 'galeria', en: 'gallery' };
const contactSlugs = { de: 'kontakt', pl: 'kontakt', en: 'contact' };
const servicesSlugs = { de: 'leistungen', pl: 'uslugi', en: 'services' };
const aboutSlugs = { de: 'ueber-uns', pl: 'o-nas', en: 'about-us' };

export default async function Page({ params: paramsPromise }) {
  const params = await paramsPromise;
  const { lang, slug, seg } = parse(params);

  // zawsze potrzebujemy nav
  const nav = await fetchNav(lang);

  // ------ KONTAKT ------
  if (slug === contactSlugs[lang]) {

  const [kontaktItems, navItems] = await Promise.all([
    fetchKontakt(lang),
    fetchNav(lang)
  ]);
  const intro = {
    de: "<h2>Kontaktinformationen</h2>",
    pl: "<h2>Informacje kontaktowe</h2>",
    en: "<h2>Contact information</h2>"
  }[lang];

  const introForm = {
    de: "<h2>Kontaktieren Sie uns:</h2>",
    pl: "<h2>Skontaktuj się z nami:</h2>",
    en: "<h2>Get in touch with us:</h2>"
  }[lang];

  const kontaktPost = kontaktItems[0];
  if (!kontaktPost) {
    return <h1>404 – Not found</h1>;
  }

    const langUrls = {
      de: `/de/${contactSlugs.de}`,
      pl: `/pl/${contactSlugs.pl}`,
      en: `/en/${contactSlugs.en}`,
    };

    return (
      <>
        <Navbar items={navItems} lang={lang} langUrls={langUrls} />
        <ContactSection introHtml={intro} introForm={introForm} lang={lang}/>
        <Footer />
      </>
    );
  }



  // ------ GALERIA / GALLERY ------
 if (slug === gallerySlugs[lang]) {
     const [images, navItems] = await Promise.all([
       fetchGallery(lang),
       fetchNav(lang)
     ]);
     const langUrls = {
       de: `/de/${gallerySlugs.de}`,
       pl: `/pl/${gallerySlugs.pl}`,
       en: `/en/${gallerySlugs.en}`,
     };

     return (
       <>
         <Navbar items={navItems} lang={lang} langUrls={langUrls} />
         <GallerySection images={images} lang={lang} />
         <Footer />
       </>
     );
   }

  // ------ LEISTUNGEN (Usługi) ------

  if (slug === servicesSlugs[lang]) {
    const services = await fetchLeistungen(lang);
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

  if (slug === aboutSlugs[lang]) {
    const about = await fetchAbout(lang);
    const points = about.about_points_raw
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);

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
      url           : acf.hero_bg?.url ?? '',
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
          lang={lang}
        />
        <Footer />
      </>
    );
  }

  // ------ FALLBACK 404 ------
  return <h1>404 – Not found</h1>;
}
