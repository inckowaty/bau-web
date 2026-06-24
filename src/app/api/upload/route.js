import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const subdir = formData.get('subdir') || '';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const ext = path.extname(file.name).toLowerCase();
    const baseName = path.basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50);
    const uniqueName = `${baseName}_${Date.now()}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdir);
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${subdir ? subdir + '/' : ''}${uniqueName}`;
    return NextResponse.json({ url: publicUrl });
  } catch (e) {
    console.error('Upload error:', e);
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  }
}
