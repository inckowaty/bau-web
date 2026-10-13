"use client";
import { useEffect, useId, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { renderMarkdown, parseFaq } from "@/lib/markdown";
import { SITE_URL } from "@/lib/seo";
import styles from "./admin.module.css";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pages", label: "Treści i SEO" },
  { href: "/admin/home", label: "Strona główna" },
  { href: "/admin/about", label: "O nas" },
  { href: "/admin/services", label: "Usługi" },
  { href: "/admin/gallery", label: "Galeria" },
  { href: "/admin/nav", label: "Nawigacja" },
  { href: "/admin/messages", label: "Wiadomości" },
];

export default function AdminShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    // Quick auth check — try to hit a protected endpoint
    fetch("/api/admin/home?lang=de")
      .then((r) => {
        if (r.status === 401) router.replace("/admin/login");
        else setOk(true);
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  if (!ok) return null;

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          GRP-BAU
          <span>Panel administracyjny</span>
        </div>
        <ul className={styles.navList}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={pathname === link.href ? styles.langTabActive : ""}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <button onClick={logout} className={styles.logoutBtn}>
          Wyloguj
        </button>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

/*──────────────── Wspólne pola treści i SEO ────────────────
  Używane w zakładkach "Usługi" i "Treści i SEO". */

export function MarkdownHelp() {
  return (
    <small className={styles.help}>
      Markdown – <code>## Nagłówek</code>, <code>### Podnagłówek</code>, <code>- punkt listy</code>,{" "}
      <code>**pogrubienie**</code>, <code>[tekst](/adres)</code>. Pusta linia = nowy akapit.
    </small>
  );
}

// pole tekstowe z Markdownem + podgląd
export function MarkdownField({ label, value, onChange, rows = 14, note }) {
  const id = useId();
  const [preview, setPreview] = useState(false);
  const html = renderMarkdown(value || "");

  return (
    <div className={styles.field}>
      <div className={styles.fieldHead}>
        <label htmlFor={id}>{label}</label>
        <button type="button" className={styles.linkBtn} onClick={() => setPreview((p) => !p)}>
          {preview ? "Edytuj" : "Podgląd"}
        </button>
      </div>
      {note && <small className={styles.help}>{note}</small>}
      {preview ? (
        html ? (
          <div className={styles.preview} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className={styles.preview}><em>(puste)</em></div>
        )
      ) : (
        <textarea id={id} value={value || ""} onChange={(e) => onChange(e.target.value)} rows={rows} />
      )}
      <MarkdownHelp />
    </div>
  );
}

// FAQ: pytanie w pierwszej linii, odpowiedź pod spodem, pusta linia między pytaniami
export function FaqField({ label = "FAQ – pytania i odpowiedzi", value, onChange, rows = 10, note }) {
  const id = useId();
  const filled = !!(value || "").trim();
  const count = filled ? parseFaq(value).length : 0;

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {note && <small className={styles.help}>{note}</small>}
      <textarea id={id} value={value || ""} onChange={(e) => onChange(e.target.value)} rows={rows} />
      <small className={styles.help}>
        Pytanie w pierwszej linii, odpowiedź pod spodem, pusta linia między pytaniami.
        {filled && <> Rozpoznane pytania: <strong>{count}</strong>.</>}
      </small>
    </div>
  );
}

const SEO_LIMITS = {
  title: { max: 60, hint: "zalecane do 60 znaków" },
  description: { min: 120, max: 160, hint: "zalecane 120–160 znaków" },
};

// meta title / meta description z licznikiem znaków
export function SeoField({ kind, label, value, onChange, emptyHint = "Puste – zostanie użyty tekst domyślny." }) {
  const id = useId();
  const lim = SEO_LIMITS[kind];
  const len = (value || "").length;
  const tooLong = len > lim.max;
  const tooShort = !!lim.min && len > 0 && len < lim.min;

  let counterClass = styles.counter;
  if (len > 0) counterClass += ` ${tooLong || tooShort ? styles.counterWarn : styles.counterOk}`;

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {kind === "description" ? (
        <textarea id={id} value={value || ""} onChange={(e) => onChange(e.target.value)} rows={3} className={styles.shortArea} />
      ) : (
        <input id={id} value={value || ""} onChange={(e) => onChange(e.target.value)} />
      )}
      <small className={counterClass}>
        {len === 0
          ? `${emptyHint} (${lim.hint})`
          : `${len} zn. – ${lim.hint}${tooLong ? " – za długi, Google go utnie" : tooShort ? " – za krótki" : ""}`}
      </small>
    </div>
  );
}

// podgląd wyniku w Google
export function SerpPreview({ title, description, path }) {
  const cut = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
  const host = SITE_URL.replace(/^https?:\/\//, "");
  const crumbs = (path || "/").split("/").filter(Boolean);

  return (
    <div className={styles.serp}>
      <span className={styles.serpLabel}>Podgląd w Google</span>
      <span className={styles.serpUrl}>{[host, ...crumbs].join(" › ")}</span>
      <span className={styles.serpTitle}>{cut(title, 60) || "(tytuł domyślny)"}</span>
      <span className={styles.serpDesc}>{cut(description, 160) || "(opis domyślny)"}</span>
    </div>
  );
}
