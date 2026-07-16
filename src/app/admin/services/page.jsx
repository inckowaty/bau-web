"use client";
import { useState, useEffect } from "react";
import AdminShell from "../AdminShell";
import styles from "../admin.module.css";

const LANGS = ["de", "pl", "en"];
const LANG_LABELS = { de: "Niemiecki", pl: "Polski", en: "Angielski" };
const toUrl = (p) => p?.startsWith('/uploads/') ? p.replace('/uploads/', '/api/files/') : p;

const emptySet = () => ({
  iconUrl: "",
  sortOrder: 0,
  de: { title: "", excerpt: "", featuresRaw: "" },
  pl: { title: "", excerpt: "", featuresRaw: "" },
  en: { title: "", excerpt: "", featuresRaw: "" },
});

export default function ServicesEditor() {
  const [groups, setGroups] = useState([]); // grouped by sortOrder
  const [editing, setEditing] = useState(null); // null | 'new' | group
  const [form, setForm] = useState(emptySet());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    // Fetch all languages and group by sortOrder
    const all = {};
    for (const l of LANGS) {
      const res = await fetch(`/api/admin/services?lang=${l}`);
      const items = await res.json();
      for (const item of items) {
        if (!all[item.sortOrder]) all[item.sortOrder] = { sortOrder: item.sortOrder, iconUrl: item.iconUrl, ids: {} };
        all[item.sortOrder][l] = { id: item.id, title: item.title, excerpt: item.excerpt, featuresRaw: item.featuresRaw };
        all[item.sortOrder].ids[l] = item.id;
        if (item.iconUrl) all[item.sortOrder].iconUrl = item.iconUrl;
      }
    }
    const sorted = Object.values(all).sort((a, b) => a.sortOrder - b.sortOrder);
    setGroups(sorted);
  };

  useEffect(() => { load(); }, []);

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

  const startEdit = (group) => {
    setEditing(group);
    setForm({
      iconUrl: group.iconUrl || "",
      sortOrder: group.sortOrder,
      de: group.de || { title: "", excerpt: "", featuresRaw: "" },
      pl: group.pl || { title: "", excerpt: "", featuresRaw: "" },
      en: group.en || { title: "", excerpt: "", featuresRaw: "" },
    });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);

    for (const l of LANGS) {
      const data = {
        lang: l,
        title: form[l].title,
        excerpt: form[l].excerpt,
        featuresRaw: form[l].featuresRaw,
        iconUrl: form.iconUrl,
        sortOrder: form.sortOrder,
      };

      if (editing === "new") {
        await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else if (editing.ids?.[l]) {
        await fetch(`/api/admin/services/${editing.ids[l]}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        // Language entry missing — create it
        await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
    }

    setSaving(false);
    setEditing(null);
    setForm(emptySet());
    load();
  };

  const del = async (group) => {
    if (!confirm("Na pewno usunąć tę usługę ze wszystkich języków?")) return;
    for (const l of LANGS) {
      if (group.ids?.[l]) {
        await fetch(`/api/admin/services/${group.ids[l]}`, { method: "DELETE" });
      }
    }
    load();
  };

  const setLangField = (lang, field, value) => {
    setForm((f) => ({ ...f, [lang]: { ...f[lang], [field]: value } }));
  };

  return (
    <AdminShell>
      <h1 className={styles.pageTitle}>Usługi</h1>
      <p style={{ color: "#aaa", marginBottom: "1rem", fontSize: "0.85rem" }}>
        Każda usługa ma wspólną ikonę i osobne teksty dla każdego języka.
      </p>

      <button className={styles.addBtn} onClick={() => { setEditing("new"); setForm({ ...emptySet(), sortOrder: groups.length }); }}>
        + Dodaj usługę
      </button>

      <div className={styles.itemList}>
        {groups.map((group) => (
          <div key={group.sortOrder} className={styles.itemCard}>
            {group.iconUrl && <img src={toUrl(group.iconUrl)} alt="" />}
            <div className={styles.itemInfo}>
              <h4>{group.de?.title || group.pl?.title || group.en?.title || "—"}</h4>
              <p style={{ fontSize: "0.75rem", color: "#888" }}>
                DE: {group.de?.title || "—"} | PL: {group.pl?.title || "—"} | EN: {group.en?.title || "—"}
              </p>
            </div>
            <div className={styles.itemActions}>
              <button className={styles.editBtn} onClick={() => startEdit(group)}>Edytuj</button>
              <button className={styles.deleteBtn} onClick={() => del(group)}>Usuń</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <form onSubmit={save} className={styles.form} style={{ maxWidth: "900px" }}>
          <h3 style={{ color: "#feb81a" }}>{editing === "new" ? "Nowa usługa" : "Edycja usługi"}</h3>

          <div className={styles.field}>
            <label>Ikona (wspólna)</label>
            <div className={styles.inlineUpload}>
              {form.iconUrl && <img src={toUrl(form.iconUrl)} alt="" style={{ width: 48, height: 48 }} />}
              <input type="file" accept="image/*" onChange={uploadIcon} className={styles.fileInput} />
            </div>
          </div>

          <div className={styles.field}>
            <label>Kolejność</label>
            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
          </div>

          {LANGS.map((l) => (
            <fieldset key={l} style={{ border: "1px solid #2a2950", borderRadius: "6px", padding: "1rem", marginTop: "0.5rem" }}>
              <legend style={{ color: "#feb81a", fontSize: "0.85rem", padding: "0 0.5rem" }}>
                {LANG_LABELS[l]} ({l.toUpperCase()})
              </legend>
              <div className={styles.field}>
                <label>Nazwa</label>
                <input value={form[l].title} onChange={(e) => setLangField(l, "title", e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label>Opis</label>
                <input value={form[l].excerpt} onChange={(e) => setLangField(l, "excerpt", e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Cechy (jedna na linię)</label>
                <textarea value={form[l].featuresRaw} onChange={(e) => setLangField(l, "featuresRaw", e.target.value)} rows={4} />
              </div>
            </fieldset>
          ))}

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
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
