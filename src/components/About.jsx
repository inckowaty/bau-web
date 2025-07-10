"use client";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import styles from "./About.module.css";

const LIST_TITLES = {
    de: "Über uns",
    pl: "O nas",
    en: "About us",
}

const LIST_HEADINGS = {
  de: "Warum wir? Weil:",
  pl: "Dlaczego my? Ponieważ:",
  en: "Why us? Because:",
};

export default function About({ intro, points, ctaText, langUrl, lang }) {
  return (
    <section className={styles.about}>
      <h1 className={styles.title}>{LIST_TITLES[lang]}</h1>

      {/* renderujemy cały HTML akapitu */}
      <div
        className={styles.intro}
        dangerouslySetInnerHTML={{ __html: intro.text }}
      />

      {/* Nagłówek listy */}
      <h3 className={styles.listHeading}>{LIST_HEADINGS[lang]}</h3>

      <ul className={styles.list}>
        {points.map((p, i) => (
          <li key={i} className={styles.listItem}>
            <LucideIcons.CheckCircle size={20} className={styles.icon} />
            <span className={styles.pointText}>{p}</span>
          </li>
        ))}
      </ul>

      <div className={styles.aboutCtaWrapper} >
          <motion.a
            href={langUrl}
            className={styles.cta}
            whileHover={{ scale: 1.05 }}
          >
            {ctaText}
          </motion.a>
      </div>
    </section>
  );
}
