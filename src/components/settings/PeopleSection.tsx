'use client';

// People and support: the trusted contacts and the campus resource that the
// Support and crisis screens show. They are stored only on this device and
// never sent to the AI or anywhere else. v2.3 Item 2: phone numbers are a
// country code plus digits only; a number the update couldn't read shows a
// calm banner and can be fixed in place, and nothing is ever deleted for it.
import { useState } from 'react';
import { X } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { contactsCopy as t } from '@/copy/contactsCopy';
import { settingsV1 } from '@/copy/settingsV1Copy';
import { useSettings } from '@/lib/settings';
import { defaultCountry, formatPhone, phoneParts, phoneProblem, toDialable } from '@/lib/phone';
import type { TrustedContact } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Section } from './Section';
import { ContactForm } from './ContactForm';
import { PhoneInput, phoneErrorText, type PhoneValue } from './PhoneInput';

const field = 'min-h-12 rounded-input border border-line bg-surface-2 px-3 text-body';

const shown = (c: TrustedContact) => (c.method === 'phone' && c.national && c.countryCode ? formatPhone(c.countryCode, c.national) : c.value);

export function PeopleSection() {
  const { settings, update } = useSettings();
  const contacts = settings.trustedContacts;
  const campus = settings.campusSupport;
  const [reviewing, setReviewing] = useState<TrustedContact | null>(null);
  const [campusName, setCampusName] = useState(campus?.name ?? '');
  const [campusPhone, setCampusPhone] = useState<PhoneValue>(() => (campus?.phone ? phoneParts({ value: campus.phone, countryCode: campus.phoneCountryCode, national: campus.phoneNational }, defaultCountry()) : { countryCode: defaultCountry(), national: '' }));
  const [campusError, setCampusError] = useState<string | null>(null);
  const [campusUrl, setCampusUrl] = useState(campus?.url ?? '');
  const toReview = contacts.find((c) => c.needsReview);

  const saveContact = (c: TrustedContact) => {
    const exists = contacts.some((x) => x.id === c.id);
    void update('trustedContacts', exists ? contacts.map((x) => (x.id === c.id ? c : x)) : [...contacts, c]);
    setReviewing(null);
  };

  const saveCampus = () => {
    const problem = campusPhone.national ? phoneErrorText(phoneProblem(campusPhone.countryCode, campusPhone.national)) : null;
    setCampusError(problem);
    if (problem) return;
    const phone = campusPhone.national ? { phone: toDialable(campusPhone.countryCode, campusPhone.national), phoneCountryCode: campusPhone.countryCode, phoneNational: campusPhone.national } : {};
    void update('campusSupport', { name: campusName.trim(), url: campusUrl.trim() || undefined, ...phone });
  };

  return (
    <Section id="people" title={settingsV1.people}>
      {toReview && (
        <div role="status" className="flex flex-wrap items-center gap-2 card-flat p-3">
          <span className="min-w-0 flex-1 basis-48">{t.contactReview}</span>
          <Button variant="secondary" size="sm" onClick={() => setReviewing(toReview)}>
            {fill(t.reviewContact, { name: toReview.name })}
          </Button>
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {contacts.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-2 card-flat py-1 pr-1 pl-3">
            <span className="min-w-0 flex-1 basis-40 break-words">
              {c.name} · {shown(c)}
            </span>
            <Button variant="quiet" size="sm" aria-label={fill(copy.proof.removeReward, { reward: c.name })} onClick={() => void update('trustedContacts', contacts.filter((x) => x.id !== c.id))}>
              <X aria-hidden />
              {copy.global.remove}
            </Button>
          </li>
        ))}
      </ul>
      {reviewing ? <ContactForm key={reviewing.id} editing={reviewing} onSave={saveContact} /> : <ContactForm onSave={saveContact} />}
      <div role="group" aria-label={settingsV1.campusName} className="flex flex-col gap-2 rounded-card border-2 border-line p-3">
        <label htmlFor="campus-name">{settingsV1.campusName}</label>
        <input id="campus-name" value={campusName} onChange={(e) => setCampusName(e.target.value)} className={field} />
        {campus?.needsReview && <p className="font-bold">{fill(t.contactSavedAs, { value: campus.phone ?? '' })}</p>}
        <PhoneInput id="campus-phone" label={settingsV1.campusPhone} value={campusPhone} onChange={setCampusPhone} onBlur={() => setCampusError(campusPhone.national ? phoneErrorText(phoneProblem(campusPhone.countryCode, campusPhone.national)) : null)} error={campusError} />
        <label htmlFor="campus-url">{settingsV1.campusUrl}</label>
        <input id="campus-url" type="url" value={campusUrl} onChange={(e) => setCampusUrl(e.target.value)} className={field} />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={!campusName.trim()} onClick={saveCampus}>
            {settingsV1.saveCampus}
          </Button>
          {campus && (
            <Button variant="quiet" onClick={() => void update('campusSupport', null)}>
              {settingsV1.removeCampus}
            </Button>
          )}
        </div>
      </div>
    </Section>
  );
}
