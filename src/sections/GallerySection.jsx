"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import styles from "./GallerySection.module.css";

export default function GallerySection({ images, lang }) {
  const [idx, setIdx] = useState(-1);
  const touchStartX = useRef(0);

  const close = () => setIdx(-1);
  const prev  = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next  = () => setIdx(i => (i + 1) % images.length);

  console.log(`language is: ${lang}`)

  return (
    <section className={styles.gallery}>
    <h2 className={styles.title}>
        {lang === "de"
          ? "Galerie"
          : lang === "pl"
          ? "Galeria"
          : "Gallery"}
      </h2>
      <div className={styles.grid}>
        {images.map((img, i) => {
          const isLandscape = (img.width || 0) >= (img.height || 0);
          return (
            <div
              key={i}
              className={`${styles.item} ${
                isLandscape ? styles.horizontal : styles.vertical
              }`}
              onClick={() => setIdx(i)}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="(max-width:600px)100vw,(max-width:1024px)50vw,33vw"
                style={{ objectFit: "cover" }}
                placeholder="empty"
              />
            </div>
          );
        })}
      </div>

      {idx >= 0 && (
        <div className={styles.lightboxOverlay} onClick={close}
             onTouchStart={e => (touchStartX.current = e.touches[0].clientX)}
             onTouchEnd={e => {
               const dx = e.changedTouches[0].clientX - touchStartX.current;
               if (dx > 50) prev(); else if (dx < -50) next();
             }}>
          <button className={styles.closeBtn}
                  onClick={e => { e.stopPropagation(); close(); }}>
            ✕
          </button>
          <button className={styles.navBtn} data-side="left"
                  onClick={e => { e.stopPropagation(); prev(); }}>
            ◀
          </button>
          <div className={styles.lightboxImgWrapper}>
            <Image
              src={images[idx].url}
              alt=""
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          <button className={styles.navBtn} data-side="right"
                  onClick={e => { e.stopPropagation(); next(); }}>
            ▶
          </button>
        </div>
      )}
    </section>
  );
}
