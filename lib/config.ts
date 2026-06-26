const DEFAULT_SITE_URL = "https://expo.ldvir.ua";
const DEFAULT_TELEGRAM_BOT_URL = "https://t.me/ldvir_tool_day_bot?start=expo_landing";
const DEFAULT_MANAGER_PHONE = "+380679979765";
const DEFAULT_META_PIXEL_ID = "1362943694602745";
const DEFAULT_CRM_API_URL = "https://openapi.keycrm.app/v1";
const DEFAULT_GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=LDVIR.UA%20%D0%A5%D0%BC%D0%B5%D0%BB%D1%8C%D0%BD%D0%B8%D1%86%D1%8C%D0%BA%D0%B8%D0%B9%20%D0%92%D1%96%D0%BD%D0%BD%D0%B8%D1%86%D1%8C%D0%BA%D0%B0%201%2F9";

export function getPublicConfig() {
  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL,
    telegramBotUrl: process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || DEFAULT_TELEGRAM_BOT_URL,
    managerPhone: process.env.NEXT_PUBLIC_MANAGER_PHONE || DEFAULT_MANAGER_PHONE,
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? DEFAULT_META_PIXEL_ID,
    googleMapsUrl: process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL || DEFAULT_GOOGLE_MAPS_URL,
    gaId: process.env.NEXT_PUBLIC_GA_ID || "",
  };
}

export function getServerConfig() {
  return {
    ...getPublicConfig(),
    crmApiUrl: process.env.CRM_API_URL || DEFAULT_CRM_API_URL,
    crmApiToken: process.env.CRM_API_TOKEN || "",
    crmSource: process.env.CRM_SOURCE || "landing_page_form",
    crmEvent: process.env.CRM_EVENT || "ldvir_tools_expo_2026",
    keycrmPipelineId: Number(process.env.KEYCRM_PIPELINE_ID || ""),
    keycrmSourceId: Number(process.env.KEYCRM_SOURCE_ID || ""),
    keycrmStatusId: Number(process.env.KEYCRM_STATUS_ID || ""),
    keycrmManagerId: Number(process.env.KEYCRM_MANAGER_ID || ""),
  };
}
