"use client";
import { useState, useEffect } from "react";
import AdminShell from "../AdminShell";
import styles from "../admin.module.css";

const LANGS = ["de", "pl", "en"];

export default function AboutEditor() {
  const [lang, setLang] = useState("de");
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/admin/about?lang=${lang}`)
      .then((r) => r.json())
      .then(setData);
  }, [lang]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/admin/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, lang }),
    });
    setSaving(false);
    setMsg(res.ok ? "Zapisano!" : "Błąd zapisu");
  };

  if (!data) return <AdminShell><p>Ładowanie...</p></AdminShell>;

  return (
    <AdminShell>
      <h1 className={styles.pageTitle}>O nas</h1>
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
      <div className={styles.notice}>
        Nagłówek H1, wprowadzenie i tekst strony edytujesz w zakładce <a href="/admin/pages">Treści i SEO</a> → O nas.
      </div>
      <form onSubmit={save} className={styles.form}>
        <div className={styles.field}>
          <label>Punkty (jeden na linię)</label>
          <textarea value={data.aboutPointsRaw || ""} onChange={(e) => setData({ ...data, aboutPointsRaw: e.target.value })} rows={6} />
        </div>
        <div className={styles.field}>
          <label>Tekst CTA</label>
          <input value={data.aboutCtaText || ""} onChange={(e) => setData({ ...data, aboutCtaText: e.target.value })} />
        </div>
        <button type="submit" disabled={saving} className={styles.saveBtn}>
          {saving ? "Zapisuję..." : "Zapisz"}
        </button>
        {msg && <p className={msg.includes("!") ? styles.successMsg : styles.errorMsg}>{msg}</p>}
      </form>
    </AdminShell>
  );
}
