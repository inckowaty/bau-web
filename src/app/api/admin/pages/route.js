// Treści i SEO stron (PageContent): home, services, gallery, about, contact × de, pl, en
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import defaults from '../../../../../prisma/content/seo-content';

const PAGES = ['home', 'services', 'gallery', 'about', 'contact'];
const LANGS = ['de', 'pl', 'en'];
const FIELDS = ['h1', 'intro', 'body', 'faqRaw', 'metaTitle', 'metaDescription'];

const str = (v) => (v === undefined || v === null ? '' : String(v));
const invalid = (page, lang) => !PAGES.includes(page) || !LANGS.includes(lang);
const bad = (message) => NextResponse.json({ message }, { status: 400 });

export async function GET(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || 'home';
  const lang = searchParams.get('lang') || 'de';
  if (invalid(page, lang)) return bad('Nieprawidłowa strona lub język.');

  const row = await prisma.pageContent.findUnique({ where: { page_lang: { page, lang } } });
  if (row) return NextResponse.json({ ...row, fromDefaults: false });

  // brak wiersza w bazie → teksty domyślne z prisma/content/seo-content.js
  const d = defaults?.pages?.[page]?.[lang] || {};
  const data = { id: null, page, lang, fromDefaults: true };
  for (const f of FIELDS) data[f] = str(d[f]);
  return NextResponse.json(data);
}

export async function PUT(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return bad('Nieprawidłowe dane.');

  const { page, lang } = body;
  if (invalid(page, lang)) return bad('Nieprawidłowa strona lub język.');

  const data = {};
  for (const f of FIELDS) data[f] = str(body[f]);

  const row = await prisma.pageContent.upsert({
    where: { page_lang: { page, lang } },
    update: data,
    create: { page, lang, ...data },
  });

  return NextResponse.json({ ...row, fromDefaults: false });
}
