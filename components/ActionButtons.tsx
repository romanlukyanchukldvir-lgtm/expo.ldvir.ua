"use client";

import { getPublicConfig } from "@/lib/config";
import { trackPixel } from "@/components/PixelEvents";

type ActionButtonsProps = {
  showForm?: boolean;
  showMaps?: boolean;
  onlyMaps?: boolean;
  variant: "hero" | "registration" | "location" | "final" | "audience";
};

const config = getPublicConfig();

function formatPhoneForDisplay(phone: string) {
  if (phone === "+380679979765") {
    return "067 997 97 65";
  }

  return phone.replace("+38", "");
}

export function ActionButtons({ showForm, showMaps, onlyMaps, variant }: ActionButtonsProps) {
  const className = `action-row action-row-${variant}`;

  if (onlyMaps) {
    return (
      <div className={className}>
        <a className="button button-secondary" href={config.googleMapsUrl} target="_blank" rel="noreferrer">
          Прокласти маршрут
        </a>
      </div>
    );
  }

  return (
    <div className={className}>
      <a
        className="button button-primary"
        href={config.telegramBotUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() =>
          trackPixel("TelegramRegistrationClick", {
            event: "ldvir_tools_expo_2026",
            source: "landing_page",
          })
        }
      >
        Зареєструватися в Telegram
      </a>
      {showForm ? (
        <a className="button button-muted" href="#registration-form">
          Залишити номер
        </a>
      ) : null}
      <a
        className="button button-outline"
        href={`tel:${config.managerPhone}`}
        onClick={() =>
          trackPixel("ManagerCallClick", {
            event: "ldvir_tools_expo_2026",
            source: "landing_page",
            phone: config.managerPhone,
          })
        }
        aria-label={`Зателефонувати менеджеру ${formatPhoneForDisplay(config.managerPhone)}`}
      >
        Зателефонувати менеджеру
      </a>
      {showMaps ? (
        <a className="button button-secondary" href={config.googleMapsUrl} target="_blank" rel="noreferrer">
          Прокласти маршрут
        </a>
      ) : null}
    </div>
  );
}
