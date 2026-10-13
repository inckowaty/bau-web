import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const CATEGORY_RE = /^[a-z0-9-]*$/; // klucz usługi albo pusty
const str = (v) => (v === undefined || v === null ? '' : String(v).trim());
const bad = (message) => NextResponse.json({ message }, { status: 400 });

// Aktualizuje jeden wiersz (jeden język). Zapisuje tylko pola, które przyszły w żądaniu:
// alt, caption, category, sortOrder.
export async function PUT(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseInt(rawId);
  if (!id) return bad('Nieprawidłowe id.');

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return bad('Nieprawidłowe dane.');

  const row = await prisma.galleryImage.findUnique({ where: { id }, select: { id: true } });
  if (!row) return NextResponse.json({ message: 'Nie znaleziono zdjęcia.' }, { status: 404 });

  const data = {};
  if (body.alt !== undefined) data.alt = str(body.alt);
  if (body.caption !== undefined) data.caption = str(body.caption);
  if (body.category !== undefined) {
    const category = str(body.category).toLowerCase();
    if (!CATEGORY_RE.test(category)) return bad('Nieprawidłowa kategoria.');
    data.category = category;
  }
  if (body.sortOrder !== undefined) {
    const sortOrder = parseInt(body.sortOrder);
    if (Number.isNaN(sortOrder)) return bad('Nieprawidłowa kolejność.');
    data.sortOrder = sortOrder;
  }

  const updated = await prisma.galleryImage.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.galleryImage.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
