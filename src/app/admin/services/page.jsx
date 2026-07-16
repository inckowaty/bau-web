"use client";
import { useState, useEffect } from "react";
import AdminShell from "../AdminShell";
import styles from "../admin.module.css";

const LANGS = ["de", "pl", "en"];
const empty = { title: "", iconUrl: "", excerpt: "", featuresRaw: "", sortOrder: 0 };
const toUrl = (p) => p?.startsWith('/uploads/') ? p.replace('/uploads/', '/api/files/') : p;

export default function ServicesEditor() {
  const [lang, setLang] = useState("de");
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch(`/api/admin/services?lang=${lang}`)
      .then((r) => r.json())
      .then(setItems);
  };

  useEffect(load, [lang]);

  const uploadIcon = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("subdir", "icons");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const { url } = await res.json();
    setForm((f) => ({ ...f, iconUrl: url }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (editing === "new") {
      await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lang }),
      });
    } else {
      // Save current language
      await fetch(`/api/admin/services/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      // Sync icon to same service in other languages (match by sortOrder)
      if (form.iconUrl !== editing.iconUrl) {
        for (const l of LANGS) {
          if (l === lang) continue;
          const res = await fetch(`/api/admin/services?lang=${l}`);
          const langItems = await res.json();
          const match = langItems.find((i) => i.sortOrder === form.sortOrder);
          if (match) {
            await fetch(`/api/admin/services/${match.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...match, iconUrl: form.iconUrl }),
            });
          }
        }
      }
    }

    setSaving(false);
    setEditing(null);
    setForm(empty);
    load();
  };

  const del = async (id) => {
    if (!confirm("Na pewno usunąć?")) return;
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <AdminShell>
      <h1 className={styles.pageTitle}>Usługi</h1>
      <div className={styles.langTabs}>
        {LANGS.map((l) => (
          <button key={l} onClick={() => { setLang(l); setEditing(null); }}
            className={`${styles.langTab} ${l === lang ? styles.langTabActive : ""}`}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <p style={{ color: "#aaa", marginBottom: "1rem", fontSize: "0.85rem" }}>
        Ikony są wspólne dla wszystkich języków. Teksty edytujesz osobno per język.
      </p>

      <button className={styles.addBtn} onClick={() => { setEditing("new"); setForm(empty); }}>
        + Dodaj usługę
      </button>

      <div className={styles.itemList}>
        {items.map((item) => (
          <div key={item.id} className={styles.itemCard}>
            {item.iconUrl && <img src={toUrl(item.iconUrl)} alt="" />}
            <div className={styles.itemInfo}>
              <h4>{item.title}</h4>
              <p>{item.excerpt}</p>
            </div>
            <div className={styles.itemActions}>
              <button className={styles.editBtn} onClick={() => { setEditing(item); setForm(item); }}>
                Edytuj
              </button>
              <button className={styles.deleteBtn} onClick={() => del(item.id)}>
                Usuń
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <form onSubmit={save} className={styles.form}>
          <h3 style={{ color: "#feb81a" }}>{editing === "new" ? "Nowa usługa" : "Edycja usługi"}</h3>
          <div className={styles.field}>
            <label>Nazwa</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className={styles.field}>
            <label>Ikona (wspólna dla wszystkich języków)</label>
            <div className={styles.inlineUpload}>
              {form.iconUrl && <img src={toUrl(form.iconUrl)} alt="" style={{ width: 48, height: 48 }} />}
              <input type="file" accept="image/*" onChange={uploadIcon} className={styles.fileInput} />
            </div>
          </div>
          <div className={styles.field}>
            <label>Opis</label>
            <input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label>Cechy (jedna na linię)</label>
            <textarea value={form.featuresRaw} onChange={(e) => setForm({ ...form, featuresRaw: e.target.value })} rows={5} />
          </div>
          <div className={styles.field}>
            <label>Kolejność</label>
            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" disabled={saving} className={styles.saveBtn}>
              {saving ? "..." : "Zapisz"}
            </button>
            <button type="button" className={styles.editBtn} onClick={() => setEditing(null)}>
              Anuluj
            </button>
          </div>
        </form>
      )}
    </AdminShell>
  );
}
