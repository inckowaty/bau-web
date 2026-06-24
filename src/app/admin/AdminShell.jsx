"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./admin.module.css";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/home", label: "Strona główna" },
  { href: "/admin/about", label: "O nas" },
  { href: "/admin/services", label: "Usługi" },
  { href: "/admin/gallery", label: "Galeria" },
  { href: "/admin/nav", label: "Nawigacja" },
  { href: "/admin/messages", label: "Wiadomości" },
];

export default function AdminShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    // Quick auth check — try to hit a protected endpoint
    fetch("/api/admin/home?lang=de")
      .then((r) => {
        if (r.status === 401) router.replace("/admin/login");
        else setOk(true);
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  if (!ok) return null;

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          GRP-BAU
          <span>Panel administracyjny</span>
        </div>
        <ul className={styles.navList}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={pathname === link.href ? styles.langTabActive : ""}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <button onClick={logout} className={styles.logoutBtn}>
          Wyloguj
        </button>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
