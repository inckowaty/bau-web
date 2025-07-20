// src/sections/ContactPage.jsx
"use client";

import styles from "./ContactPage.module.css";


export default function ContactPage({ contentHtml }) {

  return (
    <section className={styles.contact}>
      <div
        className={styles.wrapper}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </section>
  );
}
