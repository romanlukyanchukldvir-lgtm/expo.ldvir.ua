import { getServerConfig } from "@/lib/config";

export type CrmLeadPayload = {
  source: string;
  event: string;
  status: "Зареєстрований";
  name: string;
  phone: string;
  phone_display: string;
  interest: string;
  page_url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  fbclid: string;
  created_at: string;
};

function buildLeadComment(payload: CrmLeadPayload) {
  return [
    "Подія: Виставка інструментів 2026",
    `Інтерес клієнта: ${payload.interest || "не вказано"}`,
    `UTM source: ${payload.utm_source || "-"}`,
    `UTM medium: ${payload.utm_medium || "-"}`,
    `UTM campaign: ${payload.utm_campaign || "-"}`,
    `UTM content: ${payload.utm_content || "-"}`,
    `UTM term: ${payload.utm_term || "-"}`,
    `fbclid: ${payload.fbclid || "-"}`,
    `Сторінка: ${payload.page_url}`,
    "Примітка: Резервна реєстрація без Telegram.",
  ].join("\n");
}

export async function createCrmLead(payload: CrmLeadPayload) {
  const config = getServerConfig();

  if (!config.crmApiUrl || !config.crmApiToken) {
    throw new Error("CRM_API_URL or CRM_API_TOKEN is not configured");
  }

  const crmPayload = {
    ...payload,
    source_name: "Landing page / Facebook Ads",
    comment: buildLeadComment(payload),
  };

  const response = await fetch(config.crmApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.crmApiToken}`,
    },
    body: JSON.stringify(crmPayload),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`CRM request failed with ${response.status}: ${text}`);
  }

  return response.json().catch(() => ({}));
}
