import { NextResponse } from 'next/server';
import { fetchHome, fetchNav, fetchAbout, fetchLeistungen, fetchGallery } from '@/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'de';

  try {
    const [home, nav, about, services, gallery] = await Promise.all([
      fetchHome(lang),
      fetchNav(lang),
      fetchAbout(lang),
      fetchLeistungen(lang),
      fetchGallery(lang),
    ]);

    return NextResponse.json({
      lang,
      home: home ? { title: home.acf?.hero_title, bg: home.acf?.hero_bg?.url } : null,
      navCount: nav?.length,
      about: about ? { title: about.about_title } : null,
      servicesCount: services?.length,
      galleryCount: gallery?.length,
      firstGalleryUrl: gallery?.[0]?.url || null,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
