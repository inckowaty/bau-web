import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, path, sortOrder } = body;

  const data = await prisma.navItem.update({
    where: { id: parseInt(id) },
    data: { title, path, sortOrder },
  });

  return NextResponse.json(data);
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.navItem.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
