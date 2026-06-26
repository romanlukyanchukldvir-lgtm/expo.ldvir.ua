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
    `Статус: ${payload.status}`,
    `Джерело: Landing page / Facebook Ads`,
    `Телефон на сайті: ${payload.phone_display}`,
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

function asKeycrmNumber(value: number) {
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function buildKeycrmUrl(baseUrl: string, path: string) {
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");

  if (cleanBaseUrl.endsWith(path)) {
    return cleanBaseUrl;
  }

  if (cleanBaseUrl.endsWith("/pipelines/cards") && path.startsWith("/pipelines/cards/")) {
    return `${cleanBaseUrl}${path.replace("/pipelines/cards", "")}`;
  }

  return `${cleanBaseUrl}${path}`;
}

function stripEmptyValues<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== ""),
  );
}

async function readErrorResponse(response: Response) {
  return response.text().catch(() => "");
}

async function updateKeycrmCardStatus(cardId: number, statusId: number) {
  const config = getServerConfig();
  const response = await fetch(buildKeycrmUrl(config.crmApiUrl, `/pipelines/cards/${cardId}`), {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.crmApiToken}`,
    },
    body: JSON.stringify({ status_id: statusId }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await readErrorResponse(response);
    throw new Error(`KeyCRM status update failed with ${response.status}: ${text}`);
  }
}

export async function createCrmLead(payload: CrmLeadPayload) {
  const config = getServerConfig();

  if (!config.crmApiUrl || !config.crmApiToken) {
    throw new Error("CRM_API_URL or CRM_API_TOKEN is not configured");
  }

  const crmPayload = stripEmptyValues({
    title: `Виставка інструментів 2026 — ${payload.name}`,
    source_id: asKeycrmNumber(config.keycrmSourceId),
    manager_id: asKeycrmNumber(config.keycrmManagerId),
    pipeline_id: asKeycrmNumber(config.keycrmPipelineId),
    manager_comment: buildLeadComment(payload),
    contact: {
      full_name: payload.name,
      phone: payload.phone,
    },
    utm_source: payload.utm_source,
    utm_medium: payload.utm_medium,
    utm_campaign: payload.utm_campaign,
    utm_content: payload.utm_content,
    utm_term: payload.utm_term,
  });

  const response = await fetch(buildKeycrmUrl(config.crmApiUrl, "/pipelines/cards"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.crmApiToken}`,
    },
    body: JSON.stringify(crmPayload),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await readErrorResponse(response);
    throw new Error(`KeyCRM request failed with ${response.status}: ${text}`);
  }

  const result = await response.json().catch(() => ({}));
  const cardId = typeof result?.id === "number" ? result.id : undefined;
  const statusId = asKeycrmNumber(config.keycrmStatusId);

  if (cardId && statusId) {
    await updateKeycrmCardStatus(cardId, statusId);
  }

  return result;
}
