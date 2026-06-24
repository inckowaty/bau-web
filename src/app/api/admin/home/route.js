import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'de';

  const data = await prisma.homePage.findUnique({ where: { lang } });
  return NextResponse.json(data);
}

export async function PUT(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { lang, heroTitle, heroSubOne, heroSubTwo, heroSubThree, buttonLang, heroBg } = body;

  const data = await prisma.homePage.upsert({
    where: { lang },
    update: { heroTitle, heroSubOne, heroSubTwo, heroSubThree, buttonLang, heroBg },
    create: { lang, heroTitle, heroSubOne, heroSubTwo, heroSubThree, buttonLang, heroBg },
  });

  return NextResponse.json(data);
}
