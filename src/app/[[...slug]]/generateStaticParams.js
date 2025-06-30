import {fetchNav} from '@/lib/wp';
const slugify = s => s.replace(/^\//,'');

export default async function generateStaticParams() {
  const [de, pl, en] = await Promise.all([
    fetchNav('de'), fetchNav('pl'), fetchNav('en')
  ]);

  return [
    {slug: []},            // "/"
    {slug: ['de']},        // "/de"
    {slug: ['pl']},        // "/pl"
    {slug: ['en']},        // "/en"

    ...de.map(i => ({slug:['de', slugify(i.acf.path)]})),
    ...pl.map(i => ({slug:['pl', slugify(i.acf.path)]})),
    ...en.map(i => ({slug:['en', slugify(i.acf.path)]}))
  ];
}
