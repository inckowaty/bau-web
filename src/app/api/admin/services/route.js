import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const LANGS = ['de', 'pl', 'en'];
const KEY_RE = /^[a-z0-9-]+$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TEXT_FIELDS = ['title', 'excerpt', 'featuresRaw', 'h1', 'body', 'faqRaw', 'metaTitle', 'metaDescription'];

const str = (v) => (v === undefined || v === null ? '' : String(v));
const bad = (message) => NextResponse.json({ message }, { status: 400 });

export async function GET(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'de';

  const data = await prisma.service.findMany({
    where: { lang },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return NextResponse.json(data);
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return bad('Nieprawidłowe dane.');

  const { lang } = body;
  if (!LANGS.includes(lang)) return bad('Nieprawidłowy język.');
  if (!str(body.title).trim()) return bad('Podaj nazwę usługi.');

  const key = str(body.key).trim().toLowerCase();
  if (key && !KEY_RE.test(key)) return bad('Klucz może zawierać tylko małe litery a-z, cyfry i myślniki.');

  const slug = str(body.slug).trim().toLowerCase();
  if (slug && !SLUG_RE.test(slug)) return bad('Adres (slug) może zawierać tylko małe litery a-z, cyfry i myślniki.');

  if (key) {
    const dup = await prisma.service.findFirst({ where: { lang, key }, select: { id: true } });
    if (dup) return bad(`Usługa z kluczem "${key}" już istnieje w języku ${lang.toUpperCase()}.`);
  }
  if (slug) {
    const dup = await prisma.service.findFirst({ where: { lang, slug }, select: { title: true } });
    if (dup) return bad(`Adres "${slug}" jest już używany przez usługę "${dup.title}" (${lang.toUpperCase()}).`);
  }

  const data = { lang, key, slug, iconUrl: str(body.iconUrl), sortOrder: parseInt(body.sortOrder) || 0 };
  for (const f of TEXT_FIELDS) data[f] = str(body[f]);

  const created = await prisma.service.create({ data });
  return NextResponse.json(created);
}
