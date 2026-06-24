"use client";
import { useState, useEffect } from "react";
import AdminShell from "../AdminShell";
import styles from "../admin.module.css";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);

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
              <tr key={m.id}>
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
    </AdminShell>
  );
}
