'use client';

// Adding a trusted contact, or fixing one whose number the v2.3 migration
// couldn't read (v2.3 Item 2). A phone contact gets the country code and a
// digits-only number, and the WhatsApp choice; email and handle contacts
// keep a plain field where letters are fine. When fixing, the old text shows
// above the fields ("Saved as: call mom 811…") so it can be typed again.
import { useRef, useState } from 'react';
import { fill } from '@/copy/en';
import { contactsCopy as t } from '@/copy/contactsCopy';
import { settingsV1 } from '@/copy/settingsV1Copy';
import { defaultCountry, phoneParts, phoneProblem, toDialable } from '@/lib/phone';
import type { TrustedContact } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PhoneInput, phoneErrorText, type PhoneValue } from './PhoneInput';

const field = 'min-h-12 rounded-input border border-line bg-surface-2 px-3 text-body';
const METHODS = Object.entries(settingsV1.contactMethods) as Array<[TrustedContact['method'], string]>;

export function ContactForm({ editing, onSave }: { editing?: TrustedContact; onSave: (c: TrustedContact) => void }) {
  const [name, setName] = useState(editing?.name ?? '');
  const [method, setMethod] = useState<TrustedContact['method']>(editing?.method ?? 'phone');
  const [value, setValue] = useState(editing && editing.method !== 'phone' ? editing.value : '');
  const [phone, setPhone] = useState<PhoneValue>(() => ({ countryCode: editing ? phoneParts(editing, defaultCountry()).countryCode : defaultCountry(), national: '' }));
  const [whatsapp, setWhatsapp] = useState(editing?.whatsapp ?? false);
  const [error, setError] = useState<string | null>(null);
  const form = useRef<HTMLDivElement>(null);
  const id = editing ? `contact-${editing.id}` : 'contact';

  const check = () => setError(phone.national ? phoneErrorText(phoneProblem(phone.countryCode, phone.national)) : null);

  const save = () => {
    if (!name.trim()) return;
    if (method !== 'phone') {
      if (!value.trim()) return;
      onSave({ id: editing?.id ?? crypto.randomUUID(), name: name.trim(), method, value: value.trim() });
    } else {
      const problem = phoneErrorText(phoneProblem(phone.countryCode, phone.national));
      // Only this field blocks the save; it says why and takes the focus.
      if (problem) {
        setError(problem);
        form.current?.querySelector<HTMLInputElement>(`#${id}-number`)?.focus();
        return;
      }
      onSave({ id: editing?.id ?? crypto.randomUUID(), name: name.trim(), method, value: toDialable(phone.countryCode, phone.national), countryCode: phone.countryCode, national: phone.national, whatsapp });
    }
    setName('');
    setValue('');
    setPhone((p) => ({ ...p, national: '' }));
    setWhatsapp(false);
    setError(null);
  };

  return (
    <div ref={form} role="group" aria-label={editing ? t.saveChanges : settingsV1.addContact} className="flex flex-col gap-2 rounded-card border-2 border-line p-3">
      {editing?.needsReview && <p className="font-bold">{fill(t.contactSavedAs, { value: editing.value })}</p>}
      <label htmlFor={`${id}-name`}>{settingsV1.contactName}</label>
      <input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} className={field} />
      <label htmlFor={`${id}-method`}>{settingsV1.contactMethod}</label>
      <select id={`${id}-method`} value={method} onChange={(e) => setMethod(e.target.value as TrustedContact['method'])} className={field}>
        {METHODS.map(([m, label]) => (
          <option key={m} value={m}>
            {label}
          </option>
        ))}
      </select>
      {method === 'phone' ? (
        <>
          <PhoneInput id={`${id}-number`} value={phone} onChange={setPhone} onBlur={check} error={error} />
          <label className="flex min-h-12 items-center gap-3">
            <input type="checkbox" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} className="size-5" />
            {t.phoneHasWhatsApp}
          </label>
        </>
      ) : (
        <>
          <label htmlFor={`${id}-value`}>{settingsV1.contactValue}</label>
          <input id={`${id}-value`} value={value} onChange={(e) => setValue(e.target.value)} className={field} />
        </>
      )}
      <Button variant="secondary" className="self-start" onClick={save}>
        {editing ? t.saveChanges : settingsV1.addContact}
      </Button>
    </div>
  );
}
