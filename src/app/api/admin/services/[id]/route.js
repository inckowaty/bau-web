import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, iconUrl, excerpt, featuresRaw, sortOrder } = body;

  const data = await prisma.service.update({
    where: { id: parseInt(id) },
    data: { title, iconUrl, excerpt, featuresRaw, sortOrder },
  });

  return NextResponse.json(data);
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.service.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
