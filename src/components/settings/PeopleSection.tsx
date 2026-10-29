'use client';

// People and support: the trusted contacts and the campus resource that the
// Support and crisis screens show. They are stored only on this device and
// never sent to the AI or anywhere else.
import { useState } from 'react';
import { X } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import type { TrustedContact } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Section } from './Section';

const field = 'min-h-12 rounded-input border border-line bg-surface-2 px-3 text-body';
const METHODS = Object.entries(copy.settings.contactMethods) as Array<[TrustedContact['method'], string]>;

export function PeopleSection() {
  const { settings, update } = useSettings();
  const [name, setName] = useState('');
  const [method, setMethod] = useState<TrustedContact['method']>('phone');
  const [value, setValue] = useState('');
  const campus = settings.campusSupport;
  const [campusName, setCampusName] = useState(campus?.name ?? '');
  const [campusPhone, setCampusPhone] = useState(campus?.phone ?? '');
  const [campusUrl, setCampusUrl] = useState(campus?.url ?? '');

  const addContact = () => {
    if (!name.trim() || !value.trim()) return;
    void update('trustedContacts', [...settings.trustedContacts, { id: crypto.randomUUID(), name: name.trim(), method, value: value.trim() }]);
    setName('');
    setValue('');
  };

  return (
    <Section id="people" title={copy.settings.people}>
      <ul className="flex flex-col gap-2">
        {settings.trustedContacts.map((c) => (
          <li key={c.id} className="flex items-center gap-2 rounded-card border border-line bg-surface py-1 pr-1 pl-3">
            <span className="flex-1 break-words">
              {c.name} · {c.value}
            </span>
            <Button variant="quiet" size="sm" aria-label={fill(copy.proof.removeReward, { reward: c.name })} onClick={() => void update('trustedContacts', settings.trustedContacts.filter((x) => x.id !== c.id))}>
              <X aria-hidden />
              {copy.global.remove}
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 rounded-card border border-line p-3">
        <label htmlFor="contact-name">{copy.settings.contactName}</label>
        <input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
        <label htmlFor="contact-method">{copy.settings.contactMethod}</label>
        <select id="contact-method" value={method} onChange={(e) => setMethod(e.target.value as TrustedContact['method'])} className={field}>
          {METHODS.map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <label htmlFor="contact-value">{copy.settings.contactValue}</label>
        <input id="contact-value" value={value} onChange={(e) => setValue(e.target.value)} className={field} />
        <Button variant="secondary" className="self-start" onClick={addContact}>
          {copy.settings.addContact}
        </Button>
      </div>
      <div className="flex flex-col gap-2 rounded-card border border-line p-3">
        <label htmlFor="campus-name">{copy.settings.campusName}</label>
        <input id="campus-name" value={campusName} onChange={(e) => setCampusName(e.target.value)} className={field} />
        <label htmlFor="campus-phone">{copy.settings.campusPhone}</label>
        <input id="campus-phone" value={campusPhone} onChange={(e) => setCampusPhone(e.target.value)} className={field} />
        <label htmlFor="campus-url">{copy.settings.campusUrl}</label>
        <input id="campus-url" type="url" value={campusUrl} onChange={(e) => setCampusUrl(e.target.value)} className={field} />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            disabled={!campusName.trim()}
            onClick={() => void update('campusSupport', { name: campusName.trim(), phone: campusPhone.trim() || undefined, url: campusUrl.trim() || undefined })}
          >
            {copy.settings.saveCampus}
          </Button>
          {campus && (
            <Button variant="quiet" onClick={() => void update('campusSupport', null)}>
              {copy.settings.removeCampus}
            </Button>
          )}
        </div>
      </div>
    </Section>
  );
}
