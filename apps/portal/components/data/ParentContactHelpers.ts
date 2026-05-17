/**
 * Phone, WhatsApp, and CNIC formatting helpers.
 *
 * Used only by the Parents module — kept beside the Parent components so
 * the shared `lib/format.ts` stays untouched.
 */

/**
 * Strip every non-digit character. `+92 311 9911288` → `923119911288`.
 */
export function digitsOnly(phone: string): string {
  return phone.replace(/\D+/g, '');
}

/**
 * Convert a Pakistani phone string into the digits-only form expected by
 * wa.me. If the number starts with `3...` (a Pakistani mobile without the
 * country code), we prepend `92`. `0300 1234567` → `923001234567`. If the
 * caller passes a number we cannot confidently identify, we return the
 * stripped digits as-is — wa.me will still resolve most international
 * formats provided they include the country code.
 */
export function toWaNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let d = digitsOnly(phone);
  if (!d) return null;
  // Trim a leading 0 — Pakistani local format starts 0300/0311 etc.
  if (d.startsWith('0')) d = d.slice(1);
  if (d.startsWith('3') && d.length === 10) d = `92${d}`;
  return d;
}

export function waLink(phone: string | null | undefined, message?: string): string | null {
  const n = toWaNumber(phone);
  if (!n) return null;
  const base = `https://wa.me/${n}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function telLink(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const d = digitsOnly(phone);
  if (!d) return null;
  return `tel:+${d}`;
}

/**
 * Mask a Pakistani CNIC, exposing only the last 4 digits. Accepts both
 * dashed (`12345-1234567-1`) and undashed forms; falls back to a bullet
 * pad for non-standard input.
 */
export function maskCnic(cnic: string | null | undefined): string {
  if (!cnic) return '—';
  const trimmed = cnic.trim();
  const digits = digitsOnly(trimmed);
  if (digits.length < 4) return '•••• ' + digits;

  // Standard Pakistani CNIC is 13 digits: 5-7-1
  if (digits.length === 13) {
    const last4 = digits.slice(-4);
    return `•••••-•••${last4.slice(0, 3)}-${last4.slice(3)}`;
  }

  const last4 = digits.slice(-4);
  const masked = '•'.repeat(Math.max(0, digits.length - 4));
  return `${masked}${last4}`;
}
