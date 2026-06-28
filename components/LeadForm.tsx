"use client";

import { FormEvent, useEffect, useState } from "react";
import Script from "next/script";
import { getPublicConfig } from "@/lib/config";
import { formatUAPhoneDisplay, formatUAPhoneInput, normalizeUAPhone } from "@/lib/phone";
import { trackPixel } from "@/components/PixelEvents";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
] as const;

type UtmKey = (typeof UTM_KEYS)[number];
type FormStatus = "idle" | "loading" | "success" | "error";
type RegisterResponse = {
  ok?: boolean;
  skipped?: boolean;
};

declare global {
  interface Window {
    ldvirTurnstileSuccess?: (token: string) => void;
    ldvirTurnstileExpired?: () => void;
    turnstile?: {
      reset: () => void;
    };
  }
}

function readStoredUtm(): Record<UtmKey, string> {
  const values = Object.fromEntries(UTM_KEYS.map((key) => [key, ""])) as Record<UtmKey, string>;

  if (typeof window === "undefined") {
    return values;
  }

  const params = new URLSearchParams(window.location.search);
  let changed = false;

  UTM_KEYS.forEach((key) => {
    const fromUrl = params.get(key);
    if (fromUrl) {
      values[key] = fromUrl;
      changed = true;
    }
  });

  if (changed) {
    window.sessionStorage.setItem("ldvir_utm", JSON.stringify(values));
    window.localStorage.setItem("ldvir_utm", JSON.stringify(values));
    return values;
  }

  const stored = window.sessionStorage.getItem("ldvir_utm") || window.localStorage.getItem("ldvir_utm");
  if (!stored) {
    return values;
  }

  try {
    return { ...values, ...JSON.parse(stored) };
  } catch {
    return values;
  }
}

function readFormString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export function LeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [formError, setFormError] = useState("");
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [utm, setUtm] = useState<Record<UtmKey, string>>(() =>
    Object.fromEntries(UTM_KEYS.map((key) => [key, ""])) as Record<UtmKey, string>,
  );
  const config = getPublicConfig();

  useEffect(() => {
    setUtm(readStoredUtm());
  }, []);

  useEffect(() => {
    window.ldvirTurnstileSuccess = (token: string) => setTurnstileToken(token);
    window.ldvirTurnstileExpired = () => setTurnstileToken("");

    return () => {
      delete window.ldvirTurnstileSuccess;
      delete window.ldvirTurnstileExpired;
    };
  }, []);

  function resetTurnstile() {
    if (!config.turnstileSiteKey) {
      return;
    }

    window.turnstile?.reset();
    setTurnstileToken("");
  }

  function handlePhoneChange(value: string) {
    setPhone(formatUAPhoneInput(value));

    if (phoneError) {
      setPhoneError("");
    }
  }

  function handlePhoneBlur() {
    if (!phone) {
      setPhoneError("");
      return;
    }

    const normalizedPhone = normalizeUAPhone(phone);

    if (!normalizedPhone) {
      setPhoneError("Введіть коректний український номер телефону");
      return;
    }

    setPhone(formatUAPhoneDisplay(normalizedPhone));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const turnstileResponse =
      turnstileToken || readFormString(formData.get("cf-turnstile-response"));

    setStatus("idle");
    setPhoneError("");
    setFormError("");

    const normalizedPhone = normalizeUAPhone(phone);

    if (!normalizedPhone) {
      setPhoneError("Введіть коректний український номер телефону");
      return;
    }

    const phoneDisplay = formatUAPhoneDisplay(normalizedPhone);

    if (config.turnstileSiteKey && !turnstileResponse) {
      setFormError("Підтвердіть, що ви не робот.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: normalizedPhone,
          phone_display: phoneDisplay,
          interest: interest.trim(),
          page_url: config.siteUrl,
          website: readFormString(formData.get("website")),
          form_started_at: formStartedAt,
          turnstile_token: turnstileResponse,
          ...utm,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const result = (await response.json().catch(() => ({}))) as RegisterResponse;

      setStatus("success");
      setName("");
      setPhone("");
      setInterest("");
      setFormStartedAt(Date.now());
      resetTurnstile();
      if (!result.skipped) {
        trackPixel("LandingFormSubmit", {
          event: "ldvir_tools_expo_2026",
          source: "landing_page_form",
        });
      }
    } catch {
      resetTurnstile();
      setFormError("Не вдалося відправити заявку. Спробуйте ще раз або зателефонуйте менеджеру.");
      setStatus("error");
    }
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      {config.turnstileSiteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
          async
          defer
        />
      ) : null}
      <label className="spam-field" aria-hidden="true">
        <span>Сайт</span>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label>
        <span>Імʼя</span>
        <input
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Іван"
          required
          autoComplete="name"
        />
      </label>
      <label>
        <span>Телефон</span>
        <input
          name="phone"
          value={phone}
          onChange={(event) => handlePhoneChange(event.target.value)}
          onBlur={handlePhoneBlur}
          placeholder="+38 (067) 123-45-67"
          required
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={phoneError ? "true" : "false"}
          aria-describedby={phoneError ? "phone-error" : undefined}
        />
        {phoneError ? (
          <small id="phone-error" className="field-error">
            {phoneError}
          </small>
        ) : null}
      </label>
      <label>
        <span>Що цікавить?</span>
        <textarea
          name="interest"
          value={interest}
          onChange={(event) => setInterest(event.target.value)}
          placeholder="DeWalt, Milwaukee, консультація по зварюванню..."
          rows={3}
        />
      </label>
      {config.turnstileSiteKey ? (
        <div className="turnstile-wrap">
          <div
            className="cf-turnstile"
            data-sitekey={config.turnstileSiteKey}
            data-callback="ldvirTurnstileSuccess"
            data-expired-callback="ldvirTurnstileExpired"
            data-error-callback="ldvirTurnstileExpired"
          />
        </div>
      ) : null}
      <button className="button button-primary form-submit" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Відправляємо..." : "Залишити номер"}
      </button>
      {status === "success" ? (
        <p className="form-message success">
          Дякуємо! Ми отримали вашу заявку. Менеджер звʼяжеться з вами або зареєструє вас на
          виставку.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="form-message error">{formError || "Не вдалося відправити заявку."}</p>
      ) : null}
    </form>
  );
}
