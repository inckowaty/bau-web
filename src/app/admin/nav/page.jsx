"use client";
import { useState, useEffect } from "react";
import AdminShell from "../AdminShell";
import styles from "../admin.module.css";

const LANGS = ["de", "pl", "en"];
const empty = { title: "", path: "", sortOrder: 0 };

export default function NavEditor() {
  const [lang, setLang] = useState("de");
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch(`/api/admin/nav?lang=${lang}`)
      .then((r) => r.json())
      .then(setItems);
  };

  useEffect(load, [lang]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (editing === "new") {
      await fetch("/api/admin/nav", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lang }),
      });
    } else {
      await fetch(`/api/admin/nav/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setSaving(false);
    setEditing(null);
    setForm(empty);
    load();
  };

  const del = async (id) => {
    if (!confirm("Na pewno usunąć?")) return;
    await fetch(`/api/admin/nav/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <AdminShell>
      <h1 className={styles.pageTitle}>Nawigacja</h1>
      <div className={styles.langTabs}>
        {LANGS.map((l) => (
          <button key={l} onClick={() => { setLang(l); setEditing(null); }}
            className={`${styles.langTab} ${l === lang ? styles.langTabActive : ""}`}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <button className={styles.addBtn} onClick={() => { setEditing("new"); setForm(empty); }}>
        + Dodaj pozycję menu
      </button>

      <div className={styles.itemList}>
        {items.map((item) => (
          <div key={item.id} className={styles.itemCard}>
            <div className={styles.itemInfo}>
              <h4>{item.title}</h4>
              <p>{item.path}</p>
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
          <h3 style={{ color: "#feb81a" }}>{editing === "new" ? "Nowa pozycja" : "Edycja pozycji"}</h3>
          <div className={styles.field}>
            <label>Nazwa</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className={styles.field}>
            <label>Ścieżka (np. /de/leistungen)</label>
            <input value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} required />
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
