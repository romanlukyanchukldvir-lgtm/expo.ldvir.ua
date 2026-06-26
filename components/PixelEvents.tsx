"use client";

import { useEffect } from "react";

export type PixelEventName =
  | "ViewContent"
  | "TelegramRegistrationClick"
  | "ManagerCallClick"
  | "LandingFormSubmit";

type Fbq = {
  (method: "track", eventName: "PageView"): void;
  (method: "trackCustom", eventName: PixelEventName, params?: Record<string, string>): void;
};

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

export function trackPixel(eventName: PixelEventName, params?: Record<string, string>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  window.fbq("trackCustom", eventName, params);
}

export function PixelEvents() {
  useEffect(() => {
    let attempts = 0;
    let timer: number | undefined;

    const sendViewContent = () => {
      attempts += 1;
      if (typeof window.fbq === "function") {
        trackPixel("ViewContent", {
          event: "ldvir_tools_expo_2026",
          source: "landing_page",
        });
        return;
      }

      if (attempts < 12) {
        timer = window.setTimeout(sendViewContent, 250);
      }
    };

    sendViewContent();

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  return null;
}
