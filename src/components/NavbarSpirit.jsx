/* components/NavbarSpirit.jsx */
"use client";
import { useState, useEffect } from 'react';
import styles from './NavbarSpirit.module.css';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { extractSlugFromLink } from '@/lib/utils';

export default function NavbarSpirit({ items, lang, langUrls, logoSrc }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const langPrefix = lang === 'de' ? '' : `/${lang}`;

  useEffect(() => {
    const mql = window.matchMedia('(max-width:978px)');
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const x = useMotionValue(0.5);
  const xPx = useTransform(x, v => `calc(${v * 100}% - 0.25rem)`);

  useEffect(() => {
    const hc = animate(x, [0.2, 0.8, 0.3, 0.7, 0.5, 0.2], {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    });
    return () => hc.stop();
  }, [x]);

  // split items into two halves
  const splitIndex = Math.floor(items.length / 2);
  const firstItems = items.slice(0, splitIndex);
  const secondItems = items.slice(splitIndex);

  function buildHref(item, lang) {
    // analizujemy oryginalny WP link: https://wp.grp-bau.de/pl/start-2/ itd.
    const { pathname } = new URL(item.link);
    // podziel na segmenty i usuń ewentualny prefiks języka
    const segs = pathname.split('/').filter(Boolean);
    if (['de','pl','en'].includes(segs[0])) segs.shift();
    // połącz z powrotem w slug
    const slug = segs.join('/');            // "" | "o-nas" | "start-2" ...
    const prefix = lang === 'de' ? '' : `/${lang}`;
    // jeśli slug jest pusty lub to start(-X), robimy home
    if (!slug || /^start(-\d+)?$/i.test(slug)) {
      return `${prefix}/`;
    }
    // w przeciwnym razie normalna podstrona
    return `${prefix}/${slug}`;
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.firstHalf}>
          <img src="/grp-logo.png" alt="Logo" className={styles.logo} width='150px' height='96px' />
            {/* first half navigation links */}
            <ul className={styles.linksLeft}>
            {firstItems.map(item => {
            //  // 1) bierzemy slug bezpośrednio
            //  const slug = item.slug;                        // np. "start", "leistungen", "uber-uns"
            //  const langPrefix = lang === 'de' ? '' : `/${lang}`;
          
            //  // 2) jeśli to home (start/home), kieruj na samą ścieżkę języka
            //  const isHome = slug === 'home' || /^start(-\\d+)?$/.test(slug);
            //  const href = isHome
            //    ? `${langPrefix}/`                          // "/" lub "/pl/" lub "/en/"
            //    : `${langPrefix}/${slug}`;                  // "/leistungen", "/pl/galeria" itd.
            const href = item.acf.path;
             return (
               <li key={item.id}>
                 <Link href={href} className={styles.link}>
                   <span dangerouslySetInnerHTML={{ __html: item.title.rendered }} />
                 </Link>
               </li>
             );
           })}
            </ul>
        </div>

          <div className={styles.flags}>
              <div className={styles.insideFlags}>
                {Object.entries(langUrls).map(([code, url]) => (
                  <a key={code} href={url}>
                    <img src={`/flags/${code}.svg`} width={24} alt={code} />
                  </a>
                ))}
              </div>
          </div>

        {/* horizontal libella */}
        <div className={styles.level}>
          <div className={styles.tubeH}>
             <span className={styles.tick} style={{ left: '30%' }} />
             <span className={styles.tick} style={{ left: '33%' }} />
             <span className={styles.tick} style={{ left: '67%' }} />
             <span className={styles.tick} style={{ left: '70%' }} />
             <motion.div 
              className={styles.bubbleH} 
              style={{ left: xPx }} 
            />
          </div>
        </div>

        {/* second half navigation links */}
        <div className={styles.secondHalf}>
          <ul className={styles.linksRight}>
           {secondItems.map(item => {
            //  // 1) bierzemy slug bezpośrednio
            //  const slug = item.slug;                        // np. "start", "leistungen", "uber-uns"
            //  const langPrefix = lang === 'de' ? '' : `/${lang}`;
          
            //  // 2) jeśli to home (start/home), kieruj na samą ścieżkę języka
            //  const isHome = slug === 'home' || /^start(-\\d+)?$/.test(slug);
            //  const href = isHome
            //    ? `${langPrefix}/`                          // "/" lub "/pl/" lub "/en/"
            //    : `${langPrefix}/${slug}`;                  // "/leistungen", "/pl/galeria" itd.
            const href = item.acf.path;
             return (
               <li key={item.id}>
                 <Link href={href} className={styles.link}>
                   <span dangerouslySetInnerHTML={{ __html: item.title.rendered }} />
                 </Link>
               </li>
             );
           })}
          </ul>
          
          {/* vertical libella + hamburger (mobile) */}
          <motion.div 
            className={styles.outerSideLevel}
            onClick={() => isMobile &&  setOpen((o) => !o)}
              animate={{
                rotate: open ? 90 : 0,
                x: isMobile && !open ? [0, -5, 5, -5, 5, 0] : 0
              }}
              transition={{
                rotate: {
                  type: 'spring',
                  stiffness: 300
                },
                x: {
                  type: 'keyframes',
                  values: [0, -5, 5, -5, 5, 0],
                  repeat: open ? 0 : Infinity,
                  repeatDelay: 3,
                  duration: 0.5
                }
              }}
          >
            <div
              className={styles.sideLevel} 
            >
            {/* <div className={styles.outerTubeV}> */}
              <div className={styles.tubeV}>
                  <motion.div
                    className={styles.bubbleV}
                    style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '0.5rem', height: '0.5rem' }}
                  />
              </div>
            {/* </div> */}
            </div>
          </motion.div>
        </div>
      </nav>

      {/* mobile drawer */}
      {open && (
        <motion.div
          className={styles.mobileDrawer}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween' }}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '350px',
            height: '100%',
            background: 'var(--accent)',
            borderLeft: '2px solid #000',
            zIndex: 10,
          }}
        >

          <div className={styles.mobileFlags}>
            {Object.entries(langUrls).map(([code, url]) => (
              <a key={code} href={url}>
                <img src={`/flags/${code}.svg`} width={36} alt={code} />
              </a>
            ))}
          </div>

          <hr/>

          <div className={styles.mobileList}>
            <ul>
            {items.map(item => {
            //  // 1) bierzemy slug bezpośrednio
            //  const slug = item.slug;                        // np. "start", "leistungen", "uber-uns"
            //  const langPrefix = lang === 'de' ? '' : `/${lang}`;
          
            //  // 2) jeśli to home (start/home), kieruj na samą ścieżkę języka
            //  // traktujemy wszystkie warianty start-*, np. start, start-2, start-3 jako home
            //  const isHome = slug === 'home' || /^start(-\\d+)?$/.test(slug);
            //  const href = isHome
            //    ? `${langPrefix}/`                          // "/" lub "/pl/" lub "/en/"
            //    : `${langPrefix}/${slug}`;                  // "/leistungen", "/pl/galeria" itd.
            const href = item.acf.path;
             return (
               <li key={item.id}>
                 <Link href={href} className={styles.link}>
                   <span dangerouslySetInnerHTML={{ __html: item.title.rendered }} />
                 </Link>
               </li>
             );
           })}
            </ul>
          </div>
        </motion.div>
      )}
    </>
  );
}
