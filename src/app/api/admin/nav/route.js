import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'de';

  const data = await prisma.navItem.findMany({
    where: { lang },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(data);
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { lang, title, path, sortOrder } = body;

  const data = await prisma.navItem.create({
    data: { lang, title, path, sortOrder: sortOrder || 0 },
  });

  return NextResponse.json(data);
}
