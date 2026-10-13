// src/sections/ServiceDetail.jsx (komponent serwerowy – podstrona jednej usługi)
import Link from "next/link";
import Image from "next/image";
import { CircleCheck, ArrowRight, Phone, ChevronRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import RichText from "@/components/RichText";
import Faq from "@/components/Faq";
import { ServiceIcon } from "@/sections/HomeContent";
import { servicePath, pagePath, SERVICE_MAX_IMAGES } from "@/lib/seo";
import { COMPANY } from "@/lib/company";
import styles from "./ServiceDetail.module.css";

const MAX_IMAGES = SERVICE_MAX_IMAGES;

const T = {
  de: {
    in: "in",
    features: "Leistungsumfang",
    gallery: "Projektbeispiele",
    toGallery: "Zur Galerie",
    other: "Weitere Leistungen",
    ctaTitle: "Sie planen ein Projekt?",
    ctaText: "Beschreiben Sie kurz Ihr Vorhaben – wir melden uns mit einem unverbindlichen Angebot.",
    ctaButton: "Angebot anfragen",
  },
  pl: {
    in: "w",
    features: "Zakres prac",
    gallery: "Przykładowe realizacje",
    toGallery: "Przejdź do galerii",
    other: "Inne usługi",
    ctaTitle: "Planują Państwo remont lub wykończenie?",
    ctaText: "Prosimy krótko opisać projekt – odezwiemy się z bezpłatną wyceną.",
    ctaButton: "Poproś o wycenę",
  },
  en: {
    in: "in",
    features: "Scope of work",
    gallery: "Project examples",
    toGallery: "View gallery",
    other: "Other services",
    ctaTitle: "Planning a project?",
    ctaText: "Briefly describe your project and we will get back to you with a no-obligation quote.",
    ctaButton: "Request a quote",
  },
};

export default function ServiceDetail({ service, faq = [], images = [], otherServices = [], breadcrumbs = [], contactPath, lang }) {
  const t = T[lang] || T.de;
  const title = service.title.rendered;
  const h1 = service.h1 || `${title} ${t.in} ${COMPANY.city}`;
  const excerpt = service.acf?.leistung_excerpt || "";
  const features = (service.acf?.leistung_features_raw || "")
    .split(/\r?\n/)
    .map(f => f.trim())
    .filter(Boolean);
  const shown = images.slice(0, MAX_IMAGES);
  const hasContent = Boolean(service.body) || shown.length > 0 || faq.length > 0;

  return (
    <article className={styles.detail}>
      {/* ---------- NAGŁÓWEK ---------- */}
      <header className={styles.hero}>
        <div className={styles.container}>
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
              <ol>
                {breadcrumbs.map((c, i) => {
                  const last = i === breadcrumbs.length - 1;
                  return (
                    <li key={c.path || i}>
                      {last ? (
                        <span aria-current="page">{c.name}</span>
                      ) : (
                        <>
                          <Link href={c.path}>{c.name}</Link>
                          <ChevronRight size={14} className={styles.crumbSep} aria-hidden="true" />
                        </>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}

          <div className={`${styles.heroGrid} ${features.length ? "" : styles.heroSingle}`}>
            <div className={styles.heroText}>
              <span className={styles.iconBadge}>
                <ServiceIcon service={service} size={32} className={styles.icon} />
              </span>
              <h1 className={styles.title}>{h1}</h1>
              {excerpt && <p className={styles.lead}>{excerpt}</p>}

              <div className={styles.heroActions}>
                <Link href={contactPath} className={styles.btnPrimary}>{t.ctaButton}</Link>
                <a href={`tel:${COMPANY.phone}`} className={styles.btnGhost}>
                  <Phone size={18} aria-hidden="true" />
                  {COMPANY.phoneDisplay}
                </a>
              </div>
            </div>

            {features.length > 0 && (
              <section className={styles.featuresCard} aria-labelledby="service-features">
                <h2 id="service-features" className={styles.featuresTitle}>{t.features}</h2>
                <ul className={styles.features}>
                  {features.map((f, i) => (
                    <li key={i}>
                      <CircleCheck size={20} className={styles.check} aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </header>

      {/* ---------- TREŚĆ + PANEL BOCZNY ---------- */}
      <div className={`${styles.container} ${styles.main} ${hasContent ? "" : styles.mainCompact}`}>
        {hasContent && (
          <div className={styles.content}>
            {service.body && <RichText markdown={service.body} className={styles.body} />}

            {shown.length > 0 && (
              <section className={styles.gallery} aria-labelledby="service-gallery">
                <h2 id="service-gallery" className={styles.sectionTitle}>{t.gallery}</h2>
                <ul className={styles.imageGrid}>
                  {shown.map((img, i) => (
                    <li key={img.id ?? i}>
                      <figure className={styles.figure}>
                        <div className={styles.imageBox}>
                          <Image
                            src={img.url}
                            alt={img.alt || title}
                            fill
                            sizes="(max-width: 663px) 50vw, (max-width: 959px) 33vw, 310px"
                            className={styles.image}
                          />
                        </div>
                        {img.caption && <figcaption className={styles.caption}>{img.caption}</figcaption>}
                      </figure>
                    </li>
                  ))}
                </ul>
                <Link href={pagePath("gallery", lang)} className={styles.textLink}>
                  {t.toGallery}
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </section>
            )}

            {faq.length > 0 && (
              <div className={styles.faqWrap}>
                <Faq items={faq} lang={lang} />
              </div>
            )}
          </div>
        )}

        <aside className={styles.sidebar}>
          <div className={styles.ctaBox}>
            <p className={styles.ctaTitle}>{t.ctaTitle}</p>
            <p className={styles.ctaText}>{t.ctaText}</p>
            <Link href={contactPath} className={styles.ctaButton}>{t.ctaButton}</Link>
            <div className={styles.ctaContacts}>
              <a href={`tel:${COMPANY.phone}`} className={styles.ctaContact}>
                <Phone size={18} aria-hidden="true" />
                {COMPANY.phoneDisplay}
              </a>
              <a href={COMPANY.whatsapp} target="_blank" rel="noopener noreferrer" className={styles.ctaContact}>
                <FaWhatsapp size={18} aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </div>

          {otherServices.length > 0 && (
            <nav className={styles.others} aria-labelledby="other-services">
              <h2 id="other-services" className={styles.othersTitle}>{t.other}</h2>
              <ul className={styles.othersList}>
                {otherServices.map(s => (
                  <li key={s.id}>
                    <Link href={servicePath(lang, s.slug)} className={styles.otherLink}>
                      <span className={styles.otherIcon}>
                        <ServiceIcon service={s} size={20} className={styles.icon} />
                      </span>
                      <span className={styles.otherName}>{s.title.rendered}</span>
                      <ArrowRight size={18} className={styles.otherArrow} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
      </div>
    </article>
  );
}
