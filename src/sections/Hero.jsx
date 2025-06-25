import {getLocale} from 'next-intl/server';
import {getWP} from '@/lib/wp';
import ParallaxHero from './ParallaxHero';

export default async function Hero() {
  const locale = getLocale();                           // 'de' | 'pl' | 'en'

  // Polylang: /pages?slug=home&lang=…
  const [home] = await getWP('/pages?slug=home', {
    locale,
    revalidate: 600
  });
  const acf = home?.acf ?? {};

  return (
    <ParallaxHero
      title={acf.hero_title ?? 'Bau GmbH'}
      subtitle={acf.hero_sub ?? ''}
      bgUrl={acf.hero_bg?.url ?? '/placeholder.jpg'}
    />
  );
}
