"use client";
import AdminShell from "./AdminShell";
import styles from "./admin.module.css";

export default function AdminDashboard() {
  return (
    <AdminShell>
      <h1 className={styles.pageTitle}>Dashboard</h1>
      <p style={{ color: "#aaa" }}>
        Witaj w panelu administracyjnym GRP-BAU. Wybierz sekcję z menu po lewej
        stronie, aby edytować treść strony.
      </p>
      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {[
          { href: "/admin/home", label: "Strona główna", desc: "Edytuj tytuł hero, podtytuły, tło" },
          { href: "/admin/about", label: "O nas", desc: "Edytuj sekcję O nas" },
          { href: "/admin/services", label: "Usługi", desc: "Zarządzaj kartami usług" },
          { href: "/admin/gallery", label: "Galeria", desc: "Zarządzaj zdjęciami galerii" },
          { href: "/admin/nav", label: "Nawigacja", desc: "Edytuj pozycje menu" },
          { href: "/admin/messages", label: "Wiadomości", desc: "Przegląd wiadomości kontaktowych" },
        ].map((card) => (
          <a
            key={card.href}
            href={card.href}
            style={{
              display: "block",
              padding: "1.25rem",
              background: "#1a1930",
              border: "1px solid #2a2950",
              borderRadius: "8px",
              width: "220px",
              textDecoration: "none",
              color: "inherit",
              transition: "border-color 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "#feb81a")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "#2a2950")}
          >
            <h3 style={{ color: "#feb81a", marginBottom: "0.5rem" }}>{card.label}</h3>
            <p style={{ color: "#aaa", fontSize: "0.8rem", margin: 0 }}>{card.desc}</p>
          </a>
        ))}
      </div>
    </AdminShell>
  );
}
