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
import styles from "./ContactSection.module.css";

export default function ContactSection({ introHtml, introForm, lang }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful }
  } = useForm();
  const [serverError, setServerError] = useState("");

  const t = {
    de: {
      name: "Name",
      email: "E-Mail",
      msg: "Nachricht",
      send: "Senden",
      success: "Danke, wir melden uns bald!",
      addressLabel: "Adresse",
      phoneLabel: "Telefon",
      whatsappLabel: "WhatsApp",
      emailLabel: "E-Mail",
      adressCountry: "Deutschland"
    },
    pl: {
      name: "Imię i nazwisko",
      email: "E-mail",
      msg: "Wiadomość",
      send: "Wyślij",
      success: "Dziękujemy, odezwiemy się niebawem!",
      addressLabel: "Adres",
      phoneLabel: "Telefon",
      whatsappLabel: "WhatsApp",
      emailLabel: "E-Mail",
      adressCountry: "Niemcy"
    },
    en: {
      name: "Name",
      email: "Email",
      msg: "Message",
      send: "Send",
      success: "Thanks! We'll be in touch soon.",
      addressLabel: "Address",
      phoneLabel: "Phone",
      whatsappLabel: "WhatsApp",
      emailLabel: "E-Mail",
      adressCountry: "Germany"
    }
  }[lang];

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await fetch(
        "https://wp.grp-bau.de/wp-json/grp/v1/contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error");
      }
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <section className={styles.contact}>
        
        
      <div className={styles.layout}>
        <aside className={styles.info}>
        <div
            className={styles.intro}
            dangerouslySetInnerHTML={{ __html: introHtml }}
          />

          <div className={styles.iconWrapper}>
            <FaMapMarkerAlt className={styles.icon} />
            <div>
              <p className={styles.label}>{t.addressLabel}:</p>
              <p>In den Feldgärten 11D<br/>27232 Sulingen<br/>{t.adressCountry}</p>
            </div>
          </div>

          <div className={styles.iconWrapper}>
            <FaPhone className={styles.icon} />
            <div>
              <p className={styles.label}>{t.phoneLabel}:</p>
              <a href="tel:+4915561013765">+49 1556 1013765</a>
            </div>
          </div>

          <div className={styles.iconWrapper}>
            <FaWhatsapp className={styles.whatsappIcon} />
            <div>
              <p className={styles.label}>{t.whatsappLabel}:</p>
              <a
                href="https://wa.me/4915561013765"
                target="_blank"
                rel="noreferrer"
              >
                +49 1556 1013765
              </a>
            </div>
          </div>

          <div className={styles.iconWrapper}>
            <FaEnvelope className={styles.icon} />
            <div>
              <p className={styles.label}>{t.emailLabel}:</p>
              <a href="mailto:info@grp-bau.de">info@grp-bau.de</a>
            </div>
          </div>
        </aside>

        <div className={styles.formCol}>
            {/* opcjonalne intro z WP */}
        <div
            className={styles.introForm}
            dangerouslySetInnerHTML={{ __html: introForm }}
          />
          {isSubmitSuccessful ? (
            <p className={styles.success}>{t.success}</p>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={styles.form}
            >
              <label>
                {t.name}
                <input
                  {...register("name", { required: true })}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <span className={styles.error}>*</span>
                )}
              </label>

              <label>
                {t.email}
                <input
                  type="email"
                  {...register("email", { required: true })}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <span className={styles.error}>*</span>
                )}
              </label>

              <label>
                {t.msg}
                <textarea
                  {...register("message", { required: true })}
                  disabled={isSubmitting}
                />
                {errors.message && (
                  <span className={styles.error}>*</span>
                )}
              </label>

              {serverError && (
                <p className={styles.error}>{serverError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitBtn}
              >
                {isSubmitting ? "…" : t.send}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
