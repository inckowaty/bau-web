"use client";
import { useState, useEffect } from "react";
import AdminShell from "../AdminShell";
import styles from "../admin.module.css";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then(setMessages);
  }, []);

  return (
    <AdminShell>
      <h1 className={styles.pageTitle}>Wiadomości kontaktowe</h1>
      {messages.length === 0 ? (
        <p style={{ color: "#aaa" }}>Brak wiadomości.</p>
      ) : (
        <table className={styles.msgTable}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Imię</th>
              <th>E-mail</th>
              <th>Wiadomość</th>
              <th>Język</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr
                key={m.id}
                onClick={() => setSelected(m)}
                style={{ cursor: "pointer" }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#1a1930")}
                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td>{new Date(m.createdAt).toLocaleString("pl-PL")}</td>
                <td>{m.name}</td>
                <td><a href={`mailto:${m.email}`} style={{ color: "#feb81a" }}>{m.email}</a></td>
                <td style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m.message}
                </td>
                <td>{m.lang}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.7)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              background: "#1a1930", border: "1px solid #2a2950",
              borderRadius: "8px", padding: "2rem", maxWidth: "600px",
              width: "90%", maxHeight: "80vh", overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "#feb81a", margin: 0 }}>Wiadomość</h2>
              <button
                onClick={() => setSelected(null)}
                style={{ background: "none", border: "none", color: "#aaa", fontSize: "1.5rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <span style={{ color: "#aaa", fontSize: "0.8rem", textTransform: "uppercase" }}>Data</span>
                <p style={{ margin: "0.25rem 0 0" }}>{new Date(selected.createdAt).toLocaleString("pl-PL")}</p>
              </div>
              <div>
                <span style={{ color: "#aaa", fontSize: "0.8rem", textTransform: "uppercase" }}>Imię</span>
                <p style={{ margin: "0.25rem 0 0" }}>{selected.name}</p>
              </div>
              <div>
                <span style={{ color: "#aaa", fontSize: "0.8rem", textTransform: "uppercase" }}>E-mail</span>
                <p style={{ margin: "0.25rem 0 0" }}>
                  <a href={`mailto:${selected.email}`} style={{ color: "#feb81a" }}>{selected.email}</a>
                </p>
              </div>
              <div>
                <span style={{ color: "#aaa", fontSize: "0.8rem", textTransform: "uppercase" }}>Język</span>
                <p style={{ margin: "0.25rem 0 0" }}>{selected.lang?.toUpperCase()}</p>
              </div>
              <div>
                <span style={{ color: "#aaa", fontSize: "0.8rem", textTransform: "uppercase" }}>Treść wiadomości</span>
                <p style={{ margin: "0.25rem 0 0", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{selected.message}</p>
              </div>
            </div>

            <a
              href={`mailto:${selected.email}?subject=Re: Kontakt GRP-BAU`}
              style={{
                display: "inline-block", marginTop: "1.5rem", padding: "0.5rem 1.25rem",
                background: "#feb81a", color: "#12111f", borderRadius: "4px",
                textDecoration: "none", fontWeight: 600, fontSize: "0.9rem",
              }}
            >
              Odpowiedz
            </a>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
