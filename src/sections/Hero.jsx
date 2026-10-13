"use client";
import Image from "next/image";
import Link from "next/link";
import Typewriter from "typewriter-effect";
import { pagePath } from "@/lib/seo";
import styles from "./Hero.module.css";

const T = {
  de: { quote: "Angebot anfragen", services: "Unsere Leistungen" },
  pl: { quote: "Poproś o wycenę", services: "Nasze usługi" },
  en: { quote: "Request a quote", services: "Our services" },
};

// h1 = nagłówek SEO z CMS, title = nazwa firmy (mała linia nad H1).
// H1 jest w HTML z serwera i animuje się tylko przez CSS (bez opacity:0 inline).
export default function Hero({ h1, title, subtitle_one, subtitle_two, subtitle_three, button_lang, url, lang }) {
  const t = T[lang] || T.de;
  const heading = h1 || title;
  const eyebrow = h1 && title && title !== h1 ? title : "";
  const subtitles = [subtitle_one, subtitle_two, subtitle_three].filter(Boolean);

  return (
    <section className={styles.hero}>
      {url && (
        <Image
          src={url}
          alt=""
          fill
          priority
          sizes="100vw"
          // pełny adres spoza next.config (np. stary link) – bez optymalizacji, żeby nie wywrócić strony
          unoptimized={/^https?:\/\//.test(url) && !url.includes("wp.grp-bau.de")}
          className={styles.background}
        />
      )}
      <div className={styles.overlay} />

      <div className={styles.content}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}

        <h1 className={styles.title}>{heading}</h1>

        {subtitles.length > 0 && (
          <>
            {/* pełna lista dla czytników ekranu i wyszukiwarek – efekt maszynopisu jest tylko wizualny */}
            <p className={styles.srOnly}>{subtitles.join(" · ")}</p>
            <div className={styles.subtitle} aria-hidden="true">
              <Typewriter
                options={{
                  strings: subtitles,
                  autoStart: true,
                  loop: true,
                  deleteSpeed: 5,
                  delay: 15,
                  pauseFor: 4000,
                }}
              />
            </div>
          </>
        )}

        <div className={styles.actions}>
          <Link href={pagePath("contact", lang)} className={styles.cta}>
            {button_lang || t.quote}
          </Link>
          <Link href={pagePath("services", lang)} className={styles.ghost}>
            {t.services}
          </Link>
        </div>
      </div>
    </section>
  );
}
