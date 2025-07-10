// components/Services.jsx
"use client";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import styles from "./Services.module.css";

export default function Services({ list, lang }) {
     // trzymamy refy do wszystkich kart
     const cardRefs = useRef([]);
     // index aktywnej (najbliższej środka ekranu) karty
     const [activeIdx, setActiveIdx] = useState(-1);
    
     useEffect(() => {
       const onScroll = () => {
         const middle = window.innerHeight / 2;
         let best = { idx: -1, dist: Infinity };
         cardRefs.current.forEach((el, i) => {
           if (!el) return;
           const rect = el.getBoundingClientRect();
           const centerY = rect.top + rect.height/2;
           const d = Math.abs(centerY - middle);
           if (d < best.dist) best = { idx: i, dist: d };
         });
         setActiveIdx(best.idx);
       };
       onScroll();
       window.addEventListener("scroll", onScroll, { passive: true });
       return () => window.removeEventListener("scroll", onScroll);
     }, [list]);
    
     return (
    <section className={styles.services}>
      <h2 className={styles.title}>
        {lang === "de"
          ? "Leistungen"
          : lang === "pl"
          ? "Oferta"
          : "Services"}
      </h2>

      <div className={styles.grid}>
              {list.map((item, i) => (
          <motion.div
            key={item.id}
            // przypisujemy ref dla scroll-handlera
            ref={el => (cardRefs.current[i] = el)}
            className={
              `${styles.card} ` +
              (i === activeIdx ? styles.active : "")
            }
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {/* 4 puste <span> już są w CSS i posłużą neonowi */}
            <span></span><span></span><span></span><span></span>

            <div className={styles.imgTitleWrapper}>
                <Image
                  src={item.acf.leistung_icon.url}
                  alt=""
                  width={48}
                  height={48}
                  className={styles.icon}
                />
                <h3 className={styles.name}
                  dangerouslySetInnerHTML={{ __html: item.title.rendered }}
                />
            </div>
            <p className={styles.excerpt}>{item.acf.leistung_excerpt}</p>

            <ul className={styles.features}>
              {item.acf.leistung_features_raw
                .split(/\r?\n/).filter(Boolean)
                .map((f, j) => <li key={j}>{f}</li>)
              }
            </ul>

            <Link
              href={`/${lang}/${lang==="de"?"kontakt":lang==="pl"?"kontakt":"contact"}`}
              className={styles.more}
            >
              {lang==="de"?"Mehr erfahren":lang==="pl"?"Dowiedz się więcej":"Learn more"}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
       <div className={styles.ctaDiv}>
           <motion.a
             href={`/${lang}/${lang==="de"?"kontakt":lang==="pl"?"kontakt":"contact"}`}
             className={styles.cta}
             whileHover={{ scale:1.05 }}
             transition={{ repeat:Infinity, repeatDelay:3, duration:0.5 }}
           >
             { lang==='de'?'Angebot anfragen': lang==='pl'?'Poproś o wycenę':'Request a quote' }
           </motion.a>
       </div>
    </section>
  );
}