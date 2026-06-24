import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { compareSync } from 'bcryptjs';
import { createToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin || !compareSync(password, admin.passwordHash)) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createToken(admin.id, admin.username);

    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return res;
  } catch (e) {
    console.error('Login error:', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
