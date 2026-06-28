const UA_MOBILE_OPERATOR_CODES = new Set([
  "39",
  "50",
  "63",
  "66",
  "67",
  "68",
  "73",
  "91",
  "92",
  "93",
  "94",
  "95",
  "96",
  "97",
  "98",
  "99",
]);

function toLocalUAPhoneDigits(value: string, limit = false): string {
  let digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  let localDigits = digits;

  if (digits.startsWith("380")) {
    localDigits = `0${digits.slice(3)}`;
  } else if (digits.startsWith("80") && digits.length >= 10) {
    localDigits = `0${digits.slice(2)}`;
  } else if (!digits.startsWith("0")) {
    localDigits = `0${digits}`;
  }

  return limit ? localDigits.slice(0, 10) : localDigits;
}

function formatLocalUAPhoneDigits(localDigits: string): string {
  const digits = localDigits.replace(/\D/g, "").slice(0, 10);

  if (!digits) {
    return "";
  }

  const operator = digits.slice(0, 3);
  const part1 = digits.slice(3, 6);
  const part2 = digits.slice(6, 8);
  const part3 = digits.slice(8, 10);
  let formatted = `+38 (${operator}`;

  if (digits.length >= 3) {
    formatted += ")";
  }

  if (part1) {
    formatted += ` ${part1}`;
  }

  if (part2) {
    formatted += `-${part2}`;
  }

  if (part3) {
    formatted += `-${part3}`;
  }

  return formatted;
}

export function normalizeUAPhone(value: string): string | null {
  const localDigits = toLocalUAPhoneDigits(value);

  if (!/^0\d{9}$/.test(localDigits)) {
    return null;
  }

  if (!UA_MOBILE_OPERATOR_CODES.has(localDigits.slice(1, 3))) {
    return null;
  }

  return `+38${localDigits}`;
}

export function formatUAPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits === "3") {
    return "+3";
  }

  if (digits === "38") {
    return "+38";
  }

  if (digits === "380") {
    return "+38 (0";
  }

  return formatLocalUAPhoneDigits(toLocalUAPhoneDigits(value, true));
}

export function formatUAPhoneDisplay(value: string): string {
  const normalized = normalizeUAPhone(value);

  if (normalized) {
    return formatLocalUAPhoneDigits(normalized.slice(3));
  }

  return formatUAPhoneInput(value);
}

export function isUAMobilePhone(value: string): boolean {
  return normalizeUAPhone(value) !== null;
}
