"use client";
import styles from "./Hero.module.css";
import { motion } from "framer-motion";
import Typewriter from "typewriter-effect";

export default function Hero({ title, subtitle_one, subtitle_two, subtitle_three, button_lang, url, lang }) {
  return (
    <section className={styles.hero}>
      <div
        className={styles.background}
        style={{ backgroundImage: `url(${url})` }}
      />
      <div className={styles.overlay} />

      <div className={styles.content}>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          {title}
        </motion.h1>
        <div className={styles.subtitle}>
          <Typewriter
            options={{
              strings: [subtitle_one, subtitle_two, subtitle_three],
              autoStart: true,
              loop: true,
              deleteSpeed: 5,
              delay: 15,
              pauseFor: 2500,
            }}
          />
        </div>
        <motion.a
             href={`/${lang}/${lang==="de"?"leistungen":lang==="pl"?"uslugi":"services"}`}
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
