"use client";
import { useState } from "react";
import Image from "next/image";
import styles from "./GallerySection.module.css";

export default function GallerySection({ images }) {
  const [lightboxIdx, setLightboxIdx] = useState(-1);

  return (
    <section className={styles.gallery}>
      <div className={styles.grid}>
        {images.map((url, i) => (
          <div
            key={i}
            className={styles.item}
            onClick={() => setLightboxIdx(i)}
          >
            <Image
              src={url}
              alt={`Gallery image ${i+1}`}
              width={400}
              height={300}
              className={styles.img}
              placeholder="blur"
              blurDataURL={url}
            />
          </div>
        ))}
      </div>

      {lightboxIdx >= 0 && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightboxIdx(-1)}
        >
          <Image
            src={images[lightboxIdx]}
            alt={`Gallery image ${lightboxIdx+1}`}
            width={800}
            height={600}
            className={styles.lightboxImg}
          />
        </div>
      )}
    </section>
  );
}
