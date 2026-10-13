// src/app/[[...slug]]/page.jsx

import { notFound } from 'next/navigation';
import {
  fetchHome, fetchNav, fetchAbout, fetchLeistungen, fetchGallery,
  fetchPageContent, fetchServiceBySlug,
} from '@/lib/db';
import { resolveRoute, pageUrls, pagePath, servicePath, serviceUrls } from '@/lib/seo';
import { buildPageMetadata, buildServiceMetadata, pageDefaults } from '@/lib/metadata';
import { localBusinessLd, serviceLd, breadcrumbLd } from '@/lib/jsonld';
import { parseFaq } from '@/lib/markdown';
import Hero from '@/sections/Hero';
import HomeContent from '@/sections/HomeContent';
import About from '@/components/About';
import Navbar from '@/components/NavbarSpirit';
import Footer from '@/components/Footer';
import Services from '@/components/Services';
import ServiceDetail from '@/sections/ServiceDetail';
import GallerySection from '@/sections/GallerySection';
import ContactSection from '@/sections/ContactSection';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

const CRUMB_HOME = { de: 'Start', pl: 'Strona główna', en: 'Home' };
const CRUMB_SERVICES = { de: 'Leistungen', pl: 'Usługi', en: 'Services' };

// treść strony z CMS, puste pola uzupełnione tekstami domyślnymi
async function pageContent(page, lang) {
  const row = await fetchPageContent(page, lang);
  const d = pageDefaults(page, lang);
  const pick = f => row?.[f] || d[f] || '';
  return {
    h1: pick('h1'),
    intro: pick('intro'),
    body: pick('body'),
    faq: parseFaq(pick('faqRaw')),
    metaTitle: pick('metaTitle'),
    metaDescription: pick('metaDescription'),
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const route = resolveRoute(slug);
  if (!route) return {};

  if (route.page === 'service') {
    const service = await fetchServiceBySlug(route.lang, route.serviceSlug);
    if (!service) return {};
    return buildServiceMetadata(service, route.lang);
  }

  const row = await fetchPageContent(route.page, route.lang);
  return buildPageMetadata(route.page, route.lang, row);
}

export default async function Page({ params: paramsPromise }) {
  const params = await paramsPromise;
  const route = resolveRoute(params.slug);
  if (!route) notFound();

  const { lang, page } = route;
  const nav = await fetchNav(lang);
  const business = <JsonLd data={localBusinessLd(lang)} />;

  // ------ PODSTRONA USŁUGI ------
  if (page === 'service') {
    const service = await fetchServiceBySlug(lang, route.serviceSlug);
    if (!service) notFound();

    const [allServices, images] = await Promise.all([
      fetchLeistungen(lang),
      service.key ? fetchGallery(lang, service.key) : [],
    ]);
    const path = servicePath(lang, service.slug);
    const name = service.title.rendered;
    const crumbs = [
      { name: CRUMB_HOME[lang], path: pagePath('home', lang) },
      { name: CRUMB_SERVICES[lang], path: pagePath('services', lang) },
      { name, path },
    ];

    return (
      <>
        <Navbar items={nav} lang={lang} langUrls={{ ...pageUrls('services'), ...serviceUrls(service.slugs) }} />
        <ServiceDetail
          service={service}
          faq={parseFaq(service.faqRaw)}
          images={images}
          otherServices={allServices.filter(s => s.id !== service.id && s.slug)}
          breadcrumbs={crumbs}
          contactPath={pagePath('contact', lang)}
          lang={lang}
        />
        <Footer />
        {business}
        <JsonLd data={serviceLd({ name, description: service.acf.leistung_excerpt, path, image: images[0]?.url })} />
        <JsonLd data={breadcrumbLd(crumbs)} />
      </>
    );
  }

  const langUrls = pageUrls(page);
  const content = await pageContent(page, lang);

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
        <ContactSection
          heading={content.h1}
          introMarkdown={content.intro}
          introHtml={intro}
          introForm={introForm}
          lang={lang}
        />
        <Faq items={content.faq} lang={lang} />
        <Footer />
        {business}
      </>
    );
  }

  // ------ GALERIA / GALLERY ------
  if (page === 'gallery') {
    const [images, services] = await Promise.all([fetchGallery(lang), fetchLeistungen(lang)]);
    const categories = services
      .filter(s => s.key && images.some(img => img.category === s.key))
      .map(s => ({ key: s.key, label: s.title.rendered, path: s.slug ? servicePath(lang, s.slug) : null }));

    return (
      <>
        <Navbar items={nav} lang={lang} langUrls={langUrls} />
        <GallerySection
          images={images}
          categories={categories}
          heading={content.h1}
          intro={content.intro}
          lang={lang}
        />
        <Footer />
        {business}
      </>
    );
  }

  // ------ LEISTUNGEN (Usługi) ------
  if (page === 'services') {
    const services = await fetchLeistungen(lang);

    return (
      <>
        <Navbar items={nav} lang={lang} langUrls={langUrls} />
        <Services
          list={services}
          heading={content.h1}
          intro={content.intro}
          body={content.body}
          contactPath={pagePath('contact', lang)}
          lang={lang}
        />
        <Faq items={content.faq} lang={lang} />
        <Footer />
        {business}
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
          heading={content.h1 || about.about_title}
          intro={{ title: about.about_title, text: about.about_intro }}
          introMarkdown={content.intro}
          body={content.body}
          points={points}
          ctaText={about.about_cta_text}
          langUrl={pagePath('contact', lang)}
          lang={lang}
        />
        <Faq items={content.faq} lang={lang} />
        <Footer />
        {business}
      </>
    );
  }

  // ------ HOME ------
  const [home, services] = await Promise.all([fetchHome(lang), fetchLeistungen(lang)]);
  const acf  = home?.acf ?? {};
  const hero = {
    title         : acf.hero_title ?? 'GRP Bau',
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
        h1={content.h1}
        title={hero.title}
        subtitle_one={hero.subtitle_one}
        subtitle_two={hero.subtitle_two}
        subtitle_three={hero.subtitle_three}
        button_lang={hero.button_lang}
        url={hero.url}
        lang={lang}
      />
      <HomeContent
        intro={content.intro}
        body={content.body}
        services={services.filter(s => s.slug)}
        servicesPath={pagePath('services', lang)}
        contactPath={pagePath('contact', lang)}
        lang={lang}
      />
      <Faq items={content.faq} lang={lang} />
      <Footer />
      {business}
    </>
  );
}
