"use client";
import { useState, useEffect, useRef } from "react";
import AdminShell from "../AdminShell";
import styles from "../admin.module.css";

const LANGS = ["de", "pl", "en"];
const toUrl = (p) => p?.startsWith('/uploads/') ? p.replace('/uploads/', '/api/files/') : p;

export default function GalleryEditor() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = () => {
    // Gallery images are shared — just load DE
    fetch(`/api/admin/gallery?lang=de`)
      .then((r) => r.json())
      .then(setImages);
  };

  useEffect(load, []);

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

      const img = new Image();
      img.src = url;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });

      // Add image for all languages
      for (const l of LANGS) {
        await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lang: l,
            url,
            width: img.naturalWidth || null,
            height: img.naturalHeight || null,
            sortOrder: images.length,
          }),
        });
      }
    }

    setUploading(false);
    load();
  };

  const del = async (id) => {
    // Find the image URL to delete across all languages
    const img = images.find((i) => i.id === id);
    if (!img) return;

    // Delete from all languages by URL
    for (const l of LANGS) {
      const res = await fetch(`/api/admin/gallery?lang=${l}`);
      const langImages = await res.json();
      const match = langImages.find((i) => i.url === img.url);
      if (match) {
        await fetch(`/api/admin/gallery/${match.id}`, { method: "DELETE" });
      }
    }
    load();
  };

  return (
    <AdminShell>
      <h1 className={styles.pageTitle}>Galeria</h1>
      <p style={{ color: "#aaa", marginBottom: "1rem", fontSize: "0.85rem" }}>
        Zdjęcia są wspólne dla wszystkich języków.
      </p>

      <div className={styles.uploadArea} onClick={() => fileRef.current?.click()}>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={upload} />
        {uploading ? "Wysyłanie..." : "Kliknij aby dodać zdjęcia"}
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
        <p style={{ color: "#aaa", textAlign: "center" }}>Brak zdjęć w galerii.</p>
      )}
    </AdminShell>
  );
}
