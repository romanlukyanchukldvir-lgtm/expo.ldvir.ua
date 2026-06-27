import { getServerConfig } from "@/lib/config";

const CARD_DEDUPE_PAGE_LIMIT = 4;

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
  return [`Інтерес: ${payload.interest || "не вказано"}`, "Резервна реєстрація без Telegram."].join(
    "\n",
  );
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

function normalizeComparablePhone(value: unknown) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

async function fetchKeycrmJson(path: string, searchParams: Record<string, string>) {
  const config = getServerConfig();
  const url = new URL(buildKeycrmUrl(config.crmApiUrl, path));

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.crmApiToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await readErrorResponse(response);
    throw new Error(`KeyCRM lookup failed with ${response.status}: ${text}`);
  }

  return response.json().catch(() => ({}));
}

async function keycrmPipelineCardExistsByPhone(phone: string) {
  const config = getServerConfig();
  const comparablePhone = normalizeComparablePhone(phone);

  for (let page = 1; page <= CARD_DEDUPE_PAGE_LIMIT; page += 1) {
    const result = (await fetchKeycrmJson("/pipelines/cards", {
      include: "contact",
      limit: "50",
      page: String(page),
      "filter[pipeline_id]": asKeycrmNumber(config.keycrmPipelineId)?.toString() || "",
    })) as { data?: Array<{ contact?: { phone?: string | null } }>; next_page_url?: string | null };

    const hasMatchingPhone = result.data?.some(
      (card) => normalizeComparablePhone(card.contact?.phone) === comparablePhone,
    );

    if (hasMatchingPhone) {
      return true;
    }

    if (!result.next_page_url) {
      return false;
    }
  }

  return false;
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

  if (await keycrmPipelineCardExistsByPhone(payload.phone)) {
    return { skipped: true, reason: "duplicate_phone_in_pipeline" };
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

  return { ...result, skipped: false };
}
