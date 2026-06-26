import { NextResponse } from "next/server";
import { createCrmLead, type CrmLeadPayload } from "@/lib/crm";
import { normalizeUAPhone } from "@/lib/phone";
import { getServerConfig } from "@/lib/config";

type RegistrationBody = {
  name?: unknown;
  phone?: unknown;
  phone_display?: unknown;
  interest?: unknown;
  page_url?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  utm_content?: unknown;
  utm_term?: unknown;
  fbclid?: unknown;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: RegistrationBody;

  try {
    body = (await request.json()) as RegistrationBody;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  const config = getServerConfig();
  const name = asString(body.name);
  const phoneDisplay = asString(body.phone_display);
  const normalizedPhone = normalizeUAPhone(asString(body.phone));
  const interest = asString(body.interest);

  if (!name) {
    return NextResponse.json({ ok: false, message: "Name is required" }, { status: 400 });
  }

  if (!normalizedPhone) {
    return NextResponse.json(
      { ok: false, message: "Введіть коректний український номер телефону" },
      { status: 400 },
    );
  }

  const payload: CrmLeadPayload = {
    source: config.crmSource,
    event: config.crmEvent,
    status: "Зареєстрований",
    name,
    phone: normalizedPhone,
    phone_display: phoneDisplay || normalizedPhone,
    interest,
    page_url: asString(body.page_url) || config.siteUrl,
    utm_source: asString(body.utm_source),
    utm_medium: asString(body.utm_medium),
    utm_campaign: asString(body.utm_campaign),
    utm_content: asString(body.utm_content),
    utm_term: asString(body.utm_term),
    fbclid: asString(body.fbclid),
    created_at: new Date().toISOString(),
  };

  try {
    await createCrmLead(payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("CRM lead creation failed", error);
    return NextResponse.json({ ok: false, message: "CRM request failed" }, { status: 502 });
  }
}
