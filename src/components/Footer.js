import styles from "./Footer.module.css";
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>Bau GmbH © {new Date().getFullYear()} • USt-IdNr DE-123456789</p>
      <p>
        <Link href="/impressum">Impressum</Link>
        <span style={{ margin: "0 0.5rem" }}>•</span>
        <Link href="/datenschutz">Datenschutz</Link>
      </p>
    </footer>
  );
}
