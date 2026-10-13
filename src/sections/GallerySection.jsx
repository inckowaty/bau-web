"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";
import { pagePath } from "@/lib/seo";
import styles from "./GallerySection.module.css";

const TEXT = {
  de: {
    heading: "Galerie",
    all: "Alle",
    alt: "Projekt von GRP Bau in Sulingen",
    filter: "Bilder nach Leistung filtern",
    more: "Mehr zur Leistung",
    dialog: "Bildergalerie",
    close: "Schließen",
    prev: "Vorheriges Bild",
    next: "Nächstes Bild",
    empty: "Noch keine Bilder vorhanden.",
    cta: "Ihr Projekt in Sulingen?",
    ctaLink: "Jetzt anfragen",
  },
  pl: {
    heading: "Galeria",
    all: "Wszystkie",
    alt: "Realizacja GRP Bau w Sulingen",
    filter: "Filtruj zdjęcia według usługi",
    more: "Więcej o usłudze",
    dialog: "Galeria zdjęć",
    close: "Zamknij",
    prev: "Poprzednie zdjęcie",
    next: "Następne zdjęcie",
    empty: "Brak zdjęć w galerii.",
    cta: "Planują Państwo remont w Sulingen?",
    ctaLink: "Zapytaj o wycenę",
  },
  en: {
    heading: "Gallery",
    all: "All",
    alt: "GRP Bau project in Sulingen",
    filter: "Filter images by service",
    more: "More about this service",
    dialog: "Image gallery",
    close: "Close",
    prev: "Previous image",
    next: "Next image",
    empty: "No images yet.",
    cta: "Planning a project in Sulingen?",
    ctaLink: "Request a quote",
  },
};

// proporcje zdjęcia (szerokość / wysokość); brak wymiarów → zdjęcie pionowe 3:4
function ratio(img) {
  const r = img.width && img.height ? img.width / img.height : 0.75;
  return Math.min(Math.max(r, 0.4), 2.5);
}

const JOINT = 6; // szerokość fugi w px (= --joint w CSS)

// docelowa wysokość rzędu zależnie od szerokości muru
const targetRow = (w) => (w < 600 ? 150 : w < 1000 ? 210 : 270);

/*
 * Podział na rzędy (jak w programie do składu tekstu): wybieramy miejsca łamania rzędów tak,
 * żeby wysokości wszystkich rzędów były jak najbliższe docelowej. Każdy rząd wypełnia całą
 * szerokość, zdjęcia zachowują proporcje. W ostatnim rzędzie resztę miejsca zajmuje kostka-zaproszenie.
 */
function justify(ars, W, target, gap) {
  const n = ars.length;
  const minCta = Math.min(target * 0.9, W);
  const best = new Array(n + 1).fill(Infinity);
  const prev = new Array(n + 1).fill(-1);
  best[0] = 0;

  for (let j = 1; j <= n; j++) {
    let sum = 0;
    for (let i = j - 1; i >= 0 && j - i <= 12; i--) {
      sum += ars[i];
      const k = j - i;
      let cost;
      if (j === n) {
        // ostatni rząd: zdjęcia + kostka-zaproszenie (min. minCta szerokości)
        // (zbyt szeroka kostka też kosztuje – wolimy więcej zdjęć w ostatnim rzędzie)
        const h = Math.min(target, (W - gap * k - minCta) / sum);
        const ctaW = W - gap * k - sum * h;
        const extra = Math.max(0, ctaW - 1.5 * target) * 0.2;
        cost = h >= target * 0.6 ? (target - h) ** 2 + extra ** 2 : Infinity;
      } else {
        const h = (W - gap * (k - 1)) / sum;
        cost = (h - target) ** 2 + (h < target * 0.6 || h > target * 1.6 ? 1e7 : 0);
      }
      if (best[i] + cost < best[j]) {
        best[j] = best[i] + cost;
        prev[j] = i;
      }
    }
  }
  if (!Number.isFinite(best[n])) return null;

  const rows = [];
  for (let j = n; j > 0; j = prev[j]) rows.unshift([prev[j], j]);

  const tiles = [];
  let cta = null;
  rows.forEach(([i, j], r) => {
    const k = j - i;
    const sum = ars.slice(i, j).reduce((a, b) => a + b, 0);
    const last = r === rows.length - 1;
    const h = Math.floor(last ? Math.min(target, (W - gap * k - minCta) / sum) : (W - gap * (k - 1)) / sum);
    let used = 0;
    for (let x = i; x < j; x++) {
      const w = !last && x === j - 1 ? W - gap * (k - 1) - used : Math.floor(ars[x] * h);
      tiles.push({ w, h });
      used += w;
    }
    if (last) cta = { w: W - gap * k - used, h };
  });
  return { tiles, cta };
}

// szerokość kafla ≈ proporcje × wysokość rzędu (+ zapas na rozciągnięcie rzędu)
function sizesFor(ar) {
  const px = (row) => `${Math.ceil(ar * row * 1.45)}px`;
  return `(max-width: 640px) ${px(150)}, (max-width: 1024px) ${px(210)}, ${px(270)}`;
}

export default function GallerySection({ images = [], categories = [], heading, intro, lang = "de" }) {
  const t = TEXT[lang] || TEXT.de;
  const [active, setActive] = useState(""); // "" = wszystkie
  const [idx, setIdx] = useState(-1);
  const touchStart = useRef(null);
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);

  const visible = useMemo(
    () => (active ? images.filter((img) => img.category === active) : images),
    [images, active]
  );
  const activeCat = categories.find((c) => c.key === active);
  const count = visible.length;
  const isOpen = idx >= 0 && idx < count;
  const current = isOpen ? visible[idx] : null;
  const altOf = (img) => img.alt || img.caption || t.alt;
  const introHtml = useMemo(() => renderMarkdown(intro), [intro]);

  // dokładny podział na rzędy po zmierzeniu szerokości (do tego czasu działa układ z CSS)
  const gridRef = useRef(null);
  const [layout, setLayout] = useState(null);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ars = visible.map(ratio);
    const compute = () => {
      const W = Math.floor(el.clientWidth);
      setLayout(W > 0 ? justify(ars, W, targetRow(W), JOINT) : null);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [visible]);
  const fixed = (box) => (box ? { width: box.w, height: box.h, flex: "none", aspectRatio: "auto" } : null);

  const choose = (key) => {
    setIdx(-1);
    setActive(key);
  };

  const open = (i, el) => {
    returnFocusRef.current = el;
    setIdx(i);
  };
  const close = () => setIdx(-1);
  const prev = () => setIdx((i) => (i - 1 + count) % count);
  const next = () => setIdx((i) => (i + 1) % count);

  // blokada przewijania strony + fokus w oknie (i powrót fokusu na kafel po zamknięciu)
  useEffect(() => {
    if (!isOpen) return;
    const { body, documentElement } = document;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    dialogRef.current?.focus();
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      const el = returnFocusRef.current;
      if (el && document.contains(el)) el.focus({ preventScroll: true });
    };
  }, [isOpen]);

  // klawiatura: ← → Esc, Tab nie wychodzi poza okno
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIdx(-1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIdx((i) => (i - 1 + count) % count);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setIdx((i) => (i + 1) % count);
      } else if (e.key === "Tab" && dialogRef.current) {
        const items = [...dialogRef.current.querySelectorAll("button")];
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        const activeEl = document.activeElement;
        if (e.shiftKey && (activeEl === first || activeEl === dialogRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (activeEl === last || !dialogRef.current.contains(activeEl))) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, count]);

  const onTouchStart = (e) => {
    const p = e.touches[0];
    touchStart.current = { x: p.clientX, y: p.clientY };
  };
  const onTouchEnd = (e) => {
    if (!touchStart.current || count < 2) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - touchStart.current.x;
    const dy = p.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) prev();
      else next();
    }
  };

  // klik w tło lub zdjęcie zamyka; przyciski i podpis – nie
  const onOverlayClick = (e) => {
    if (!e.target.closest("button, figcaption")) close();
  };

  return (
    <section className={styles.gallery}>
      <header className={styles.head}>
        <h1 className={styles.title}>{heading || t.heading}</h1>
        {introHtml && (
          <div className={styles.intro} dangerouslySetInnerHTML={{ __html: introHtml }} />
        )}
      </header>

      {categories.length > 0 && (
        <div className={styles.filters} role="group" aria-label={t.filter}>
          <button
            type="button"
            className={styles.filterBtn}
            aria-pressed={!active}
            onClick={() => choose("")}
          >
            {t.all}
          </button>
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              className={styles.filterBtn}
              aria-pressed={active === c.key}
              onClick={() => choose(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {activeCat?.path && (
        <p className={styles.serviceLink}>
          <Link href={activeCat.path}>
            {t.more}: {activeCat.label}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </p>
      )}

      {count > 0 ? (
        <div className={styles.wall}>
          <div className={styles.grid} ref={gridRef}>
            {visible.map((img, i) => (
              <figure
                key={img.id ?? img.url}
                className={styles.tile}
                style={fixed(layout?.tiles[i]) || { "--ar": ratio(img) }}
              >
                <button
                  type="button"
                  className={styles.tileBtn}
                  aria-haspopup="dialog"
                  onClick={(e) => open(i, e.currentTarget)}
                >
                  <Image
                    src={img.url}
                    alt={altOf(img)}
                    fill
                    sizes={sizesFor(ratio(img))}
                    priority={i < 2}
                    className={styles.tileImg}
                  />
                </button>
                {img.caption && (
                  <figcaption className={styles.caption}>
                    <span>{img.caption}</span>
                  </figcaption>
                )}
              </figure>
            ))}
            <div className={styles.ctaTile} style={fixed(layout?.cta) || undefined}>
              <p className={styles.ctaText}>{t.cta}</p>
              <Link href={pagePath("contact", lang)} className={styles.ctaLink}>
                {t.ctaLink}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <p className={styles.empty}>{t.empty}</p>
      )}

      {current && (
        <div
          ref={dialogRef}
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={t.dialog}
          tabIndex={-1}
          onClick={onOverlayClick}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button type="button" className={`${styles.lbBtn} ${styles.lbClose}`} aria-label={t.close} onClick={close}>
            <X size={26} aria-hidden="true" />
          </button>
          {count > 1 && (
            <button type="button" className={`${styles.lbBtn} ${styles.lbPrev}`} aria-label={t.prev} onClick={prev}>
              <ChevronLeft size={30} aria-hidden="true" />
            </button>
          )}

          <figure className={styles.lbFigure}>
            <div className={styles.lbStage}>
              <Image src={current.url} alt={altOf(current)} fill sizes="100vw" className={styles.lbImg} />
            </div>
            <figcaption className={styles.lbBar}>
              {current.caption && <span className={styles.lbCaption}>{current.caption}</span>}
              <span className={styles.lbCounter} aria-live="polite">
                {idx + 1} / {count}
              </span>
            </figcaption>
          </figure>

          {count > 1 && (
            <button type="button" className={`${styles.lbBtn} ${styles.lbNext}`} aria-label={t.next} onClick={next}>
              <ChevronRight size={30} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
