// Phone numbers for trusted contacts and campus support (v2.3 Item 2). The
// team found phone fields that took letters, so a contact like "call mom"
// was saved and the Call button dialed nothing. Numbers are now kept as a
// country code plus digits; the old `value` keeps the full dialable form
// ("+528112345678") for every reader that came before.
import type { CampusSupport, TrustedContact } from '@/lib/types';

export interface Country {
  code: string;
  label: string;
}

// Mexico and the US/Canada first (most of our students), then the rest by name.
export const COUNTRIES: Country[] = [
  { code: '52', label: '+52 Mexico' },
  { code: '1', label: '+1 United States / Canada' },
  ...(
    [
      ['54', 'Argentina'], ['591', 'Bolivia'], ['56', 'Chile'], ['86', 'China'], ['57', 'Colombia'], ['506', 'Costa Rica'],
      ['593', 'Ecuador'], ['503', 'El Salvador'], ['33', 'France'], ['49', 'Germany'], ['502', 'Guatemala'], ['504', 'Honduras'],
      ['91', 'India'], ['39', 'Italy'], ['81', 'Japan'], ['505', 'Nicaragua'], ['507', 'Panama'], ['595', 'Paraguay'],
      ['51', 'Peru'], ['82', 'South Korea'], ['34', 'Spain'], ['44', 'United Kingdom'], ['598', 'Uruguay'], ['58', 'Venezuela'],
    ] as const
  ).map(([code, name]) => ({ code, label: `+${code} ${name}` })),
];
const KNOWN = new Set(COUNTRIES.map((c) => c.code));

export const sanitizeDigits = (text: string) => text.replace(/\D/g, '');

// The device's region when it's easy to tell (es-MX → 52, en-US → 1).
export function defaultCountry(language = typeof navigator === 'undefined' ? '' : navigator.language): string {
  const region = language.split('-')[1]?.toUpperCase();
  if (region === 'US' || region === 'CA') return '1';
  return '52';
}

// "+52 81 1234 5678", "0052…" or "+1 (555)…": the country from the start
// (the longest code we know), the rest as digits. Plain digits keep no code.
export function parsePhone(text: string): { countryCode: string | null; national: string } {
  const t = text.trim();
  const international = t.startsWith('+') ? t.slice(1) : t.startsWith('00') ? t.slice(2) : null;
  if (international === null) return { countryCode: null, national: sanitizeDigits(t) };
  const digits = sanitizeDigits(international);
  for (const len of [3, 2, 1]) {
    const code = digits.slice(0, len);
    if (KNOWN.has(code)) return { countryCode: code, national: digits.slice(len) };
  }
  return { countryCode: digits.slice(0, 2) || null, national: digits.slice(2) };
}

export type PhoneProblem = { kind: 'needs'; n: number } | { kind: 'short' } | null;

// Mexico and the US/Canada use ten digits; elsewhere, 6 to 14.
export function phoneProblem(countryCode: string, national: string): PhoneProblem {
  if (countryCode === '52' || countryCode === '1') return national.length === 10 ? null : { kind: 'needs', n: 10 };
  return national.length >= 6 && national.length <= 14 && /^\d{1,3}$/.test(countryCode) ? null : { kind: 'short' };
}

export const toDialable = (countryCode: string, national: string) => `+${countryCode}${national}`;

// Easier to read: +52 81 1234 5678, +1 (555) 123-4567, others in threes.
export function formatPhone(countryCode: string, national: string): string {
  if (countryCode === '52' && national.length === 10) return `+52 ${national.slice(0, 2)} ${national.slice(2, 6)} ${national.slice(6)}`;
  if (countryCode === '1' && national.length === 10) return `+1 (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
  return `+${countryCode} ${national.replace(/(\d{3})(?=\d)/g, '$1 ')}`.trim();
}

export const telHref = (cc: string, n: string) => `tel:${toDialable(cc, n)}`;
export const smsHref = (cc: string, n: string) => `sms:${toDialable(cc, n)}`;
export const whatsAppHref = (cc: string, n: string) => `https://wa.me/${cc}${n}`;

// For read-aloud: digit by digit, in the groups people say them in.
export const spokenPhone = (countryCode: string, national: string) =>
  `plus ${countryCode.split('').join(' ')}, ${formatPhone(countryCode, national).split(' ').slice(1).map((g) => sanitizeDigits(g).split('').join(' ')).join(', ')}`;

// The country code and digits of a saved contact, from the new fields or,
// for contacts saved before v2.3, parsed from `value`.
export function phoneParts(c: Pick<TrustedContact, 'value' | 'countryCode' | 'national'>, fallback: string): { countryCode: string; national: string } {
  if (c.countryCode && c.national) return { countryCode: c.countryCode, national: c.national };
  const parsed = parsePhone(c.value);
  return { countryCode: parsed.countryCode ?? fallback, national: parsed.national };
}

// The one-time v2.3 migration. Nothing is deleted or rewritten when it's
// unclear: a phone value with letters, or one that doesn't validate, keeps
// its original text and is flagged for review. Email and handle contacts
// are left exactly as they were.
export function migrateContact(c: TrustedContact, fallback: string): TrustedContact {
  if (c.method !== 'phone' || c.national) return c;
  const { countryCode, national } = phoneParts(c, fallback);
  if (/[a-z]/i.test(c.value) || phoneProblem(countryCode, national)) return { ...c, needsReview: true };
  return { ...c, countryCode, national, value: toDialable(countryCode, national) };
}

export function migrateCampus(campus: CampusSupport | null, fallback: string): CampusSupport | null {
  if (!campus?.phone || campus.phoneNational) return campus;
  const { countryCode, national } = phoneParts({ value: campus.phone }, fallback);
  if (/[a-z]/i.test(campus.phone) || phoneProblem(countryCode, national)) return { ...campus, needsReview: true };
  return { ...campus, phoneCountryCode: countryCode, phoneNational: national, phone: toDialable(countryCode, national) };
}
