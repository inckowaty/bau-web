// src/app/[[...slug]]/page.jsx

import { notFound } from 'next/navigation';
import { fetchHome, fetchNav, fetchAbout, fetchLeistungen, fetchGallery } from '@/lib/db';
import { resolveRoute, pageUrls, pagePath, buildMetadata } from '@/lib/seo';
import Hero from '@/sections/Hero';
import About from '@/components/About';
import Navbar from '@/components/NavbarSpirit';
import Footer from '@/components/Footer';
import Services from '@/components/Services';
import GallerySection from '@/sections/GallerySection';
import ContactSection from '@/sections/ContactSection';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const route = resolveRoute(slug);
  if (!route) return {};
  return buildMetadata(route.page, route.lang);
}

export default async function Page({ params: paramsPromise }) {
  const params = await paramsPromise;
  const route = resolveRoute(params.slug);
  if (!route) notFound();

  const { lang, page } = route;
  const langUrls = pageUrls(page);

  // zawsze potrzebujemy nav
  const nav = await fetchNav(lang);

  // ------ KONTAKT ------
  if (page === 'contact') {
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

    return (
      <>
        <Navbar items={nav} lang={lang} langUrls={langUrls} />
        <ContactSection introHtml={intro} introForm={introForm} lang={lang}/>
        <Footer />
      </>
    );
  }

  // ------ GALERIA / GALLERY ------
  if (page === 'gallery') {
    const images = await fetchGallery(lang);

    return (
      <>
        <Navbar items={nav} lang={lang} langUrls={langUrls} />
        <GallerySection images={images} lang={lang} />
        <Footer />
      </>
    );
  }

  // ------ LEISTUNGEN (Usługi) ------
  if (page === 'services') {
    const services = await fetchLeistungen(lang);

    return (
      <>
        <Navbar items={nav} lang={lang} langUrls={langUrls} />
        <Services list={services} lang={lang} />
        <Footer />
      </>
    );
  }

  // ------ O NAS (About) ------
  if (page === 'about') {
    const about = await fetchAbout(lang);
    if (!about) notFound();

    const points = about.about_points_raw
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);

    return (
      <>
        <Navbar items={nav} lang={lang} langUrls={langUrls} />
        <About
          intro={{ title: about.about_title, text: about.about_intro }}
          points={points}
          ctaText={about.about_cta_text}
          langUrl={pagePath('contact', lang)}
          lang={lang}
        />
        <Footer />
      </>
    );
  }

  // ------ HOME ------
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
