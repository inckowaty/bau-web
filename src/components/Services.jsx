// components/Services.jsx
"use client";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { House, PaintRoller, BrickWall, Layers, Cable, Hammer, ArrowRight, CircleCheck } from "lucide-react";
import RichText from "@/components/RichText";
import { servicePath } from "@/lib/seo";
import styles from "./Services.module.css";

const T = {
  de: { heading: "Leistungen", more: "Mehr erfahren", ask: "Anfrage senden", cta: "Angebot anfragen" },
  pl: { heading: "Usługi", more: "Dowiedz się więcej", ask: "Wyślij zapytanie", cta: "Poproś o wycenę" },
  en: { heading: "Services", more: "Learn more", ask: "Send an enquiry", cta: "Request a quote" },
};

// ikona zapasowa, gdy usługa nie ma grafiki w CMS
const ICONS = {
  innenausbau: House,
  renovierung: PaintRoller,
  trockenbau: BrickWall,
  bodenleger: Layers,
  leitungsverlegung: Cable,
};

function ServiceIcon({ item }) {
  const Known = ICONS[item.key];
  if (Known) return <Known size={30} strokeWidth={1.75} className={styles.icon} />;
  const url = item.iconUrl || item.acf?.leistung_icon?.url;
  if (url) {
    return <Image src={url} alt="" width={40} height={40} className={styles.icon} />;
  }
  const Icon = ICONS[item.key] || Hammer;
  return <Icon size={30} strokeWidth={1.75} className={styles.icon} />;
}

export default function Services({ list = [], heading, intro, body, contactPath, lang }) {
  const t = T[lang] || T.de;

  // trzymamy refy do wszystkich kart
  const cardRefs = useRef([]);
  // index aktywnej (najbliższej środka ekranu) karty – neonowa ramka na mobile
  const [activeIdx, setActiveIdx] = useState(-1);

  useEffect(() => {
    const onScroll = () => {
      const middle = window.innerHeight / 2;
      let best = { idx: -1, dist: Infinity };
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
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
      <header className={styles.header}>
        <h1 className={styles.title}>{heading || t.heading}</h1>
        {intro && <RichText markdown={intro} className={styles.intro} />}
      </header>

      <div className={styles.grid}>
        {list.map((item, i) => {
          const features = (item.acf?.leistung_features_raw || "")
            .split(/\r?\n/)
            .map(f => f.trim())
            .filter(Boolean);
          const href = item.slug ? servicePath(lang, item.slug) : contactPath;

          return (
            <motion.article
              key={item.id}
              // przypisujemy ref dla scroll-handlera
              ref={el => (cardRefs.current[i] = el)}
              className={`${styles.card} ${i === activeIdx ? styles.active : ""}`}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {/* 4 puste <span> – neonowa obwódka z CSS */}
              <span aria-hidden="true"></span><span aria-hidden="true"></span>
              <span aria-hidden="true"></span><span aria-hidden="true"></span>

              <div className={styles.imgTitleWrapper}>
                <span className={styles.iconBadge}>
                  <ServiceIcon item={item} />
                </span>
                <h2 className={styles.name}>
                  {item.slug ? (
                    <Link href={href} className={styles.nameLink}>{item.title.rendered}</Link>
                  ) : (
                    item.title.rendered
                  )}
                </h2>
              </div>

              {item.acf?.leistung_excerpt && (
                <p className={styles.excerpt}>{item.acf.leistung_excerpt}</p>
              )}

              {features.length > 0 && (
                <ul className={styles.features}>
                  {features.map((f, j) => (
                    <li key={j}>
                      <CircleCheck size={18} className={styles.check} aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              <Link href={href} className={styles.more}>
                {item.slug ? t.more : t.ask}
                <ArrowRight size={18} aria-hidden="true" />
                {item.slug && <span className={styles.srOnly}>: {item.title.rendered}</span>}
              </Link>
            </motion.article>
          );
        })}
      </div>

      {body && (
        <div className={styles.body}>
          <RichText markdown={body} className={styles.bodyText} />
        </div>
      )}

      {/* CTA */}
      <div className={styles.ctaDiv}>
        <Link href={contactPath} className={styles.cta}>
          {t.cta}
        </Link>
      </div>
    </section>
  );
}
