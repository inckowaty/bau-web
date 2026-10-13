// prisma/content-migrations.js
// Jednorazowe migracje TREŚCI (nie schematu). Uruchamiane przy starcie (scripts/startup.js)
// po `prisma db push`. Każda migracja wykonuje się raz (tabela content_migrations).
// Zasada: nigdy nie nadpisujemy tego, co ktoś zmienił w panelu – uzupełniamy tylko puste pola
// albo podmieniamy teksty, które wciąż są dokładnie takie jak w pierwotnym seedzie.

const path = require('path');
const { PrismaClient } = require('@prisma/client');

const content = require(path.join(__dirname, 'content', 'seo-content.js'));
const galleryContent = require(path.join(__dirname, 'content', 'gallery-content.js'));

const LANGS = ['de', 'pl', 'en'];

// pierwotne teksty z prisma/seed.js – tylko takie wolno podmienić
const SEED_SERVICES = {
  trockenbau: {
    de: ['Trockenbau', 'Professioneller Trockenbau und Innenausbau', 'Wände und Decken\nDämmung\nSchallschutz\nBrandschutz'],
    pl: ['Zabudowy G-K', 'Profesjonalne zabudowy z płyt g-k', 'Ściany i sufity\nIzolacja\nWygłuszenie\nOchrona ppoż.'],
    en: ['Drywall', 'Professional drywall and interior finishing', 'Walls and ceilings\nInsulation\nSoundproofing\nFire protection'],
  },
  renovierung: {
    de: ['Malerarbeiten', 'Malerarbeiten und Tapezierarbeiten', 'Innenanstrich\nFassade\nTapezieren\nDekorative Techniken'],
    pl: ['Malowanie', 'Malowanie i tapetowanie wnętrz', 'Malowanie wnętrz\nElewacje\nTapetowanie\nTechniki dekoracyjne'],
    en: ['Painting', 'Painting and wallpapering services', 'Interior painting\nFacade\nWallpapering\nDecorative techniques'],
  },
  bodenleger: {
    de: ['Bodenbeläge', 'Verlegung von Bodenbelägen aller Art', 'Laminat\nParkett\nVinyl\nFliesen'],
    pl: ['Podłogi', 'Układanie podłóg wszelkiego rodzaju', 'Laminat\nParkiet\nWinyl\nPłytki'],
    en: ['Flooring', 'Installation of all types of flooring', 'Laminate\nParquet\nVinyl\nTiles'],
  },
};

const SEED_HERO = {
  de: ['GRP-BAU', 'Innenausbau & Trockenbau', 'Malerarbeiten & Tapezieren', 'Bodenbeläge & Fliesen'],
  pl: ['GRP-BAU', 'Wykończenia wnętrz i zabudowy', 'Malowanie i tapetowanie', 'Podłogi i płytki'],
  en: ['GRP-BAU', 'Interior finishing & drywall', 'Painting & wallpapering', 'Flooring & tiles'],
};

const SEED_ABOUT = {
  de: ['<p>GRP-BAU ist ein zuverlässiges Bauunternehmen mit Sitz in Sulingen.</p>', 'Erfahrenes Team\nTermintreue und Zuverlässigkeit\nHohe Qualität zu fairen Preisen\nKostenlose Beratung'],
  pl: ['<p>GRP-BAU to rzetelna firma budowlana z siedzibą w Sulingen.</p>', 'Doświadczony zespół\nTerminowość i rzetelność\nWysoka jakość w uczciwych cenach\nBezpłatna wycena'],
  en: ['<p>GRP-BAU is a reliable construction company based in Sulingen.</p>', 'Experienced team\nPunctuality and reliability\nHigh quality at fair prices\nFree consultation'],
};

const norm = s => (s ?? '').replace(/\r\n?/g, '\n').trim();
const same = (a, b) => norm(a) === norm(b);

// tylko pola, które są puste w bazie, a mają wartość domyślną
function emptyOnly(row, data, fields) {
  const out = {};
  for (const f of fields) if (!norm(row[f]) && norm(data[f])) out[f] = data[f];
  return out;
}

const PAGE_FIELDS = ['h1', 'intro', 'body', 'faqRaw', 'metaTitle', 'metaDescription'];
const SERVICE_PAGE_FIELDS = ['slug', 'h1', 'body', 'faqRaw', 'metaTitle', 'metaDescription'];

async function seoContent2026(prisma, log) {
  // 1) treści stron
  for (const [page, byLang] of Object.entries(content.pages || {})) {
    for (const lang of LANGS) {
      const data = byLang[lang];
      if (!data) continue;
      const row = await prisma.pageContent.findUnique({ where: { page_lang: { page, lang } } });
      if (!row) {
        await prisma.pageContent.create({ data: { page, lang, ...pick(data, PAGE_FIELDS) } });
        log(`page ${page}/${lang}: created`);
      } else {
        const upd = emptyOnly(row, data, PAGE_FIELDS);
        if (Object.keys(upd).length) {
          await prisma.pageContent.update({ where: { id: row.id }, data: upd });
          log(`page ${page}/${lang}: filled ${Object.keys(upd).join(',')}`);
        }
      }
    }
  }

  // 2) usługi (5 usług z busa; stare karty z seeda zamieniane tylko, jeśli nikt ich nie edytował)
  const defs = content.services || [];
  for (const lang of LANGS) {
    const rows = await prisma.service.findMany({ where: { lang } });
    for (let i = 0; i < defs.length; i++) {
      const def = defs[i];
      const data = def[lang];
      if (!data) continue;
      const seed = SEED_SERVICES[def.key]?.[lang];

      const keyed = rows.find(r => r.key === def.key);
      if (keyed) {
        const upd = emptyOnly(keyed, data, SERVICE_PAGE_FIELDS);
        if (Object.keys(upd).length) await prisma.service.update({ where: { id: keyed.id }, data: upd });
        continue;
      }

      const legacy = seed && rows.find(r => !r.key && r.title === seed[0]);
      if (legacy) {
        const untouched = same(legacy.excerpt, seed[1]) && same(legacy.featuresRaw, seed[2]);
        const upd = untouched
          ? { key: def.key, sortOrder: i, ...pick(data, ['title', 'excerpt', 'featuresRaw', ...SERVICE_PAGE_FIELDS]) }
          : { key: def.key, ...emptyOnly(legacy, data, SERVICE_PAGE_FIELDS) };
        await prisma.service.update({ where: { id: legacy.id }, data: upd });
        legacy.key = def.key;
        log(`service ${def.key}/${lang}: ${untouched ? 'replaced seed text' : 'linked (edited text kept)'}`);
        continue;
      }

      // nowa usługa – ikona wspólna z innym językiem, jeśli już jest
      const sibling = await prisma.service.findFirst({ where: { key: def.key, NOT: { iconUrl: '' } } });
      await prisma.service.create({
        data: {
          lang,
          key: def.key,
          sortOrder: i,
          iconUrl: sibling?.iconUrl || '',
          ...pick(data, ['title', 'excerpt', 'featuresRaw', ...SERVICE_PAGE_FIELDS]),
        },
      });
      log(`service ${def.key}/${lang}: created`);
    }
  }

  // 3) hero – tylko jeśli wciąż ma teksty z seeda
  for (const lang of LANGS) {
    const data = content.hero?.[lang];
    const seed = SEED_HERO[lang];
    if (!data) continue;
    const row = await prisma.homePage.findUnique({ where: { lang } });
    if (!row) continue;
    const upd = {};
    if (data.heroTitle && same(row.heroTitle, seed[0])) upd.heroTitle = data.heroTitle;
    if (same(row.heroSubOne, seed[1]) && same(row.heroSubTwo, seed[2]) && same(row.heroSubThree, seed[3])) {
      Object.assign(upd, pick(data, ['heroSubOne', 'heroSubTwo', 'heroSubThree']));
    }
    if (Object.keys(upd).length) {
      await prisma.homePage.update({ where: { id: row.id }, data: upd });
      log(`hero/${lang}: updated ${Object.keys(upd).join(',')}`);
    }
  }

  // 4) o nas – tylko jeśli wciąż ma teksty z seeda
  for (const lang of LANGS) {
    const data = content.about?.[lang];
    const seed = SEED_ABOUT[lang];
    if (!data) continue;
    const row = await prisma.aboutPage.findUnique({ where: { lang } });
    if (!row) continue;
    const upd = {};
    if (data.aboutPointsRaw && same(row.aboutPointsRaw, seed[1])) upd.aboutPointsRaw = data.aboutPointsRaw;
    if (Object.keys(upd).length) {
      await prisma.aboutPage.update({ where: { id: row.id }, data: upd });
      log(`about/${lang}: updated ${Object.keys(upd).join(',')}`);
    }
  }

  // 5) galeria – alt, podpis i kategoria tylko dla pustych pól (dopasowanie po nazwie pliku)
  const images = await prisma.galleryImage.findMany();
  for (const img of images) {
    const data = galleryContent[path.basename(img.url || '')];
    if (!data) continue;
    const upd = {};
    if (!norm(img.category) && data.category) upd.category = data.category;
    const t = data[img.lang];
    if (t) Object.assign(upd, emptyOnly(img, t, ['alt', 'caption']));
    if (Object.keys(upd).length) await prisma.galleryImage.update({ where: { id: img.id }, data: upd });
  }
  log(`gallery: checked ${images.length} rows`);
}

function pick(obj, fields) {
  const out = {};
  for (const f of fields) if (obj[f] !== undefined) out[f] = obj[f];
  return out;
}

const MIGRATIONS = [
  { id: '2026-10-13-seo-content', run: seoContent2026 },
];

async function main() {
  const prisma = new PrismaClient();
  const log = msg => console.log(`[content] ${msg}`);
  try {
    for (const m of MIGRATIONS) {
      const done = await prisma.contentMigration.findUnique({ where: { id: m.id } });
      if (done) continue;
      log(`applying ${m.id}`);
      await m.run(prisma, log);
      await prisma.contentMigration.create({ data: { id: m.id } });
      log(`applied ${m.id}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { main, MIGRATIONS };

if (require.main === module) {
  main().catch(e => {
    console.error('[content] migration failed:', e);
    process.exit(1);
  });
}
