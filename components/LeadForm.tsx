"use client";

import { FormEvent, useEffect, useState } from "react";
import { getPublicConfig } from "@/lib/config";
import { formatUAPhoneInput, normalizeUAPhone } from "@/lib/phone";
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

export function LeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+38 (0");
  const [interest, setInterest] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [utm, setUtm] = useState<Record<UtmKey, string>>(() =>
    Object.fromEntries(UTM_KEYS.map((key) => [key, ""])) as Record<UtmKey, string>,
  );
  const config = getPublicConfig();

  useEffect(() => {
    setUtm(readStoredUtm());
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setPhoneError("");

    const normalizedPhone = normalizeUAPhone(phone);

    if (!normalizedPhone) {
      setPhoneError("Введіть коректний український номер телефону");
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
          phone_display: phone,
          interest: interest.trim(),
          page_url: config.siteUrl,
          ...utm,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setStatus("success");
      setName("");
      setPhone("+38 (0");
      setInterest("");
      trackPixel("LandingFormSubmit", {
        event: "ldvir_tools_expo_2026",
        source: "landing_page_form",
      });
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
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
          onChange={(event) => setPhone(formatUAPhoneInput(event.target.value))}
          onBlur={() => {
            if (phone && !normalizeUAPhone(phone)) {
              setPhoneError("Введіть коректний український номер телефону");
            }
          }}
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
        <p className="form-message error">
          Не вдалося відправити заявку. Спробуйте ще раз або зателефонуйте менеджеру.
        </p>
      ) : null}
    </form>
  );
}
