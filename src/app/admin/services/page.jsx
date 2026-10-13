"use client";
import { useState, useEffect, useRef } from "react";
import AdminShell, { MarkdownField, FaqField, SeoField, SerpPreview } from "../AdminShell";
import styles from "../admin.module.css";
import { servicePath, SITE_NAME } from "@/lib/seo";

const LANGS = ["de", "pl", "en"];
const LANG_LABELS = { de: "Niemiecki", pl: "Polski", en: "Angielski" };
const LANG_FIELDS = ["title", "slug", "h1", "excerpt", "featuresRaw", "body", "faqRaw", "metaTitle", "metaDescription"];
const KEY_RE = /^[a-z0-9-]+$/;
const toUrl = (p) => p?.startsWith('/uploads/') ? p.replace('/uploads/', '/api/files/') : p;

// adres z nazwy: ä→ae, ö→oe, ü→ue, ß→ss, polskie znaki bez ogonków, małe litery, reszta → "-"
const TRANSLIT = { ä: "ae", ö: "oe", ü: "ue", ß: "ss", ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" };
const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[äöüßąćęłńóśźż]/g, (c) => TRANSLIT[c])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const emptyLang = () => Object.fromEntries(LANG_FIELDS.map((f) => [f, ""]));

// auto.* = pole uzupełnia się samo z nazwy, dopóki ktoś go nie zmieni ręcznie
const emptySet = (sortOrder = 0) => ({
  key: "",
  iconUrl: "",
  sortOrder,
  de: emptyLang(),
  pl: emptyLang(),
  en: emptyLang(),
  auto: { key: true, de: true, pl: true, en: true },
});

export default function ServicesEditor() {
  const [groups, setGroups] = useState([]); // pogrupowane po key (stare wiersze bez key – po sortOrder)
  const [editing, setEditing] = useState(null); // null | 'new' | group
  const [form, setForm] = useState(emptySet());
  // stan formularza w chwili otwarcia – do ostrzeżenia o niezapisanych zmianach
  const [initial, setInitial] = useState("");
  const dirty = !!editing && JSON.stringify(form) !== initial;
  const confirmLeave = () => !dirty || confirm("Masz niezapisane zmiany. Porzucić je?");

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const formRef = useRef(null);

  const load = async () => {
    const lists = await Promise.all(
      LANGS.map((l) => fetch(`/api/admin/services?lang=${l}`).then((r) => (r.ok ? r.json() : [])))
    );
    const map = {};
    LANGS.forEach((l, i) => {
      for (const item of lists[i]) {
        let gid = item.key ? `k:${item.key}` : `s:${item.sortOrder}`;
        if (map[gid]?.[l]) gid = `${gid}:${item.id}`; // drugi wiersz w tym samym języku – osobna grupa
        const g = (map[gid] ??= { gid, key: item.key || "", sortOrder: item.sortOrder, iconUrl: "", ids: {} });
        g[l] = Object.fromEntries(LANG_FIELDS.map((f) => [f, item[f] ?? ""]));
        g.ids[l] = item.id;
        if (!g.iconUrl && item.iconUrl) g.iconUrl = item.iconUrl;
        g.sortOrder = Math.min(g.sortOrder, item.sortOrder);
      }
    });
    const sorted = Object.values(map).sort((a, b) => a.sortOrder - b.sortOrder || a.gid.localeCompare(b.gid));
    setGroups(sorted);
  };

  useEffect(() => { load(); }, []);

  const scrollToForm = () => setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);

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

  const startNew = () => {
    if (!confirmLeave()) return;
    const next = groups.length ? Math.max(...groups.map((g) => g.sortOrder)) + 1 : 0;
    const f = emptySet(next);
    setEditing("new");
    setForm(f);
    setInitial(JSON.stringify(f));
    setMsg("");
    scrollToForm();
  };

  const startEdit = (group) => {
    if (!confirmLeave()) return;
    const f = emptySet(group.sortOrder);
    f.key = group.key;
    f.iconUrl = group.iconUrl || "";
    f.auto.key = false;
    for (const l of LANGS) {
      f[l] = { ...emptyLang(), ...group[l] };
      // brak adresu → podpowiedź z nazwy (widoczna w polu, można zmienić)
      f.auto[l] = !f[l].slug;
      if (!f[l].slug && f[l].title) f[l].slug = slugify(f[l].title);
    }
    setEditing(group);
    setForm(f);
    setInitial(JSON.stringify(f));
    setMsg("");
    scrollToForm();
  };

  const cancel = () => {
    if (!confirmLeave()) return;
    setEditing(null);
    setForm(emptySet());
    setMsg("");
  };

  const isNew = editing === "new" || !!editing?.isNew;
  // klucz już zapisany w bazie → tylko do odczytu
  const keyLocked = !!editing && editing !== "new" && !!editing.key;

  // grupy inne niż edytowana (do sprawdzania kolizji klucza i adresów)
  const isSelf = (g) => editing && editing !== "new" && LANGS.some((l) => g.ids[l] && editing.ids?.[l] === g.ids[l]);

  const setLangField = (l, field, value) => {
    setForm((f) => ({ ...f, [l]: { ...f[l], [field]: value } }));
  };

  const setTitle = (l, value) => {
    setForm((f) => {
      const next = { ...f, [l]: { ...f[l], title: value } };
      if (f.auto[l]) next[l].slug = slugify(value);
      if (l === "de" && f.auto.key && isNew) next.key = slugify(value);
      return next;
    });
  };

  const setSlug = (l, value) => {
    setForm((f) => ({ ...f, [l]: { ...f[l], slug: value }, auto: { ...f.auto, [l]: value === "" } }));
  };

  const setKey = (value) => {
    const key = value.toLowerCase().replace(/\s+/g, "-");
    setForm((f) => ({ ...f, key, auto: { ...f.auto, key: key === "" } }));
  };

  const save = async (e) => {
    e.preventDefault();
    setMsg("");

    const key = form.key.trim();
    if (isNew && !key) return setMsg("Podaj klucz usługi (np. „malerarbeiten”).");
    if (key && !KEY_RE.test(key)) return setMsg("Klucz może zawierać tylko małe litery a-z, cyfry i myślniki.");

    const others = groups.filter((g) => !isSelf(g));
    if (key && key !== editing?.key && others.some((g) => g.key === key)) {
      return setMsg(`Klucz „${key}” jest już używany przez inną usługę.`);
    }

    const langs = {};
    for (const l of LANGS) {
      const slug = slugify(form[l].slug);
      langs[l] = { ...form[l], slug };
      const taken = slug && others.find((g) => g[l]?.slug === slug);
      if (taken) return setMsg(`Adres „${slug}” (${l.toUpperCase()}) jest już używany przez usługę „${taken[l].title}”.`);
    }
    setForm((f) => ({ ...f, de: langs.de, pl: langs.pl, en: langs.en }));

    setSaving(true);
    const ids = { ...(editing === "new" ? {} : editing.ids) };
    let error = "";
    let savedAny = false;

    for (const l of LANGS) {
      const data = { lang: l, key, iconUrl: form.iconUrl, sortOrder: form.sortOrder, ...langs[l] };
      const res = await fetch(ids[l] ? `/api/admin/services/${ids[l]}` : "/api/admin/services", {
        method: ids[l] ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        error = `${l.toUpperCase()}: ${json.message || "Błąd zapisu"}`;
        break;
      }
      ids[l] = json.id;
      savedAny = true;
    }

    setSaving(false);
    await load();

    if (error) {
      // część języków mogła się już zapisać – kolejny zapis zaktualizuje te wiersze zamiast tworzyć nowe
      setEditing((prev) => {
        const base = prev === "new" ? { isNew: true, gid: null, key: "" } : prev;
        return { ...base, ids, key: savedAny && key ? key : base.key };
      });
      setMsg(error);
      return;
    }

    setEditing(null);
    setForm(emptySet());
    setMsg("Zapisano!");
  };

  const del = async (group) => {
    if (!confirm("Na pewno usunąć tę usługę ze wszystkich języków?")) return;
    for (const l of LANGS) {
      if (group.ids?.[l]) {
        await fetch(`/api/admin/services/${group.ids[l]}`, { method: "DELETE" });
      }
    }
    if (editing && editing !== "new" && editing.gid === group.gid) cancel();
    load();
  };

  const msgLine = msg && <p className={msg.includes("!") ? styles.successMsg : styles.errorMsg}>{msg}</p>;

  const actions = (
    <div className={styles.formActions}>
      <button type="submit" disabled={saving} className={styles.saveBtn}>
        {saving ? "Zapisuję..." : "Zapisz"}
      </button>
      <button type="button" className={styles.editBtn} onClick={cancel}>
        Anuluj
      </button>
      {msgLine}
    </div>
  );

  return (
    <AdminShell>
      <h1 className={styles.pageTitle}>Usługi</h1>
      <p style={{ color: "#aaa", marginBottom: "1rem", fontSize: "0.85rem" }}>
        Każda usługa ma wspólną ikonę i klucz oraz osobne teksty i podstronę dla każdego języka.
      </p>

      <button className={styles.addBtn} onClick={startNew}>
        + Dodaj usługę
      </button>
      {!editing && msgLine}

      <div className={styles.itemList}>
        {groups.map((group) => (
          <div key={group.gid} className={styles.itemCard}>
            {group.iconUrl ? <img src={toUrl(group.iconUrl)} alt="" /> : <span className={styles.iconPlaceholder} />}
            <div className={styles.itemInfo}>
              <h4>
                {group.de?.title || group.pl?.title || group.en?.title || "—"}
                {group.key
                  ? <span className={styles.keyBadge}>{group.key}</span>
                  : <span className={`${styles.keyBadge} ${styles.keyBadgeMuted}`}>bez klucza</span>}
              </h4>
              <p style={{ fontSize: "0.75rem", color: "#888" }}>
                DE: {group.de?.title || "—"} | PL: {group.pl?.title || "—"} | EN: {group.en?.title || "—"}
              </p>
              {LANGS.some((l) => group[l]?.slug) && (
                <div className={styles.publicLinks}>
                  {LANGS.filter((l) => group[l]?.slug).map((l) => (
                    <a key={l} href={servicePath(l, group[l].slug)} target="_blank" rel="noopener noreferrer">
                      {servicePath(l, group[l].slug)}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.itemActions}>
              <button className={styles.editBtn} onClick={() => startEdit(group)}>Edytuj</button>
              <button className={styles.deleteBtn} onClick={() => del(group)}>Usuń</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <form ref={formRef} onSubmit={save} className={styles.form} style={{ maxWidth: "900px" }}>
          <h3 style={{ color: "#feb81a" }}>{editing === "new" ? "Nowa usługa" : "Edycja usługi"}</h3>
          {actions}

          <div className={styles.field}>
            <label htmlFor="service-key">Klucz usługi (wspólny)</label>
            <input
              id="service-key"
              value={form.key}
              onChange={(e) => setKey(e.target.value)}
              readOnly={keyLocked}
              required={isNew}
              pattern="[a-z0-9\-]+"
              title="Tylko małe litery a-z, cyfry i myślniki"
              placeholder="np. trockenbau"
            />
            <small className={styles.help}>
              {keyLocked
                ? "Klucz łączy tłumaczenia usługi i zdjęcia w galerii – nie można go zmienić."
                : "Tylko małe litery a-z, cyfry i myślniki. Łączy tłumaczenia usługi i zdjęcia w galerii – po zapisaniu nie można go zmienić."}
            </small>
          </div>

          <div className={styles.field}>
            <label>Ikona (wspólna)</label>
            <div className={styles.inlineUpload}>
              {form.iconUrl && <img src={toUrl(form.iconUrl)} alt="" style={{ width: 48, height: 48 }} />}
              <input type="file" accept="image/*" onChange={uploadIcon} className={styles.fileInput} />
            </div>
            {!form.iconUrl && <small className={styles.help}>Bez ikony strona pokaże ikonę zastępczą.</small>}
          </div>

          <div className={styles.field}>
            <label htmlFor="service-order">Kolejność</label>
            <input
              id="service-order"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
            />
          </div>

          {LANGS.map((l) => {
            const t = form[l];
            const savedSlug = editing !== "new" ? editing[l]?.slug : "";
            const path = servicePath(l, t.slug || "…");
            const autoTitle = `${t.title || "Nazwa"} ${l === "pl" ? "w" : "in"} Sulingen`;
            return (
              <fieldset key={l} className={styles.fieldset}>
                <legend>{LANG_LABELS[l]} ({l.toUpperCase()})</legend>

                <div className={styles.field}>
                  <label htmlFor={`title-${l}`}>Nazwa</label>
                  <input id={`title-${l}`} value={t.title} onChange={(e) => setTitle(l, e.target.value)} required />
                </div>

                <div className={styles.field}>
                  <label htmlFor={`slug-${l}`}>Adres podstrony (slug)</label>
                  <input
                    id={`slug-${l}`}
                    value={t.slug}
                    onChange={(e) => setSlug(l, e.target.value)}
                    onBlur={(e) => setLangField(l, "slug", slugify(e.target.value))}
                    placeholder={slugify(t.title)}
                  />
                  <small className={styles.help}>
                    Adres: <code>{path}</code> – uzupełnia się z nazwy, tylko małe litery, cyfry i myślniki.
                  </small>
                  {savedSlug && slugify(t.slug) !== savedSlug && (
                    <small className={styles.counterWarn}>
                      Zmieniasz adres – stary link {servicePath(l, savedSlug)} przestanie działać.
                    </small>
                  )}
                  {savedSlug && (
                    <small className={styles.publicLink}>
                      Strona publiczna:{" "}
                      <a href={servicePath(l, savedSlug)} target="_blank" rel="noopener noreferrer">
                        {servicePath(l, savedSlug)}
                      </a>
                    </small>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor={`h1-${l}`}>Nagłówek H1 podstrony</label>
                  <input id={`h1-${l}`} value={t.h1} onChange={(e) => setLangField(l, "h1", e.target.value)} placeholder={autoTitle} />
                  <small className={styles.help}>Puste – nagłówek „{autoTitle}”.</small>
                </div>

                <div className={styles.field}>
                  <label htmlFor={`excerpt-${l}`}>Krótki opis</label>
                  <textarea
                    id={`excerpt-${l}`}
                    value={t.excerpt}
                    onChange={(e) => setLangField(l, "excerpt", e.target.value)}
                    rows={3}
                    className={styles.shortArea}
                  />
                  <small className={styles.help}>Na karcie usługi i jako wstęp podstrony.</small>
                </div>

                <div className={styles.field}>
                  <label htmlFor={`features-${l}`}>Cechy (jedna na linię)</label>
                  <textarea
                    id={`features-${l}`}
                    value={t.featuresRaw}
                    onChange={(e) => setLangField(l, "featuresRaw", e.target.value)}
                    rows={4}
                  />
                </div>

                <MarkdownField
                  label="Treść podstrony"
                  value={t.body}
                  onChange={(v) => setLangField(l, "body", v)}
                  rows={14}
                />

                <FaqField value={t.faqRaw} onChange={(v) => setLangField(l, "faqRaw", v)} rows={8} />

                <div className={styles.subTitle}>SEO</div>
                <SeoField
                  kind="title"
                  label="Meta title"
                  value={t.metaTitle}
                  onChange={(v) => setLangField(l, "metaTitle", v)}
                  emptyHint={`Puste – „${autoTitle} | ${SITE_NAME}”.`}
                />
                <SeoField
                  kind="description"
                  label="Meta description"
                  value={t.metaDescription}
                  onChange={(v) => setLangField(l, "metaDescription", v)}
                  emptyHint="Puste – zostanie użyty krótki opis."
                />
                <SerpPreview
                  title={t.metaTitle || `${autoTitle} | ${SITE_NAME}`}
                  description={t.metaDescription || t.excerpt}
                  path={path}
                />
              </fieldset>
            );
          })}

          {actions}
        </form>
      )}
    </AdminShell>
  );
}
