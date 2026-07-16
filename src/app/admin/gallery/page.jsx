"use client";
import { useState, useEffect, useRef } from "react";
import AdminShell from "../AdminShell";
import styles from "../admin.module.css";

const LANGS = ["de", "pl", "en"];
const toUrl = (p) => p?.startsWith('/uploads/') ? p.replace('/uploads/', '/api/files/') : p;

export default function GalleryEditor() {
  const [lang, setLang] = useState("de");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = () => {
    fetch(`/api/admin/gallery?lang=${lang}`)
      .then((r) => r.json())
      .then(setImages);
  };

  useEffect(load, [lang]);

  const upload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);

    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("subdir", "gallery");
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      const { url } = await upRes.json();

      // Try to get dimensions from the image
      const img = new Image();
      img.src = url;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });

      await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          url,
          width: img.naturalWidth || null,
          height: img.naturalHeight || null,
          sortOrder: images.length,
        }),
      });
    }

    setUploading(false);
    load();
  };

  const del = async (id) => {
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <AdminShell>
      <h1 className={styles.pageTitle}>Galeria</h1>
      <div className={styles.langTabs}>
        {LANGS.map((l) => (
          <button key={l} onClick={() => setLang(l)}
            className={`${styles.langTab} ${l === lang ? styles.langTabActive : ""}`}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className={styles.uploadArea} onClick={() => fileRef.current?.click()}>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={upload} />
        {uploading ? "Wysyłanie..." : "Kliknij lub przeciągnij zdjęcia aby dodać"}
      </div>

      <div className={styles.galleryGrid}>
        {images.map((img) => (
          <div key={img.id} className={styles.galleryItem}>
            <img src={toUrl(img.url)} alt="" />
            <button onClick={() => del(img.id)} title="Usuń">✕</button>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <p style={{ color: "#aaa", textAlign: "center" }}>Brak zdjęć w galerii dla tego języka.</p>
      )}
    </AdminShell>
  );
}
