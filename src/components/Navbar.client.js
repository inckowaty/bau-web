'use client';

import {useState}          from 'react';
import Link                from 'next/link';
import Image               from 'next/image';
import {Menu, X}           from 'lucide-react';
import {AnimatePresence,motion} from 'framer-motion';

import LocaleSwitch        from './LocaleSwitch';
import styles              from './Navbar.module.css';

export default function NavbarClient({items, lang, langUrls}) {
  const [open,setOpen] = useState(false);
  const href = p => (lang==='de'?p:`/${lang}${p}`);

  return (
    <>
      {/* ------------- TOP BAR ------------- */}
      <header className={styles.header}>
        <div className={styles.row}>
          <Link href="/" className={styles.logo}>
            <Image src="/grp-logo.png" alt="GRP-BAU" width={120} height={40} priority />
          </Link>

          <nav className={styles.navDesktop}>
            {items.map(it=>(
              <Link key={it.id} href={href(it.acf.path)}>{it.title.rendered}</Link>
            ))}
            <LocaleSwitch langUrls={langUrls}/>
          </nav>

          <button className={styles.burger} onClick={()=>setOpen(true)}>
            <Menu size={28}/>
          </button>
        </div>
      </header>

      {/* ------------- DRAWER + OVERLAY ------------- */}
      <AnimatePresence>
        {open && (
          <>
            {/* overlay */}
            <motion.div
              className={styles.overlay}
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              transition={{duration:0.25}}
              onClick={()=>setOpen(false)}
            />

            {/* drawer */}
            <motion.aside
              className={styles.drawer}
              initial={{x:'100%'}} animate={{x:'0%'}} exit={{x:'100%'}}
              transition={{type:'tween',duration:0.25}}
            >
              {/* close button */}
              <button className={styles.close} aria-label="Close" onClick={()=>setOpen(false)}>
                <X size={28}/>
              </button>
              <LocaleSwitch langUrls={langUrls}/>
              {items.map(it=>(
                <Link key={it.id} href={href(it.acf.path)} onClick={()=>setOpen(false)}>
                  {it.title.rendered}
                </Link>
              ))}
              
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
