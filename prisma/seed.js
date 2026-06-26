const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // ── Admin user ──
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = bcrypt.hashSync(adminPass, 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash: hash },
  });

  // ── Nav Items ──
  const navData = [
    ['de', 'Start', '/de/', 0],
    ['de', 'Leistungen', '/de/leistungen', 1],
    ['de', 'Über uns', '/de/ueber-uns', 2],
    ['de', 'Galerie', '/de/galerie', 3],
    ['de', 'Kontakt', '/de/kontakt', 4],
    ['pl', 'Start', '/pl/', 0],
    ['pl', 'Oferta', '/pl/uslugi', 1],
    ['pl', 'O nas', '/pl/o-nas', 2],
    ['pl', 'Galeria', '/pl/galeria', 3],
    ['pl', 'Kontakt', '/pl/kontakt', 4],
    ['en', 'Home', '/en/', 0],
    ['en', 'Services', '/en/services', 1],
    ['en', 'About us', '/en/about-us', 2],
    ['en', 'Gallery', '/en/gallery', 3],
    ['en', 'Contact', '/en/contact', 4],
  ];
  for (const [lang, title, path, sortOrder] of navData) {
    await prisma.navItem.create({ data: { lang, title, path, sortOrder } });
  }

  // ── Home Pages ──
  const homes = [
    { lang: 'de', heroTitle: 'GRP-BAU', heroSubOne: 'Innenausbau & Trockenbau', heroSubTwo: 'Malerarbeiten & Tapezieren', heroSubThree: 'Bodenbeläge & Fliesen', buttonLang: 'Angebot anfragen', heroBg: '/uploads/hero-bg.jpg' },
    { lang: 'pl', heroTitle: 'GRP-BAU', heroSubOne: 'Wykończenia wnętrz i zabudowy', heroSubTwo: 'Malowanie i tapetowanie', heroSubThree: 'Podłogi i płytki', buttonLang: 'Poproś o wycenę', heroBg: '/uploads/hero-bg.jpg' },
    { lang: 'en', heroTitle: 'GRP-BAU', heroSubOne: 'Interior finishing & drywall', heroSubTwo: 'Painting & wallpapering', heroSubThree: 'Flooring & tiles', buttonLang: 'Request a quote', heroBg: '/uploads/hero-bg.jpg' },
  ];
  for (const data of homes) await prisma.homePage.create({ data });

  // ── About Pages ──
  const abouts = [
    { lang: 'de', aboutTitle: 'Über uns', aboutIntro: '<p>GRP-BAU ist ein zuverlässiges Bauunternehmen mit Sitz in Sulingen.</p>', aboutPointsRaw: 'Erfahrenes Team\nTermintreue und Zuverlässigkeit\nHohe Qualität zu fairen Preisen\nKostenlose Beratung', aboutCtaText: 'Kontaktieren Sie uns' },
    { lang: 'pl', aboutTitle: 'O nas', aboutIntro: '<p>GRP-BAU to rzetelna firma budowlana z siedzibą w Sulingen.</p>', aboutPointsRaw: 'Doświadczony zespół\nTerminowość i rzetelność\nWysoka jakość w uczciwych cenach\nBezpłatna wycena', aboutCtaText: 'Skontaktuj się z nami' },
    { lang: 'en', aboutTitle: 'About us', aboutIntro: '<p>GRP-BAU is a reliable construction company based in Sulingen.</p>', aboutPointsRaw: 'Experienced team\nPunctuality and reliability\nHigh quality at fair prices\nFree consultation', aboutCtaText: 'Get in touch' },
  ];
  for (const data of abouts) await prisma.aboutPage.create({ data });

  // ── Services ──
  const services = [
    { lang: 'de', title: 'Trockenbau', iconUrl: '/uploads/icons/trockenbau.png', excerpt: 'Professioneller Trockenbau und Innenausbau', featuresRaw: 'Wände und Decken\nDämmung\nSchallschutz\nBrandschutz', sortOrder: 0 },
    { lang: 'de', title: 'Malerarbeiten', iconUrl: '/uploads/icons/maler.png', excerpt: 'Malerarbeiten und Tapezierarbeiten', featuresRaw: 'Innenanstrich\nFassade\nTapezieren\nDekorative Techniken', sortOrder: 1 },
    { lang: 'de', title: 'Bodenbeläge', iconUrl: '/uploads/icons/boden.png', excerpt: 'Verlegung von Bodenbelägen aller Art', featuresRaw: 'Laminat\nParkett\nVinyl\nFliesen', sortOrder: 2 },
    { lang: 'pl', title: 'Zabudowy G-K', iconUrl: '/uploads/icons/trockenbau.png', excerpt: 'Profesjonalne zabudowy z płyt g-k', featuresRaw: 'Ściany i sufity\nIzolacja\nWygłuszenie\nOchrona ppoż.', sortOrder: 0 },
    { lang: 'pl', title: 'Malowanie', iconUrl: '/uploads/icons/maler.png', excerpt: 'Malowanie i tapetowanie wnętrz', featuresRaw: 'Malowanie wnętrz\nElewacje\nTapetowanie\nTechniki dekoracyjne', sortOrder: 1 },
    { lang: 'pl', title: 'Podłogi', iconUrl: '/uploads/icons/boden.png', excerpt: 'Układanie podłóg wszelkiego rodzaju', featuresRaw: 'Laminat\nParkiet\nWinyl\nPłytki', sortOrder: 2 },
    { lang: 'en', title: 'Drywall', iconUrl: '/uploads/icons/trockenbau.png', excerpt: 'Professional drywall and interior finishing', featuresRaw: 'Walls and ceilings\nInsulation\nSoundproofing\nFire protection', sortOrder: 0 },
    { lang: 'en', title: 'Painting', iconUrl: '/uploads/icons/maler.png', excerpt: 'Painting and wallpapering services', featuresRaw: 'Interior painting\nFacade\nWallpapering\nDecorative techniques', sortOrder: 1 },
    { lang: 'en', title: 'Flooring', iconUrl: '/uploads/icons/boden.png', excerpt: 'Installation of all types of flooring', featuresRaw: 'Laminate\nParquet\nVinyl\nTiles', sortOrder: 2 },
  ];
  for (const data of services) await prisma.service.create({ data });

  console.log('Seed completed!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
