import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { name, email, message, lang } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Save to database
    await prisma.contactMessage.create({
      data: { name, email, message, lang: lang || 'de' },
    });

    // Send email notification if SMTP is configured
    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@grp-bau.de',
        to: process.env.CONTACT_EMAIL || 'info@grp-bau.de',
        subject: `Neue Kontaktanfrage von ${name}`,
        text: `Name: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}`,
        replyTo: email,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Contact form error:', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
