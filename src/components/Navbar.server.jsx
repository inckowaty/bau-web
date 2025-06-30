import NavbarClient from './Navbar.client';

/**
 * @param {Object[]} items    – tablica z fetchNav()
 * @param {string}   lang     – 'de' | 'pl' | 'en'
 * @param {Object}   langUrls – {de:'/',pl:'/pl',en:'/en'}
 */
export default function Navbar({items, lang, langUrls}) {
  return (
    <NavbarClient items={items} lang={lang} langUrls={langUrls} />
  );
}
