// v2.3 Item 2: phone numbers as a country code plus digits. Cleaning, the
// paste formats people actually use, the length rules per country, the
// dialable form and links, and the one-time migration, which never deletes
// or rewrites anything it can't read.
import { describe, expect, it } from 'vitest';
import { formatPhone, migrateCampus, migrateContact, parsePhone, phoneProblem, sanitizeDigits, smsHref, spokenPhone, telHref, toDialable, whatsAppHref } from './phone';
import type { TrustedContact } from './types';

const contact = (value: string, method: TrustedContact['method'] = 'phone'): TrustedContact => ({ id: 'a', name: 'Sofi', method, value });

describe('phone numbers', () => {
  it('keeps only digits', () => {
    expect(sanitizeDigits('abc123')).toBe('123');
    expect(sanitizeDigits('+52 (81) 1234-5678')).toBe('528112345678');
  });

  it('reads the country from "+52…", "0052…" and "+1 (555)…", and keeps plain digits as they are', () => {
    expect(parsePhone('+52 81 1234 5678')).toEqual({ countryCode: '52', national: '8112345678' });
    expect(parsePhone('0052 81 1234 5678')).toEqual({ countryCode: '52', national: '8112345678' });
    expect(parsePhone('+1 (555) 123-4567')).toEqual({ countryCode: '1', national: '5551234567' });
    expect(parsePhone('+593 99 123 4567')).toEqual({ countryCode: '593', national: '991234567' });
    expect(parsePhone('81 1234 5678')).toEqual({ countryCode: null, national: '8112345678' });
  });

  it('asks for ten digits in Mexico and the US, 6 to 14 elsewhere', () => {
    expect(phoneProblem('52', '8112345678')).toBeNull();
    expect(phoneProblem('52', '81123')).toEqual({ kind: 'needs', n: 10 });
    expect(phoneProblem('1', '55512345678')).toEqual({ kind: 'needs', n: 10 });
    expect(phoneProblem('34', '612345678')).toBeNull();
    expect(phoneProblem('34', '12345')).toEqual({ kind: 'short' });
  });

  it('builds dialable numbers, links, a readable form and the words read aloud', () => {
    expect(toDialable('52', '8112345678')).toBe('+528112345678');
    expect(telHref('52', '8112345678')).toBe('tel:+528112345678');
    expect(smsHref('1', '5551234567')).toBe('sms:+15551234567');
    expect(whatsAppHref('52', '8112345678')).toBe('https://wa.me/528112345678');
    expect(formatPhone('52', '8112345678')).toBe('+52 81 1234 5678');
    expect(formatPhone('1', '5551234567')).toBe('+1 (555) 123-4567');
    expect(spokenPhone('52', '8112345678')).toBe('plus 5 2, 8 1, 1 2 3 4, 5 6 7 8');
  });
});

describe('the v2.3 contact migration', () => {
  it('splits a clean or formatted number into code and digits', () => {
    expect(migrateContact(contact('+52 81 1234 5678'), '52')).toMatchObject({ countryCode: '52', national: '8112345678', value: '+528112345678' });
    expect(migrateContact(contact('81-1234-5678'), '52')).toMatchObject({ countryCode: '52', national: '8112345678' });
  });

  it('keeps a number with letters (or too short) exactly as typed, and flags it', () => {
    expect(migrateContact(contact('call mom 811'), '52')).toEqual({ ...contact('call mom 811'), needsReview: true });
    expect(migrateContact(contact('12345'), '52')).toEqual({ ...contact('12345'), needsReview: true });
  });

  it('leaves email and handle contacts alone', () => {
    expect(migrateContact(contact('@sofi.k', 'handle'), '52')).toEqual(contact('@sofi.k', 'handle'));
    expect(migrateContact(contact('sofi@example.com', 'email'), '52')).toEqual(contact('sofi@example.com', 'email'));
  });

  it('does the same for the campus phone', () => {
    expect(migrateCampus({ name: 'Counseling', phone: '+52 81 8358 2000' }, '52')).toMatchObject({ phoneCountryCode: '52', phoneNational: '8183582000', phone: '+528183582000' });
    expect(migrateCampus({ name: 'Counseling', phone: 'ext. 4040' }, '52')).toMatchObject({ phone: 'ext. 4040', needsReview: true });
    expect(migrateCampus(null, '52')).toBeNull();
  });
});
