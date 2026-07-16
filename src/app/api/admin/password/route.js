import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { compareSync, hashSync } from 'bcryptjs';

export async function PUT(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ message: 'Nowe hasło musi mieć min. 6 znaków' }, { status: 400 });
  }

  const admin = await prisma.admin.findFirst({ where: { id: parseInt(session.sub) } });
  if (!admin || !compareSync(currentPassword, admin.passwordHash)) {
    return NextResponse.json({ message: 'Obecne hasło jest nieprawidłowe' }, { status: 401 });
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: hashSync(newPassword, 10) },
  });

  return NextResponse.json({ success: true });
}
