export function normalizeUAPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  let normalized = digits;

  if (normalized.startsWith("38")) {
    normalized = normalized;
  } else if (normalized.startsWith("0")) {
    normalized = `38${normalized}`;
  } else if (normalized.length === 9) {
    normalized = `380${normalized}`;
  }

  if (!/^380(39|50|63|66|67|68|73|91|92|93|94|95|96|97|98|99)\d{7}$/.test(normalized)) {
    return null;
  }

  return `+${normalized}`;
}

export function formatUAPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("380")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("38")) {
    digits = digits.slice(2);
  } else if (!digits.startsWith("0") && digits.length > 0) {
    digits = `0${digits}`;
  }

  digits = digits.slice(0, 10);

  const operator = digits.slice(1, 3);
  const part1 = digits.slice(3, 6);
  const part2 = digits.slice(6, 8);
  const part3 = digits.slice(8, 10);

  let formatted = "+38";

  if (digits.length > 0) {
    formatted += ` (${digits[0] || "0"}${operator}`;
    if (digits.length >= 3) {
      formatted += ")";
    }
  } else {
    formatted += " (0";
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

export function isUAMobilePhone(value: string): boolean {
  return normalizeUAPhone(value) !== null;
}
