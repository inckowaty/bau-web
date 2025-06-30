// /* components/NavbarSpirit.jsx */
// "use client";
// import { useState, useEffect } from 'react';
// import styles from './NavbarSpirit.module.css';
// import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
// import Image from 'next/image';

// export default function NavbarSpirit({ items, lang, langUrls, logoSrc }) {
//   const [open, setOpen] = useState(false);
//   const x = useMotionValue(0.5);
//   const xPx = useTransform(x, v => `calc(${v * 100}% - 0.25rem)`);

//   useEffect(() => {
//     const hc = animate(x, [0.2, 0.8, 0.3, 0.7, 0.5], { duration: 6, repeat: Infinity, ease: 'easeInOut' });
//     return() => hc.stop();
//   }, [x]);

//   const items_length =  Math.floor(items.length/2);

//   console.log(items_length);

//   return (
//     <>
//       <nav className={styles.navbar}>
//         <Image src="/grp-logo.png" alt="Logo" className={styles.logo} width={150} height={96} />
//         <ul className={styles.links}>
//           {items.map(i => (
//             <li key={i.id}>
//               <a href={i.link} className={styles.link} dangerouslySetInnerHTML={{ __html: i.title.rendered }} />
//             </li>
//           ))}
//         </ul>
//         <div className={styles.flags}>
//           {Object.entries(langUrls).map(([code, url]) => (
//             <a key={code} href={url}><img src={`/flags/${code}.svg`} width={24} alt={code} /></a>
//           ))}
//         </div>

//         {/* horizontal libella */}
//         <div className={styles.level}>  
//           <div className={styles.tubeH}>
//             <span className={styles.tick} style={{ left: '30%' }} />
//             <span className={styles.tick} style={{ left: '33%' }} />
//             <span className={styles.tick} style={{ left: '67%' }} />
//             <span className={styles.tick} style={{ left: '70%' }} />
//             <motion.div className={styles.bubbleH} style={{ left: xPx, width: '1.5rem', height: '0.7rem', top: '30%', transform: 'translateY(-50%)' }} />
//           </div>
//         </div>

//         {/* vertical libella + hamburger */}
//         <motion.div className={styles.sideLevel}
//           onClick={() => setOpen(o => !o)}
//           animate={{ rotate: open ? 90 : 0 }}
//           transition={{ type: 'spring', stiffness: 300 }}
//         >
//           <div className={styles.tubeV}>
//             <motion.div className={styles.bubbleV} style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '0.5rem', height: '0.5rem' }} />
//           </div>
//         </motion.div>
//       </nav>

//       {/* mobile drawer */}
//       {open && (
//         <motion.div
//           initial={{ x: '100%' }}
//           animate={{ x: 0 }}
//           exit={{ x: '100%' }}
//           transition={{ type: 'tween' }}
//           style={{ position: 'fixed', top: 0, right: 0, width: '80%', height: '100%', background: 'var(--accent)', borderLeft: '2px solid #000', zIndex: 10 }}
//         >
//           <ul style={{ padding: '2rem', listStyle: 'none' }}>
//             {items.map(i => (
//               <li key={i.id} style={{ marginBottom: '1rem' }}>
//                 <a href={i.link} dangerouslySetInnerHTML={{ __html: i.title.rendered }} />
//               </li>
//             ))}
//           </ul>
//         </motion.div>
//       )}
//     </>
//   );
// }



/* components/NavbarSpirit.jsx */
"use client";
import { useState, useEffect } from 'react';
import styles from './NavbarSpirit.module.css';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import Image from 'next/image';

export default function NavbarSpirit({ items, lang, langUrls, logoSrc }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.firstHalf}>
          <img src="/grp-logo.png" alt="Logo" className={styles.logo} width='150px' height='96px' />
            {/* first half navigation links */}
            <ul className={styles.linksLeft}>
              {firstItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.link}
                    className={styles.link}
                    dangerouslySetInnerHTML={{ __html: item.title.rendered }}
                  />
                </li>
              ))}
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
            {secondItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.link}
                  className={styles.link}
                  dangerouslySetInnerHTML={{ __html: item.title.rendered }}
                />
              </li>
            ))}
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
            top: 100,
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
              {items.map((item) => (
                <li key={item.id}>
                  <a href={item.link} dangerouslySetInnerHTML={{ __html: item.title.rendered }} />
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </>
  );
}
