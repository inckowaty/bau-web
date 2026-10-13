"use client";
import { useState, useEffect } from "react";
import AdminShell, { MarkdownField, FaqField, SeoField, SerpPreview } from "../AdminShell";
import styles from "../admin.module.css";
import { pagePath } from "@/lib/seo";

const LANGS = ["de", "pl", "en"];
const FIELDS = ["h1", "intro", "body", "faqRaw", "metaTitle", "metaDescription"];

// gdzie dane pole pojawia się na stronie (null = ta strona go obecnie nie wyświetla)
const PAGES = [
  {
    key: "home",
    label: "Strona główna",
    hints: {
      h1: "Główny nagłówek w sekcji hero. Mały napis nad nim (nazwa firmy) ustawiasz w zakładce „Strona główna”.",
      intro: "Tekst pod sekcją hero, przed kartami usług.",
      body: "Dłuższy tekst pod kartami usług – z własnymi nagłówkami ##.",
      faq: "Pytania i odpowiedzi na dole strony.",
    },
  },
  {
    key: "services",
    label: "Usługi (lista)",
    hints: {
      h1: "Nagłówek strony z listą usług.",
      intro: "Tekst pod nagłówkiem, przed kartami usług.",
      body: "Tekst pod kartami usług.",
      faq: "Pytania i odpowiedzi na dole strony.",
    },
  },
  {
    key: "gallery",
    label: "Galeria",
    hints: {
      h1: "Nagłówek galerii.",
      intro: "Tekst pod nagłówkiem, nad zdjęciami.",
      body: null,
      faq: null,
    },
  },
  {
    key: "about",
    label: "O nas",
    hints: {
      h1: "Nagłówek H1 strony O nas (puste = tekst domyślny).",
      intro: "Tekst pod nagłówkiem (puste = tekst domyślny).",
      body: "Tekst pod listą atutów.",
      faq: "Pytania i odpowiedzi na dole strony.",
    },
  },
  {
    key: "contact",
    label: "Kontakt",
    hints: {
      h1: "Nagłówek strony kontaktu.",
      intro: "Tekst pod nagłówkiem, nad danymi kontaktowymi i formularzem.",
      body: null,
      faq: "Pytania i odpowiedzi pod formularzem.",
    },
  },
];

const UNUSED = "Obecnie ta strona nie wyświetla tego pola.";
const pickFields = (d) => JSON.stringify(Object.fromEntries(FIELDS.map((f) => [f, d?.[f] ?? ""])));

export default function PagesEditor() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("de");
  const [data, setData] = useState(null);
  const [saved, setSaved] = useState(""); // stan z bazy – do wykrywania niezapisanych zmian
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setMsg("");
    fetch(`/api/admin/pages?page=${page}&lang=${lang}`)
      .then(async (r) => {
        const json = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(json.message || "Błąd wczytywania");
        return json;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setSaved(pickFields(json));
      })
      .catch((err) => !cancelled && setMsg(err.message || "Błąd wczytywania"));
    return () => { cancelled = true; };
  }, [page, lang]);

  const dirty = !!data && pickFields(data) !== saved;

  // ostrzeżenie przy zamykaniu karty z niezapisanymi zmianami
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  const confirmLeave = () => !dirty || confirm("Masz niezapisane zmiany. Przejść dalej bez zapisywania?");
  const choosePage = (p) => { if (p !== page && confirmLeave()) setPage(p); };
  const chooseLang = (l) => { if (l !== lang && confirmLeave()) setLang(l); };

  const set = (field, value) => {
    setData((d) => ({ ...d, [field]: value }));
    setMsg("");
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const payload = { page, lang, ...Object.fromEntries(FIELDS.map((f) => [f, data[f] ?? ""])) };
    const res = await fetch("/api/admin/pages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      setData(json);
      setSaved(pickFields(json));
      setMsg("Zapisano!");
    } else {
      setMsg(json.message || "Błąd zapisu");
    }
  };

  const current = PAGES.find((p) => p.key === page);
  const path = pagePath(page, lang);
  const note = (hint) => hint ?? UNUSED;

  return (
    <AdminShell>
      <h1 className={styles.pageTitle}>Treści i SEO</h1>
      <p style={{ color: "#aaa", marginBottom: "1rem", fontSize: "0.85rem", maxWidth: "900px" }}>
        Nagłówki H1, teksty, pytania FAQ oraz tytuł i opis dla Google – osobno dla każdej strony i języka.
        Puste pole = na stronie pojawi się tekst domyślny.
      </p>

      <div className={`${styles.langTabs} ${styles.tabsWrap}`}>
        {PAGES.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => choosePage(p.key)}
            className={`${styles.langTab} ${p.key === page ? styles.langTabActive : ""}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className={styles.langTabs}>
        {LANGS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => chooseLang(l)}
            className={`${styles.langTab} ${l === lang ? styles.langTabActive : ""}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {!data ? (
        msg ? <p className={styles.errorMsg}>{msg}</p> : <p>Ładowanie...</p>
      ) : (
        <>
          {data.fromDefaults && (
            <div className={styles.notice}>
              Ta strona nie ma jeszcze zapisanej treści w tym języku – pola wypełniono tekstami domyślnymi.
              Kliknij „Zapisz”, aby je zapisać (możesz je wcześniej zmienić).
            </div>
          )}

          <form onSubmit={save} className={styles.form} style={{ maxWidth: "900px" }}>
            <p className={styles.publicLink}>
              {current.label} ({lang.toUpperCase()}) – strona publiczna:{" "}
              <a href={path} target="_blank" rel="noopener noreferrer">{path}</a>
            </p>

            <div className={styles.field}>
              <label htmlFor="page-h1">Nagłówek H1</label>
              <input id="page-h1" value={data.h1 || ""} onChange={(e) => set("h1", e.target.value)} />
              <small className={styles.help}>{note(current.hints.h1)}</small>
            </div>

            <MarkdownField
              label="Wprowadzenie"
              value={data.intro}
              onChange={(v) => set("intro", v)}
              rows={6}
              note={note(current.hints.intro)}
            />

            <MarkdownField
              label="Treść"
              value={data.body}
              onChange={(v) => set("body", v)}
              rows={14}
              note={note(current.hints.body)}
            />

            <FaqField
              value={data.faqRaw}
              onChange={(v) => set("faqRaw", v)}
              rows={10}
              note={note(current.hints.faq)}
            />

            <div className={styles.subTitle}>SEO</div>
            <SeoField kind="title" label="Meta title" value={data.metaTitle} onChange={(v) => set("metaTitle", v)} />
            <SeoField
              kind="description"
              label="Meta description"
              value={data.metaDescription}
              onChange={(v) => set("metaDescription", v)}
            />
            <SerpPreview title={data.metaTitle} description={data.metaDescription} path={path} />

            <div className={styles.formActions}>
              <button type="submit" disabled={saving} className={styles.saveBtn}>
                {saving ? "Zapisuję..." : "Zapisz"}
              </button>
              {dirty && !msg && <span className={styles.counter}>Niezapisane zmiany</span>}
              {msg && <p className={msg.includes("!") ? styles.successMsg : styles.errorMsg}>{msg}</p>}
            </div>
          </form>
        </>
      )}
    </AdminShell>
  );
}
