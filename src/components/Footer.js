import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>Bau GmbH © {new Date().getFullYear()} • USt-IdNr DE-123456789</p>
      <p>
        <a href="/impressum">Impressum</a>
        <span style={{ margin: "0 0.5rem" }}>•</span>
        <a href="/datenschutz">Datenschutz</a>
      </p>
    </footer>
  );
}
