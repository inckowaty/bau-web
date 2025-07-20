// src/app/[[...slug]]/page.jsx

import { fetchHome, fetchPage, fetchNav, fetchAbout, fetchLeistungen, fetchGallery, fetchKontakt, imgUrl } from '@/lib/wp';
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

export default async function Page({ params }) {
  const { lang, slug, seg } = parse(params);

  // zawsze potrzebujemy nav
  const nav = await fetchNav(lang);

  // ------ KONTAKT ------
  if (slug === contactSlugs[lang]) {

  // fetchKontakt zwraca tablicę, więc pierwszym elementem będzie 'kontaktItems'
  const [kontaktItems, nav] = await Promise.all([
    fetchKontakt(lang),
    fetchNav(lang)
  ]);
  // można też pobrać ACF-owe intro z WP, ale jeśli nie masz, po prostu:
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

  // bierzemy pierwszy element; jeśli brak, pokaż 404
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
        <Navbar items={nav} lang={lang} langUrls={langUrls} />
        <ContactSection introHtml={intro} introForm={introForm} lang={lang}/>
        <Footer />
      </>
    );
  }

  

  // ------ GALERIA / GALLERY ------
 if (slug === gallerySlugs[lang]) {
     // fetch CPT gallery + menu
     const [items, nav] = await Promise.all([
       fetchGallery(lang),
       fetchNav(lang)
     ]);
     const langUrls = {
       de: `/de/${gallerySlugs.de}`,
       pl: `/pl/${gallerySlugs.pl}`,
       en: `/en/${gallerySlugs.en}`,
     };
  
      // z każdego wpisu wypłaszczamy wszystkie pola gallery_img_N → ich .url
      const images = items
         .flatMap(item => {
             const acf = item.acf || {};
             return Object.entries(acf)
               .filter(([k]) => /^gallery_img_\d+$/.test(k))
               .map(([, val]) => {
                 if (!val) return null;
                 if (typeof val === "object" && val.url) {
                   return { url: val.url, width: val.width, height: val.height };
                 }
                 if (typeof val === "string") {
                   return { url: val, width: undefined, height: undefined };
                 }
                 if (typeof val === "number") {
                   // fetch media by ID client-side?
                   return { url: imgUrl(val), width: undefined, height: undefined };
                 }
                 return null;
               });
           })
           .filter(Boolean);
  
     return (
       <>
         <Navbar items={nav} lang={lang} langUrls={langUrls} />
         <GallerySection images={images} lang={lang} />
         <Footer />
       </>
     );
   }

  // ------ LEISTUNGEN (Usługi) ------
  // mapujemy slug per język
  
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
          lang={lang}
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
