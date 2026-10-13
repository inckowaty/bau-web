"use client";
import { useState, useEffect, useRef } from "react";
import AdminShell from "../AdminShell";
import styles from "../admin.module.css";
import g from "./gallery-admin.module.css";

const LANGS = ["de", "pl", "en"];
const ALT_MAX = 125;
const ALT_PLACEHOLDER = {
  de: "z. B. Neu verlegter Vinylboden im Wohnzimmer in Sulingen",
  pl: "np. Nowa podłoga winylowa w salonie w Sulingen",
  en: "e.g. New vinyl flooring in a living room in Sulingen",
};
const CAPTION_PLACEHOLDER = {
  de: "z. B. Vinylboden im Wohnzimmer",
  pl: "np. Podłoga winylowa w salonie",
  en: "e.g. Vinyl flooring in a living room",
};
const JSON_HEADERS = { "Content-Type": "application/json" };
const toUrl = (p) => p?.startsWith('/uploads/') ? p.replace('/uploads/', '/api/files/') : p;

const emptyTexts = () => ({
  category: "",
  de: { alt: "", caption: "" },
  pl: { alt: "", caption: "" },
  en: { alt: "", caption: "" },
});
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const isDirty = (gr) => !same(gr.draft, gr.saved);
const trimTexts = (d) => ({
  category: d.category,
  ...Object.fromEntries(LANGS.map((l) => [l, { alt: d[l].alt.trim(), caption: d[l].caption.trim() }])),
});
const errorText = async (res, fallback) => {
  const data = await res.json().catch(() => null);
  return data?.message || fallback;
};

// Zdjęcie = jeden wiersz na język z tym samym adresem (url). Łączymy wiersze w grupy po url.
async function fetchGroups() {
  const lists = await Promise.all(
    LANGS.map((l) => fetch(`/api/admin/gallery?lang=${l}`).then((r) => (r.ok ? r.json() : [])))
  );
  const groups = [];
  LANGS.forEach((l, li) => {
    for (const row of lists[li]) {
      // pierwsza grupa z tym url, która nie ma jeszcze wiersza w tym języku (duplikaty → osobne grupy)
      let gr = groups.find((x) => x.url === row.url && !x.ids[l]);
      if (!gr) {
        const dup = groups.filter((x) => x.url === row.url).length;
        gr = {
          gid: dup ? `${row.url}#${dup}` : row.url,
          url: row.url,
          width: row.width,
          height: row.height,
          sortOrder: row.sortOrder,
          firstId: row.id,
          ids: {},
          saved: emptyTexts(),
        };
        groups.push(gr);
      }
      gr.ids[l] = row.id;
      gr.saved[l] = { alt: row.alt || "", caption: row.caption || "" };
      if (!gr.saved.category && row.category) gr.saved.category = row.category; // DE ma pierwszeństwo
      if (!gr.width && row.width) gr.width = row.width;
      if (!gr.height && row.height) gr.height = row.height;
    }
  });
  groups.sort((a, b) => a.sortOrder - b.sortOrder || a.firstId - b.firstId);
  return groups.map((gr) => ({ ...gr, draft: structuredClone(gr.saved), status: "", error: "" }));
}

export default function GalleryEditor() {
  const [groups, setGroups] = useState([]);
  const [services, setServices] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false); // zmiana kolejności / usuwanie w toku
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);

  // przeładowanie z bazy – niezapisane zmiany w innych kartach zostają
  const load = async () => {
    const fresh = await fetchGroups();
    setGroups((prev) =>
      fresh.map((gr) => {
        const old = prev.find((p) => p.gid === gr.gid);
        return old && isDirty(old) ? { ...gr, draft: old.draft } : gr;
      })
    );
    setLoaded(true);
  };

  useEffect(() => {
    load();
    // kategorie = usługi (DE): value = key, label = nazwa
    fetch("/api/admin/services?lang=de")
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        const seen = new Set();
        setServices(
          list
            .filter((s) => s.key && !seen.has(s.key) && seen.add(s.key))
            .map((s) => ({ value: s.key, label: s.title || s.key }))
        );
      })
      .catch(() => setServices([]));
  }, []);

  // ostrzeżenie przy wyjściu ze strony z niezapisanymi zmianami
  const anyDirty = groups.some(isDirty);
  useEffect(() => {
    if (!anyDirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [anyDirty]);

  const patch = (gid, fn) => setGroups((gs) => gs.map((gr) => (gr.gid === gid ? { ...gr, ...fn(gr) } : gr)));
  const setText = (gid, l, field, value) =>
    patch(gid, (gr) => ({ draft: { ...gr.draft, [l]: { ...gr.draft[l], [field]: value } }, status: "", error: "" }));
  const setCategory = (gid, value) =>
    patch(gid, (gr) => ({ draft: { ...gr.draft, category: value }, status: "", error: "" }));

  /* ---------- upload ---------- */
  const upload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // ten sam plik można wybrać ponownie
    if (!files.length) return;
    setUploading(true);
    setMsg("");

    // nowe zdjęcia na koniec, każde z własną pozycją
    let order = groups.reduce((m, gr) => Math.max(m, gr.sortOrder), -1) + 1;
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("subdir", "gallery");
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (!upRes.ok) throw new Error(await errorText(upRes, `Nie udało się wysłać pliku ${file.name}.`));
        const { url } = await upRes.json();

        const img = new window.Image();
        img.src = toUrl(url);
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });

        // ten sam url dla wszystkich języków
        for (const l of LANGS) {
          const res = await fetch("/api/admin/gallery", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify({
              lang: l,
              url,
              width: img.naturalWidth || null,
              height: img.naturalHeight || null,
              sortOrder: order,
              alt: "",
              caption: "",
              category: "",
            }),
          });
          if (!res.ok) throw new Error(await errorText(res, `Nie udało się zapisać zdjęcia (${l.toUpperCase()}).`));
        }
        order++;
      }
    } catch (err) {
      setMsg(err.message || "Błąd wysyłania.");
    }

    setUploading(false);
    load();
  };

  /* ---------- zapis opisów i kategorii (3 wiersze) ---------- */
  const save = async (gid) => {
    const gr = groups.find((x) => x.gid === gid);
    if (!gr) return;
    const sent = gr.draft;
    const clean = trimTexts(sent);
    patch(gid, () => ({ status: "saving", error: "" }));

    // id wierszy utworzonych w tym zapisie zachowujemy także przy częściowym błędzie (ponowny zapis = PUT, nie duplikat)
    const ids = { ...gr.ids };
    try {
      const results = await Promise.allSettled(
        LANGS.map(async (l) => {
          const payload = { alt: clean[l].alt, caption: clean[l].caption, category: clean.category };
          const res = ids[l]
            ? await fetch(`/api/admin/gallery/${ids[l]}`, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify(payload) })
            : // brak wiersza w tym języku – tworzymy go z tym samym adresem
              await fetch("/api/admin/gallery", {
                method: "POST",
                headers: JSON_HEADERS,
                body: JSON.stringify({ lang: l, url: gr.url, width: gr.width, height: gr.height, sortOrder: gr.sortOrder, ...payload }),
              });
          if (!res.ok) throw new Error(await errorText(res, `Błąd zapisu (${l.toUpperCase()}).`));
          const row = await res.json();
          ids[l] = row.id;
        })
      );
      const failed = results.find((r) => r.status === "rejected");
      if (failed) throw failed.reason;
      patch(gid, (cur) => ({
        ids,
        saved: clean,
        // jeśli w trakcie zapisu nikt nic nie zmienił – pokazujemy wersję po przycięciu spacji
        draft: same(cur.draft, sent) ? structuredClone(clean) : cur.draft,
        status: "saved",
        error: "",
      }));
    } catch (err) {
      patch(gid, () => ({ ids: { ...ids }, status: "", error: err?.message || "Błąd zapisu." }));
    }
  };

  /* ---------- kolejność ---------- */
  const move = async (index, dir) => {
    const j = index + dir;
    if (busy || j < 0 || j >= groups.length) return;
    const order = [...groups];
    [order[index], order[j]] = [order[j], order[index]];
    // pozycja na liście = sortOrder (0..n-1) we wszystkich językach; zapisujemy tylko zmienione
    const changed = order.map((gr, i) => ({ gr, i })).filter(({ gr, i }) => gr.sortOrder !== i);
    const gidOrder = order.map((gr) => gr.gid);

    setBusy(true);
    setMsg("");
    setGroups((gs) => {
      const byGid = new Map(gs.map((x) => [x.gid, x]));
      const moved = gidOrder.map((gid, i) => byGid.has(gid) && { ...byGid.get(gid), sortOrder: i }).filter(Boolean);
      return [...moved, ...gs.filter((x) => !gidOrder.includes(x.gid))];
    });

    try {
      await Promise.all(
        changed.flatMap(({ gr, i }) =>
          LANGS.filter((l) => gr.ids[l]).map(async (l) => {
            const res = await fetch(`/api/admin/gallery/${gr.ids[l]}`, {
              method: "PUT",
              headers: JSON_HEADERS,
              body: JSON.stringify({ sortOrder: i }),
            });
            if (!res.ok) throw new Error(await errorText(res, "Nie udało się zmienić kolejności."));
          })
        )
      );
    } catch (err) {
      setMsg(err.message || "Nie udało się zmienić kolejności.");
      await load();
    }
    setBusy(false);
  };

  /* ---------- usuwanie (wszystkie języki) ---------- */
  const del = async (gr) => {
    if (!window.confirm("Usunąć to zdjęcie ze wszystkich wersji językowych?")) return;
    setBusy(true);
    setMsg("");
    try {
      for (const l of LANGS) {
        if (!gr.ids[l]) continue;
        const res = await fetch(`/api/admin/gallery/${gr.ids[l]}`, { method: "DELETE" });
        if (!res.ok) throw new Error(await errorText(res, `Nie udało się usunąć (${l.toUpperCase()}).`));
      }
    } catch (err) {
      setMsg(err.message || "Błąd usuwania.");
    }
    await load();
    setBusy(false);
  };

  const categoryLabel = (key) => services.find((s) => s.value === key)?.label;
  const missingAlt = groups.filter((gr) => LANGS.some((l) => !gr.saved[l].alt)).length;

  return (
    <AdminShell>
      <h1 className={styles.pageTitle}>Galeria</h1>
      <p className={g.intro}>
        Zdjęcie jest wspólne dla wszystkich języków – opis ALT i podpis ustawiasz osobno dla DE, PL i EN.
      </p>

      <div className={g.hint}>
        <p>
          <strong>Opis ALT</strong> (dla Google i czytników ekranu): opisz, co widać na zdjęciu, i naturalnie
          wpleć usługę oraz „Sulingen”, np. <em>„Nowa podłoga winylowa w salonie w Sulingen”</em>. Maks. ok.{" "}
          {ALT_MAX} znaków, bez „Zdjęcie…” na początku i bez upychania słów kluczowych.
        </p>
        <p>
          <strong>Podpis</strong> (opcjonalny): krótki tekst widoczny na kafelku i w powiększeniu.{" "}
          <strong>Kategoria</strong>: przypisuje zdjęcie do usługi – pojawi się w filtrze galerii i na stronie tej usługi.
        </p>
      </div>

      <div className={styles.uploadArea} onClick={() => fileRef.current?.click()}>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={upload} />
        {uploading ? "Wysyłanie..." : "Kliknij aby dodać zdjęcia"}
      </div>

      {msg && <p className={styles.errorMsg} style={{ marginBottom: "1rem" }}>{msg}</p>}

      {groups.length > 0 && (
        <p className={g.stats}>
          Zdjęć: <b>{groups.length}</b>
          {missingAlt > 0 && (
            <>
              {" · "}
              <span className={g.warnText}>bez pełnego opisu ALT: {missingAlt}</span>
            </>
          )}
        </p>
      )}

      <div className={g.list}>
        {groups.map((gr, index) => {
          const dirty = isDirty(gr);
          const saving = gr.status === "saving";
          const complete = LANGS.every((l) => gr.ids[l]);
          const missing = LANGS.filter((l) => !gr.saved[l].alt).map((l) => l.toUpperCase());
          const unknownCategory = gr.draft.category && !categoryLabel(gr.draft.category);
          const fid = `img${gr.firstId}`;

          return (
            <div key={gr.gid} className={`${g.card} ${dirty ? g.cardDirty : ""}`}>
              <div className={g.thumbCol}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={g.thumb}
                  src={toUrl(gr.url)}
                  alt={gr.saved.de.alt || ""}
                  loading="lazy"
                />
                <div className={g.order}>
                  <span className={g.position}>#{index + 1}</span>
                  <button
                    type="button"
                    className={g.iconBtn}
                    onClick={() => move(index, -1)}
                    disabled={busy || index === 0}
                    title="Przesuń wyżej"
                    aria-label="Przesuń wyżej"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={g.iconBtn}
                    onClick={() => move(index, 1)}
                    disabled={busy || index === groups.length - 1}
                    title="Przesuń niżej"
                    aria-label="Przesuń niżej"
                  >
                    ↓
                  </button>
                </div>
                {gr.width && gr.height ? (
                  <span className={g.meta}>
                    {gr.width}×{gr.height}px
                  </span>
                ) : null}
              </div>

              <div className={g.body}>
                <div className={g.topRow}>
                  <div className={g.categoryField}>
                    <label className={g.label} htmlFor={`${fid}-cat`}>
                      Kategoria (usługa)
                    </label>
                    <select
                      id={`${fid}-cat`}
                      className={g.select}
                      value={gr.draft.category}
                      onChange={(e) => setCategory(gr.gid, e.target.value)}
                    >
                      <option value="">— brak —</option>
                      {services.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                      {unknownCategory && (
                        <option value={gr.draft.category}>{gr.draft.category} (usługa nie istnieje)</option>
                      )}
                    </select>
                  </div>
                  {(missing.length > 0 || !complete) && (
                    <div className={g.badges}>
                      {missing.length > 0 && <span className={g.badge}>brak ALT: {missing.join(", ")}</span>}
                      {!complete && (
                        <span className={g.badge}>
                          brak wiersza: {LANGS.filter((l) => !gr.ids[l]).map((l) => l.toUpperCase()).join(", ")} – utworzy się przy zapisie
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className={g.langs}>
                  {LANGS.map((l) => {
                    const alt = gr.draft[l].alt;
                    const len = alt.trim().length;
                    return (
                      <div key={l} className={g.langBlock}>
                        <span className={g.langName}>{l.toUpperCase()}</span>
                        <div>
                          <label className={g.label} htmlFor={`${fid}-${l}-alt`}>
                            Opis ALT
                          </label>
                          <textarea
                            id={`${fid}-${l}-alt`}
                            className={g.textarea}
                            rows={2}
                            value={alt}
                            placeholder={ALT_PLACEHOLDER[l]}
                            onChange={(e) => setText(gr.gid, l, "alt", e.target.value)}
                          />
                          <span className={`${g.counter} ${len > ALT_MAX ? g.counterOver : ""}`}>
                            {len}/{ALT_MAX}
                          </span>
                        </div>
                        <div>
                          <label className={g.label} htmlFor={`${fid}-${l}-caption`}>
                            Podpis
                          </label>
                          <input
                            id={`${fid}-${l}-caption`}
                            className={g.input}
                            type="text"
                            value={gr.draft[l].caption}
                            placeholder={CAPTION_PLACEHOLDER[l]}
                            onChange={(e) => setText(gr.gid, l, "caption", e.target.value)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={g.actions}>
                  <button
                    type="button"
                    className={styles.saveBtn}
                    onClick={() => save(gr.gid)}
                    disabled={saving || (!dirty && complete)}
                  >
                    {saving ? "Zapisywanie..." : "Zapisz"}
                  </button>
                  {gr.error && <span className={styles.errorMsg}>{gr.error}</span>}
                  {!gr.error && gr.status === "saved" && !dirty && <span className={styles.successMsg}>Zapisano.</span>}
                  {!gr.error && dirty && !saving && <span className={g.dirtyText}>Niezapisane zmiany</span>}
                  <button type="button" className={g.deleteBtn} onClick={() => del(gr)} disabled={busy || saving}>
                    Usuń zdjęcie
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loaded && groups.length === 0 && (
        <p style={{ color: "#aaa", textAlign: "center" }}>Brak zdjęć w galerii.</p>
      )}
    </AdminShell>
  );
}
