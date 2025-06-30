import {fetchHome, fetchPage, fetchNav, imgUrl} from '@/lib/wp';
import Hero from '@/sections/Hero';
import Navbar from '@/components/NavbarSpirit';
import Footer from '@/components/Footer';

export const revalidate = 600;
const DEFAULT_SLUG = 'home';       // zmień jeśli w WP slug ≠ 'home'

/* helper – params.slug => zawsze tablica */
const arr = x => (!x ? [] : Array.isArray(x) ? x : [x]);

function parse(params) {
  const seg   = arr(params.slug);
  const langs = ['de','pl','en'];

  const isLang = langs.includes(seg[0]);
  const lang   = isLang ? seg[0] : 'de';
  const rest   = isLang ? seg.slice(1) : seg;
  const slug   = rest[0] ?? DEFAULT_SLUG;

  return {lang, slug, seg};
}

export default async function Page({params}) {
  const {lang, slug, seg} = parse(await params);

  /* ---------- HOME (/, /pl, /en) --------------------------- */
  const isHome =
    seg.length === 0              ||           // "/"
    (seg.length === 1 && ['de','pl','en'].includes(seg[0]));

  if (isHome) {
    const [home, nav] = await Promise.all([fetchHome(lang), fetchNav(lang)]);
    const acf = home?.acf ?? {};
    const hero = {
      title : acf.hero_title ?? 'Willkommen',
      sub_one   : acf.hero_sub_one   ?? '',
      sub_two   : acf.hero_sub_two   ?? '',
      sub_three   : acf.hero_sub_three   ?? '',
      button_lang   : acf.button_lang   ?? '',
      url   : acf.hero_bg.url ?? ''
    };

    const langUrls = {de:'/de', pl:'/pl', en:'/en'};

    return (
      <>
        <Navbar items={nav} lang={lang} langUrls={langUrls}/>
            <Hero 
            title={hero.title} 
            subtitle_one={hero.sub_one} 
            subtitle_two={hero.sub_two} 
            subtitle_three={hero.sub_three}
            button_lang={hero.button_lang}
            url={hero.url}
        />
        <Footer />
      </>
    );
  }

  /* ---------- POZOSTAŁE STRONY ----------------------------- */
  const [page, nav] = await Promise.all([fetchPage(slug, lang), fetchNav(lang)]);
  if (!page) return <h1>404 – Not found</h1>;

  return (
    <>
      <Navbar items={nav} lang={lang} langUrls={page._links.language_urls}/>
      <main style={{padding:'2rem'}}>
        <h1 dangerouslySetInnerHTML={{__html: page.title.rendered}}/>
        <article dangerouslySetInnerHTML={{__html: page.content.rendered}}/>
      </main>
      <Footer />
    </>
  );
}
