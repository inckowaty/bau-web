import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const KEY_RE = /^[a-z0-9-]+$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TEXT_FIELDS = ['title', 'excerpt', 'featuresRaw', 'h1', 'body', 'faqRaw', 'metaTitle', 'metaDescription'];

const str = (v) => (v === undefined || v === null ? '' : String(v));
const bad = (message) => NextResponse.json({ message }, { status: 400 });

export async function PUT(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseInt(rawId);
  if (!id) return bad('Nieprawidłowe id.');

  const body = await req.json().catch(() => null);
  if (!body) return bad('Nieprawidłowe dane.');

  const row = await prisma.service.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ message: 'Nie znaleziono usługi.' }, { status: 404 });

  // zapisujemy tylko pola, które przyszły w żądaniu
  const data = {};
  for (const f of TEXT_FIELDS) if (body[f] !== undefined) data[f] = str(body[f]);
  if (body.iconUrl !== undefined) data.iconUrl = str(body.iconUrl);
  if (body.sortOrder !== undefined) data.sortOrder = parseInt(body.sortOrder) || 0;

  if (data.title !== undefined && !data.title.trim()) return bad('Podaj nazwę usługi.');

  if (body.key !== undefined) {
    const key = str(body.key).trim().toLowerCase();
    if (key !== row.key) {
      // klucz łączy tłumaczenia i zdjęcia galerii – po nadaniu nie wolno go zmieniać
      if (row.key) return bad('Klucza istniejącej usługi nie można zmienić.');
      if (key && !KEY_RE.test(key)) return bad('Klucz może zawierać tylko małe litery a-z, cyfry i myślniki.');
      if (key) {
        const dup = await prisma.service.findFirst({ where: { lang: row.lang, key, NOT: { id } }, select: { id: true } });
        if (dup) return bad(`Usługa z kluczem "${key}" już istnieje w języku ${row.lang.toUpperCase()}.`);
      }
      data.key = key;
    }
  }

  if (body.slug !== undefined) {
    const slug = str(body.slug).trim().toLowerCase();
    if (slug && !SLUG_RE.test(slug)) return bad('Adres (slug) może zawierać tylko małe litery a-z, cyfry i myślniki.');
    if (slug) {
      const dup = await prisma.service.findFirst({ where: { lang: row.lang, slug, NOT: { id } }, select: { title: true } });
      if (dup) return bad(`Adres "${slug}" jest już używany przez usługę "${dup.title}" (${row.lang.toUpperCase()}).`);
    }
    data.slug = slug;
  }

  const updated = await prisma.service.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.service.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
