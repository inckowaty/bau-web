"use client";
import styles from "./Hero.module.css";
import { motion } from "framer-motion";
import Typewriter from "typewriter-effect";

export default function Hero({ title, subtitle_one, subtitle_two, subtitle_three, button_lang, url }) {
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
              deleteSpeed: 10,
              delay: 2,
              pauseFor: 2500,
            }}
          />
        </div>
        <motion.button
          className={styles.cta}
          onClick={() => document.getElementById("oferta").scrollIntoView({ behavior: "smooth" })}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {button_lang}
        </motion.button>
      </div>
    </section>
  );
}
