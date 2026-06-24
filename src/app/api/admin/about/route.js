import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'de';

  const data = await prisma.aboutPage.findUnique({ where: { lang } });
  return NextResponse.json(data);
}

export async function PUT(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { lang, aboutTitle, aboutIntro, aboutPointsRaw, aboutCtaText } = body;

  const data = await prisma.aboutPage.upsert({
    where: { lang },
    update: { aboutTitle, aboutIntro, aboutPointsRaw, aboutCtaText },
    create: { lang, aboutTitle, aboutIntro, aboutPointsRaw, aboutCtaText },
  });

  return NextResponse.json(data);
}
