// src/sections/ContactSection.jsx
"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt
} from "react-icons/fa";
import RichText from "@/components/RichText";
import { COMPANY } from "@/lib/company";
import styles from "./ContactSection.module.css";

const T = {
  de: {
    heading: "Kontakt",
    name: "Name",
    email: "E-Mail",
    msg: "Nachricht",
    send: "Senden",
    sending: "Wird gesendet…",
    required: "Pflichtfeld",
    success: "Danke, wir melden uns bald!",
    addressLabel: "Adresse",
    phoneLabel: "Telefon",
    whatsappLabel: "WhatsApp",
    emailLabel: "E-Mail",
    adressCountry: "Deutschland"
  },
  pl: {
    heading: "Kontakt",
    name: "Imię i nazwisko",
    email: "E-mail",
    msg: "Wiadomość",
    send: "Wyślij",
    sending: "Wysyłanie…",
    required: "Pole wymagane",
    success: "Dziękujemy, odezwiemy się niebawem!",
    addressLabel: "Adres",
    phoneLabel: "Telefon",
    whatsappLabel: "WhatsApp",
    emailLabel: "E-Mail",
    adressCountry: "Niemcy"
  },
  en: {
    heading: "Contact",
    name: "Name",
    email: "Email",
    msg: "Message",
    send: "Send",
    sending: "Sending…",
    required: "Required",
    success: "Thanks! We'll be in touch soon.",
    addressLabel: "Address",
    phoneLabel: "Phone",
    whatsappLabel: "WhatsApp",
    emailLabel: "E-Mail",
    adressCountry: "Germany"
  }
};

export default function ContactSection({ heading, introMarkdown, introHtml, introForm, lang }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();
  const [serverError, setServerError] = useState("");
  // własny stan „wysłano” – przy błędzie serwera formularz zostaje z komunikatem
  const [sent, setSent] = useState(false);

  const t = T[lang] || T.de;

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await fetch(
        "/api/contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, lang })
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error");
      }
      setSent(true);
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <section className={styles.contact}>
      <header className={styles.header}>
        <h1 className={styles.title}>{heading || t.heading}</h1>
        {introMarkdown && <RichText markdown={introMarkdown} className={styles.lead} />}
      </header>

      <div className={styles.layout}>
        <aside className={styles.info}>
          {introHtml && (
            <div
              className={styles.intro}
              dangerouslySetInnerHTML={{ __html: introHtml }}
            />
          )}

          <address className={styles.address}>
            <div className={styles.iconWrapper}>
              <span className={styles.iconBox}><FaMapMarkerAlt className={styles.icon} aria-hidden="true" /></span>
              <div>
                <p className={styles.label}>{t.addressLabel}</p>
                <p>
                  {COMPANY.name}<br />
                  {COMPANY.street}<br />
                  {COMPANY.postalCode} {COMPANY.city}<br />
                  {t.adressCountry}
                </p>
              </div>
            </div>

            <div className={styles.iconWrapper}>
              <span className={styles.iconBox}><FaPhone className={styles.icon} aria-hidden="true" /></span>
              <div>
                <p className={styles.label}>{t.phoneLabel}</p>
                <a href={`tel:${COMPANY.phone}`}>{COMPANY.phoneDisplay}</a>
              </div>
            </div>

            <div className={styles.iconWrapper}>
              <span className={styles.iconBox}><FaWhatsapp className={styles.whatsappIcon} aria-hidden="true" /></span>
              <div>
                <p className={styles.label}>{t.whatsappLabel}</p>
                <a
                  href={COMPANY.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {COMPANY.phoneDisplay}
                </a>
              </div>
            </div>

            <div className={styles.iconWrapper}>
              <span className={styles.iconBox}><FaEnvelope className={styles.icon} aria-hidden="true" /></span>
              <div>
                <p className={styles.label}>{t.emailLabel}</p>
                <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              </div>
            </div>
          </address>
        </aside>

        <div className={styles.formCol}>
          {introForm && (
            <div
              className={styles.introForm}
              dangerouslySetInnerHTML={{ __html: introForm }}
            />
          )}
          {sent ? (
            <p className={styles.success} role="status">{t.success}</p>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={styles.form}
            >
              <label>
                <span className={styles.fieldLabel}>{t.name} <span className={styles.req} aria-hidden="true">*</span></span>
                <input
                  autoComplete="name"
                  aria-invalid={errors.name ? "true" : "false"}
                  {...register("name", { required: true })}
                  aria-required="true"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <span className={styles.error}>{t.required}</span>
                )}
              </label>

              <label>
                <span className={styles.fieldLabel}>{t.email} <span className={styles.req} aria-hidden="true">*</span></span>
                <input
                  type="email"
                  autoComplete="email"
                  aria-invalid={errors.email ? "true" : "false"}
                  {...register("email", { required: true })}
                  aria-required="true"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <span className={styles.error}>{t.required}</span>
                )}
              </label>

              <label>
                <span className={styles.fieldLabel}>{t.msg} <span className={styles.req} aria-hidden="true">*</span></span>
                <textarea
                  aria-invalid={errors.message ? "true" : "false"}
                  {...register("message", { required: true })}
                  aria-required="true"
                  disabled={isSubmitting}
                />
                {errors.message && (
                  <span className={styles.error}>{t.required}</span>
                )}
              </label>

              {serverError && (
                <p className={styles.error} role="alert">{serverError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitBtn}
              >
                {isSubmitting ? t.sending : t.send}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
