import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const str = (v) => (v === undefined || v === null ? '' : String(v).trim());

export async function GET(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'de';

  const data = await prisma.galleryImage.findMany({
    where: { lang },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return NextResponse.json(data);
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { lang, url, width, height, sortOrder, alt, caption, category } = body;

  const data = await prisma.galleryImage.create({
    data: {
      lang,
      url,
      width,
      height,
      sortOrder: parseInt(sortOrder) || 0,
      // opcjonalne – opis ALT, podpis i kategoria (klucz usługi); domyślnie puste
      alt: str(alt),
      caption: str(caption),
      category: str(category).toLowerCase(),
    },
  });

  return NextResponse.json(data);
}
