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
  website?: unknown;
  form_started_at?: unknown;
  turnstile_token?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  utm_content?: unknown;
  utm_term?: unknown;
  fbclid?: unknown;
};

const MIN_FORM_FILL_TIME_MS = 1200;
const MAX_FORM_AGE_MS = 4 * 60 * 60 * 1000;
const IP_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const IP_RATE_LIMIT_MAX = 12;
const PHONE_DUPLICATE_WINDOW_MS = 30 * 60 * 1000;
const ipSubmissions = new Map<string, number[]>();
const phoneSubmissions = new Map<string, number>();

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asTimestamp(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return 0;
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
}

function isFormTimingSuspicious(startedAt: number) {
  const now = Date.now();
  const formAge = now - startedAt;

  return !Number.isFinite(startedAt) || formAge < MIN_FORM_FILL_TIME_MS || formAge > MAX_FORM_AGE_MS;
}

function isIpRateLimited(ip: string) {
  const now = Date.now();
  const recentSubmissions = (ipSubmissions.get(ip) || []).filter(
    (timestamp) => now - timestamp < IP_RATE_LIMIT_WINDOW_MS,
  );

  if (recentSubmissions.length >= IP_RATE_LIMIT_MAX) {
    ipSubmissions.set(ip, recentSubmissions);
    return true;
  }

  recentSubmissions.push(now);
  ipSubmissions.set(ip, recentSubmissions);
  return false;
}

function isDuplicatePhoneSubmission(phone: string) {
  const now = Date.now();
  const lastSubmittedAt = phoneSubmissions.get(phone);

  return Boolean(lastSubmittedAt && now - lastSubmittedAt < PHONE_DUPLICATE_WINDOW_MS);
}

async function verifyTurnstileToken(token: string, remoteIp: string) {
  const config = getServerConfig();

  if (!config.turnstileSecretKey) {
    return true;
  }

  if (!token) {
    return false;
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: config.turnstileSecretKey,
      response: token,
      remoteip: remoteIp === "unknown" ? undefined : remoteIp,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return false;
  }

  const result = (await response.json().catch(() => ({}))) as { success?: boolean };
  return result.success === true;
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
  const clientIp = getClientIp(request);

  if (asString(body.website)) {
    return NextResponse.json({ ok: true });
  }

  if (isFormTimingSuspicious(asTimestamp(body.form_started_at))) {
    return NextResponse.json({ ok: false, message: "Spam protection failed" }, { status: 400 });
  }

  if (!name) {
    return NextResponse.json({ ok: false, message: "Name is required" }, { status: 400 });
  }

  if (!normalizedPhone) {
    return NextResponse.json(
      { ok: false, message: "Введіть коректний український номер телефону" },
      { status: 400 },
    );
  }

  if (isIpRateLimited(clientIp)) {
    return NextResponse.json({ ok: false, message: "Too many requests" }, { status: 429 });
  }

  if (isDuplicatePhoneSubmission(normalizedPhone)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (!(await verifyTurnstileToken(asString(body.turnstile_token), clientIp))) {
    return NextResponse.json({ ok: false, message: "Turnstile verification failed" }, { status: 400 });
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
    const result = await createCrmLead(payload);
    phoneSubmissions.set(normalizedPhone, Date.now());
    return NextResponse.json({ ok: true, skipped: result.skipped === true });
  } catch (error) {
    console.error("CRM lead creation failed", error);
    return NextResponse.json({ ok: false, message: "CRM request failed" }, { status: 502 });
  }
}
