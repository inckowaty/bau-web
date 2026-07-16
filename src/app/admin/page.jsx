"use client";
import { useState } from "react";
import AdminShell from "./AdminShell";
import styles from "./admin.module.css";

export default function AdminDashboard() {
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const changePw = async (e) => {
    e.preventDefault();
    setPwSaving(true);
    setPwMsg("");
    const res = await fetch("/api/admin/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    const data = await res.json();
    setPwSaving(false);
    if (res.ok) {
      setPwMsg("Hasło zmienione!");
      setCurrentPw("");
      setNewPw("");
    } else {
      setPwMsg(data.message || "Błąd");
    }
  };

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

      <div style={{ marginTop: "3rem" }}>
        <button className={styles.editBtn} onClick={() => setShowPwForm(!showPwForm)}>
          {showPwForm ? "Anuluj" : "Zmień hasło"}
        </button>

        {showPwForm && (
          <form onSubmit={changePw} className={styles.form} style={{ marginTop: "1rem" }}>
            <div className={styles.field}>
              <label>Obecne hasło</label>
              <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label>Nowe hasło (min. 6 znaków)</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" disabled={pwSaving} className={styles.saveBtn}>
              {pwSaving ? "..." : "Zmień hasło"}
            </button>
            {pwMsg && <p className={pwMsg.includes("!") ? styles.successMsg : styles.errorMsg}>{pwMsg}</p>}
          </form>
        )}
      </div>
    </AdminShell>
  );
}
