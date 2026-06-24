const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'dev.db'));

// ── Admin user ──
const hash = bcrypt.hashSync('GrzeIwo#2468', 10);
db.prepare(`INSERT OR IGNORE INTO admins (username, passwordHash) VALUES (?, ?)`).run('admin', hash);

// ── Nav Items ──
const insertNav = db.prepare(`INSERT INTO nav_items (lang, title, path, sortOrder) VALUES (?, ?, ?, ?)`);
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
for (const row of navData) insertNav.run(...row);

// ── Home Pages ──
const insertHome = db.prepare(`INSERT INTO home_pages (lang, heroTitle, heroSubOne, heroSubTwo, heroSubThree, buttonLang, heroBg) VALUES (?, ?, ?, ?, ?, ?, ?)`);
insertHome.run('de', 'GRP-BAU', 'Innenausbau & Trockenbau', 'Malerarbeiten & Tapezieren', 'Bodenbeläge & Fliesen', 'Angebot anfragen', '/uploads/hero-bg.jpg');
insertHome.run('pl', 'GRP-BAU', 'Wykończenia wnętrz i zabudowy', 'Malowanie i tapetowanie', 'Podłogi i płytki', 'Poproś o wycenę', '/uploads/hero-bg.jpg');
insertHome.run('en', 'GRP-BAU', 'Interior finishing & drywall', 'Painting & wallpapering', 'Flooring & tiles', 'Request a quote', '/uploads/hero-bg.jpg');

// ── About Pages ──
const insertAbout = db.prepare(`INSERT INTO about_pages (lang, aboutTitle, aboutIntro, aboutPointsRaw, aboutCtaText) VALUES (?, ?, ?, ?, ?)`);
insertAbout.run('de', 'Über uns',
  '<p>GRP-BAU ist ein zuverlässiges Bauunternehmen mit Sitz in Sulingen. Wir spezialisieren uns auf Innenausbau, Trockenbau, Malerarbeiten und Bodenbeläge.</p>',
  'Erfahrenes Team mit langjähriger Praxis\nTermintreue und Zuverlässigkeit\nHohe Qualität zu fairen Preisen\nKostenlose Beratung und Angebotserstellung',
  'Kontaktieren Sie uns');
insertAbout.run('pl', 'O nas',
  '<p>GRP-BAU to rzetelna firma budowlana z siedzibą w Sulingen. Specjalizujemy się w wykończeniach wnętrz, zabudowach z płyt g-k, malowaniu oraz układaniu podłóg.</p>',
  'Doświadczony zespół z wieloletnią praktyką\nTerminowość i rzetelność\nWysoka jakość w uczciwych cenach\nBezpłatna wycena i doradztwo',
  'Skontaktuj się z nami');
insertAbout.run('en', 'About us',
  '<p>GRP-BAU is a reliable construction company based in Sulingen. We specialize in interior finishing, drywall, painting, and flooring.</p>',
  'Experienced team with years of practice\nPunctuality and reliability\nHigh quality at fair prices\nFree consultation and quotes',
  'Get in touch');

// ── Services ──
const insertService = db.prepare(`INSERT INTO services (lang, title, iconUrl, excerpt, featuresRaw, sortOrder) VALUES (?, ?, ?, ?, ?, ?)`);
const services = [
  ['de', 'Trockenbau', '/uploads/icons/trockenbau.png', 'Professioneller Trockenbau und Innenausbau', 'Wände und Decken\nDämmung\nSchallschutz\nBrandschutz', 0],
  ['de', 'Malerarbeiten', '/uploads/icons/maler.png', 'Malerarbeiten und Tapezierarbeiten', 'Innenanstrich\nFassade\nTapezieren\nDekorative Techniken', 1],
  ['de', 'Bodenbeläge', '/uploads/icons/boden.png', 'Verlegung von Bodenbelägen aller Art', 'Laminat\nParkett\nVinyl\nFliesen', 2],
  ['pl', 'Zabudowy G-K', '/uploads/icons/trockenbau.png', 'Profesjonalne zabudowy z płyt gipsowo-kartonowych', 'Ściany i sufity\nIzolacja\nWygłuszenie\nOchrona przeciwpożarowa', 0],
  ['pl', 'Malowanie', '/uploads/icons/maler.png', 'Malowanie i tapetowanie wnętrz', 'Malowanie wnętrz\nElewacje\nTapetowanie\nTechniki dekoracyjne', 1],
  ['pl', 'Podłogi', '/uploads/icons/boden.png', 'Układanie podłóg wszelkiego rodzaju', 'Laminat\nParkiet\nWinyl\nPłytki', 2],
  ['en', 'Drywall', '/uploads/icons/trockenbau.png', 'Professional drywall and interior finishing', 'Walls and ceilings\nInsulation\nSoundproofing\nFire protection', 0],
  ['en', 'Painting', '/uploads/icons/maler.png', 'Painting and wallpapering services', 'Interior painting\nFacade\nWallpapering\nDecorative techniques', 1],
  ['en', 'Flooring', '/uploads/icons/boden.png', 'Installation of all types of flooring', 'Laminate\nParquet\nVinyl\nTiles', 2],
];
for (const row of services) insertService.run(...row);

db.close();
console.log('Seed completed successfully!');
