import JsonLd from './JsonLd';
import styles from './Faq.module.css';

const HEADINGS = {
  de: 'Häufige Fragen',
  pl: 'Najczęstsze pytania',
  en: 'Frequently asked questions',
};

// FAQ z CMS (items z parseFaq) + dane strukturalne FAQPage
export default function Faq({ items, lang, heading }) {
  if (!items?.length) return null;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <section className={styles.faq}>
      <h2 className={styles.title}>{heading || HEADINGS[lang]}</h2>
      <div className={styles.list}>
        {items.map(({ q, a }, i) => (
          <details key={i} className={styles.item}>
            <summary className={styles.question}>{q}</summary>
            <p className={styles.answer}>{a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={ld} />
    </section>
  );
}
