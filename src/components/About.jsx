"use client";
import Link from "next/link";
import { CircleCheck, ArrowRight } from "lucide-react";
import RichText from "@/components/RichText";
import styles from "./About.module.css";

const TITLES = {
  de: "Über uns",
  pl: "O nas",
  en: "About us",
};

const CTA_FALLBACK = {
  de: "Kontaktieren Sie uns",
  pl: "Skontaktuj się z nami",
  en: "Get in touch",
};

const LIST_HEADINGS = {
  de: "Warum wir? Weil:",
  pl: "Dlaczego my? Ponieważ:",
  en: "Why us? Because:",
};

// heading → H1, introMarkdown (CMS) ma pierwszeństwo przed starym intro.text (HTML)
export default function About({ heading, intro, introMarkdown, body, points = [], ctaText, langUrl, lang }) {
  const legacyIntro = intro?.text || "";
  const cta = ctaText || CTA_FALLBACK[lang] || CTA_FALLBACK.de;

  return (
    <section className={styles.about}>
      <div className={styles.top}>
        <header className={styles.head}>
          <h1 className={styles.title}>{heading || intro?.title || TITLES[lang]}</h1>

          {introMarkdown ? (
            <RichText markdown={introMarkdown} className={styles.intro} />
          ) : legacyIntro ? (
            <div
              className={styles.intro}
              dangerouslySetInnerHTML={{ __html: legacyIntro }}
            />
          ) : null}
        </header>

        {points.length > 0 && (
          <div className={styles.why}>
            <h2 className={styles.listHeading}>{LIST_HEADINGS[lang] || LIST_HEADINGS.de}</h2>
            <ul className={styles.list}>
              {points.map((p, i) => (
                <li key={i} className={styles.listItem}>
                  <CircleCheck size={22} className={styles.icon} aria-hidden="true" />
                  <span className={styles.pointText}>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {body && (
        <div className={styles.body}>
          <RichText markdown={body} className={styles.bodyText} />
        </div>
      )}

      {langUrl && (
        <div className={styles.aboutCtaWrapper}>
          <Link href={langUrl} className={styles.cta}>
            {cta}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}
