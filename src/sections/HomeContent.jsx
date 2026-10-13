// src/sections/HomeContent.jsx (komponent serwerowy – cała treść trafia do HTML)
import Link from "next/link";
import Image from "next/image";
import { House, PaintRoller, BrickWall, Layers, Cable, Hammer, ArrowRight, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import RichText from "@/components/RichText";
import { servicePath } from "@/lib/seo";
import { COMPANY } from "@/lib/company";
import styles from "./HomeContent.module.css";

const T = {
  de: {
    servicesHeading: "Unsere Leistungen",
    more: "Mehr erfahren",
    all: "Alle Leistungen ansehen",
    ctaTitle: "Jetzt unverbindlich anfragen",
    ctaText: "Telefonisch, per WhatsApp oder über unser Kontaktformular.",
    ctaButton: "Zum Kontaktformular",
  },
  pl: {
    servicesHeading: "Nasze usługi",
    more: "Dowiedz się więcej",
    all: "Zobacz wszystkie usługi",
    ctaTitle: "Zapytaj o wycenę",
    ctaText: "Telefonicznie, przez WhatsApp lub przez formularz kontaktowy.",
    ctaButton: "Przejdź do formularza",
  },
  en: {
    servicesHeading: "Our services",
    more: "Learn more",
    all: "View all services",
    ctaTitle: "Request a quote",
    ctaText: "By phone, via WhatsApp or through our contact form.",
    ctaButton: "Go to contact form",
  },
};

// ikona usługi: grafika z CMS, a gdy jej brak – ikona lucide wg klucza usługi
const ICONS = {
  innenausbau: House,
  renovierung: PaintRoller,
  trockenbau: BrickWall,
  bodenleger: Layers,
  leitungsverlegung: Cable,
};

export function ServiceIcon({ service, size = 28, className = "" }) {
  const Known = ICONS[service.key];
  if (Known) return <Known size={size} strokeWidth={1.75} className={className} />;
  const url = service.iconUrl || service.acf?.leistung_icon?.url;
  if (url) {
    return <Image src={url} alt="" width={size} height={size} className={className} />;
  }
  const Icon = ICONS[service.key] || Hammer;
  return <Icon size={size} strokeWidth={1.75} className={className} />;
}

export default function HomeContent({ intro, body, services = [], servicesPath, contactPath, lang }) {
  const t = T[lang] || T.de;

  return (
    <div className={styles.home}>
      {intro && (
        <section className={styles.intro}>
          <RichText markdown={intro} className={styles.introText} />
        </section>
      )}

      {services.length > 0 && (
        <section className={styles.services} aria-labelledby="home-services">
          <div className={styles.sectionHead}>
            <h2 id="home-services" className={styles.sectionTitle}>{t.servicesHeading}</h2>
          </div>

          <ul className={styles.grid}>
            {services.map(s => {
              const href = servicePath(lang, s.slug);
              return (
                <li key={s.id} className={styles.card}>
                  <span className={styles.iconBadge}>
                    <ServiceIcon service={s} className={styles.icon} />
                  </span>
                  <h3 className={styles.cardTitle}>
                    <Link href={href} className={styles.cardLink}>{s.title.rendered}</Link>
                  </h3>
                  {s.acf?.leistung_excerpt && (
                    <p className={styles.excerpt}>{s.acf.leistung_excerpt}</p>
                  )}
                  <span className={styles.more} aria-hidden="true">
                    {t.more}
                    <ArrowRight size={18} />
                  </span>
                </li>
              );
            })}
          </ul>

          <div className={styles.allWrap}>
            <Link href={servicesPath} className={styles.allLink}>
              {t.all}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}

      {body && (
        <section className={styles.body}>
          <RichText markdown={body} className={styles.bodyText} />
        </section>
      )}

      <section className={styles.ctaBand}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaCopy}>
            <p className={styles.ctaTitle}>{t.ctaTitle}</p>
            <p className={styles.ctaText}>{t.ctaText}</p>
          </div>
          <div className={styles.ctaActions}>
            <Link href={contactPath} className={styles.ctaButton}>{t.ctaButton}</Link>
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
      </section>
    </div>
  );
}
