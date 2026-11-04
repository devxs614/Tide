'use client';

// A phone number as two controls (v2.3 Item 2): the country code on the
// left, then digits only. Phone fields used to take any text, so "call mom"
// was saved and the Call button dialed nothing. Anything that isn't a digit
// is dropped as you type, paste or autofill (with a polite note the first
// time), the caret stays where it was, and a pasted "+52 81…" or "0052…"
// sets the country by itself. A preview under it says what will be dialed.
import { useLayoutEffect, useRef, useState, type ChangeEvent, type ClipboardEvent } from 'react';
import { fill } from '@/copy/en';
import { contactsCopy as t } from '@/copy/contactsCopy';
import { COUNTRIES, formatPhone, parsePhone, sanitizeDigits } from '@/lib/phone';

const field = 'min-h-12 rounded-input border border-line bg-surface-2 px-3 text-body';
const known = new Set(COUNTRIES.map((c) => c.code));

export interface PhoneValue {
  countryCode: string;
  national: string;
}

export function PhoneInput({
  id,
  value,
  onChange,
  onBlur,
  error,
  label = t.phoneNumber,
}: {
  label?: string;
  id: string;
  value: PhoneValue;
  onChange: (next: PhoneValue) => void;
  onBlur?: () => void;
  error?: string | null;
}) {
  const [hinted, setHinted] = useState(false);
  const [other, setOther] = useState(!known.has(value.countryCode));
  const input = useRef<HTMLInputElement>(null);
  // Where the caret goes once the cleaned digits are back in the field:
  // right after the re-render, not a frame later, so a fast next keystroke
  // never lands in the wrong place.
  const caret = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (caret.current === null) return;
    input.current?.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  });

  const onNumber = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = sanitizeDigits(raw);
    if (digits !== raw) {
      setHinted(true);
      // Keep the caret after the same digit it followed.
      caret.current = sanitizeDigits(raw.slice(0, e.target.selectionStart ?? raw.length)).length;
    }
    onChange({ ...value, national: digits.slice(0, 14) });
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const parsed = parsePhone(text);
    if (!parsed.countryCode) return;
    e.preventDefault();
    setOther(!known.has(parsed.countryCode));
    onChange({ countryCode: parsed.countryCode, national: parsed.national.slice(0, 14) });
  };

  const describedBy = [error ? `${id}-error` : null, hinted ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <label htmlFor={`${id}-country`}>{t.phoneCountry}</label>
          <select
            id={`${id}-country`}
            value={other ? 'other' : value.countryCode}
            onChange={(e) => {
              const v = e.target.value;
              setOther(v === 'other');
              onChange({ ...value, countryCode: v === 'other' ? '' : v });
            }}
            className={field}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
            <option value="other">{t.phoneOther}</option>
          </select>
        </div>
        {other && (
          <div className="flex w-28 flex-col gap-1">
            <label htmlFor={`${id}-code`}>{t.phoneOtherCode}</label>
            <input
              id={`${id}-code`}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={value.countryCode}
              onChange={(e) => onChange({ ...value, countryCode: sanitizeDigits(e.target.value).slice(0, 3) })}
              className={field}
            />
          </div>
        )}
        <div className="flex min-w-0 flex-1 basis-40 flex-col gap-1">
          <label htmlFor={id}>{label}</label>
          <input
            ref={input}
            id={id}
            data-phone
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="tel-national"
            value={value.national}
            onChange={onNumber}
            onPaste={onPaste}
            onBlur={onBlur}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={field}
          />
        </div>
      </div>
      <p id={`${id}-hint`} aria-live="polite" className="text-caption text-ink-soft">
        {hinted ? t.phoneOnlyNumbers : ''}
      </p>
      {value.national && value.countryCode && <p className="text-caption text-ink-soft">{fill(t.phoneWillCall, { formatted: formatPhone(value.countryCode, value.national) })}</p>}
      {error && (
        <p id={`${id}-error`} role="status" className="text-caption font-bold text-ink">
          {error}
        </p>
      )}
    </div>
  );
}

export function phoneErrorText(problem: { kind: 'needs'; n: number } | { kind: 'short' } | null): string | null {
  if (!problem) return null;
  return problem.kind === 'needs' ? fill(t.phoneNeedsDigits, { n: problem.n }) : t.phoneTooShort;
}
