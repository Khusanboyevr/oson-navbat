/**
 * Uzbek phone numbers, as the backend expects them: `+998` followed by nine
 * digits, the first two being the operator code.
 *
 * The backend rejects anything else outright ("Bunday operator kodi mavjud
 * emas"), and it does so only when the super admin approves the application —
 * long after the usta has gone. So the same rule is enforced where the number is
 * typed.
 */

/** Mobile operator codes in use in Uzbekistan. */
const OPERATOR_CODES = ["20", "33", "50", "55", "77", "88", "90", "91", "93", "94", "95", "97", "98", "99"];

export const PHONE_SAMPLE = "+998 90 123 45 67";

/** Digits only, without the 998 country code. Never longer than nine. */
export function phoneDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const national = digits.startsWith("998") ? digits.slice(3) : digits;
  return national.slice(0, 9);
}

/** What gets stored and sent: `+998XXXXXXXXX`. */
export function normalizeUzPhone(raw: string): string {
  return `+998${phoneDigits(raw)}`;
}

/** What gets typed: `+998 90 123 45 67`, filled in as far as the digits go. */
export function formatUzPhone(raw: string): string {
  const d = phoneDigits(raw);
  const groups = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return groups.length > 0 ? `+998 ${groups.join(" ")}` : "+998 ";
}

export function isValidUzPhone(raw: string): boolean {
  const d = phoneDigits(raw);
  return d.length === 9 && OPERATOR_CODES.includes(d.slice(0, 2));
}

/** The reason a number was refused, or null when it is fine. */
export function uzPhoneError(raw: string): string | null {
  const d = phoneDigits(raw);
  if (d.length < 9) return `Raqam to'liq emas. Namuna: ${PHONE_SAMPLE}`;
  if (!OPERATOR_CODES.includes(d.slice(0, 2))) {
    return `Bunday operator kodi yo'q. Namuna: ${PHONE_SAMPLE}`;
  }
  return null;
}
