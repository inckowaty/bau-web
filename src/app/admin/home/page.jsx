"use client";
import { useState, useEffect } from "react";
import AdminShell from "../AdminShell";
import styles from "../admin.module.css";

const LANGS = ["de", "pl", "en"];
const toUrl = (p) => p?.startsWith('/uploads/') ? p.replace('/uploads/', '/api/files/') : p;

export default function HomeEditor() {
  const [lang, setLang] = useState("de");
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/admin/home?lang=${lang}`)
      .then((r) => r.json())
      .then(setData);
  }, [lang]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/admin/home", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, lang }),
    });
    setSaving(false);
    setMsg(res.ok ? "Zapisano!" : "Błąd zapisu");
  };

  const uploadBg = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("subdir", "");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const { url } = await res.json();
    setData((d) => ({ ...d, heroBg: url }));

    // Apply same background to all languages
    for (const l of LANGS) {
      if (l === lang) continue;
      const r = await fetch(`/api/admin/home?lang=${l}`);
      const langData = await r.json();
      if (langData) {
        await fetch("/api/admin/home", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...langData, lang: l, heroBg: url }),
        });
      }
    }
  };

  if (!data) return <AdminShell><p>Ładowanie...</p></AdminShell>;

  return (
    <AdminShell>
      <h1 className={styles.pageTitle}>Strona główna — Hero</h1>
      <div className={styles.langTabs}>
        {LANGS.map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`${styles.langTab} ${l === lang ? styles.langTabActive : ""}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <form onSubmit={save} className={styles.form}>
        <div className={styles.field}>
          <label>Tytuł Hero</label>
          <input value={data.heroTitle || ""} onChange={(e) => setData({ ...data, heroTitle: e.target.value })} />
        </div>
        <div className={styles.field}>
          <label>Podtytuł 1</label>
          <input value={data.heroSubOne || ""} onChange={(e) => setData({ ...data, heroSubOne: e.target.value })} />
        </div>
        <div className={styles.field}>
          <label>Podtytuł 2</label>
          <input value={data.heroSubTwo || ""} onChange={(e) => setData({ ...data, heroSubTwo: e.target.value })} />
        </div>
        <div className={styles.field}>
          <label>Podtytuł 3</label>
          <input value={data.heroSubThree || ""} onChange={(e) => setData({ ...data, heroSubThree: e.target.value })} />
        </div>
        <div className={styles.field}>
          <label>Tekst przycisku</label>
          <input value={data.buttonLang || ""} onChange={(e) => setData({ ...data, buttonLang: e.target.value })} />
        </div>
        <div className={styles.field}>
          <label>Tło Hero (wspólne dla wszystkich języków)</label>
          <div className={styles.inlineUpload}>
            {data.heroBg && <img src={toUrl(data.heroBg)} alt="" className={styles.imagePreview} />}
            <input type="file" accept="image/*" onChange={uploadBg} className={styles.fileInput} />
          </div>
        </div>
        <button type="submit" disabled={saving} className={styles.saveBtn}>
          {saving ? "Zapisuję..." : "Zapisz"}
        </button>
        {msg && <p className={msg.includes("!") ? styles.successMsg : styles.errorMsg}>{msg}</p>}
      </form>
    </AdminShell>
  );
}
