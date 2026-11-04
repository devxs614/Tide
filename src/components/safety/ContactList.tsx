'use client';

// Maya's trusted people and her campus support, with buttons that open the
// phone's own call, message or mail app. Shared by the Support screen and the
// crisis screen. Nothing here sends anything by itself.
// v2.3 Item 2: call and text links are built from the country code and
// digits (`tel:+528112345678`). Before, letters in a "phone" were stripped
// at the last moment and "call mom" dialed nothing; now a number that can't
// work disables the buttons and says why. WhatsApp appears for contacts
// marked as having it, and the number can be read aloud digit by digit.
import Link from 'next/link';
import { Globe, Mail, MessageCircle, MessageSquare, Phone } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { contactsCopy } from '@/copy/contactsCopy';
import { useSettings } from '@/lib/settings';
import { defaultCountry, phoneParts, phoneProblem, smsHref, spokenPhone, telHref, whatsAppHref } from '@/lib/phone';
import type { TrustedContact } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ReadAloudButton } from '@/components/ui/ReadAloudButton';

function Unreachable({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">{children}</div>
      <p id={id} className="text-caption text-ink-soft">
        {contactsCopy.contactActionsDisabled}
      </p>
    </div>
  );
}

function ContactActions({ contact }: { contact: TrustedContact }) {
  if (contact.method === 'phone') {
    const { countryCode, national } = phoneParts(contact, defaultCountry());
    if (contact.needsReview || phoneProblem(countryCode, national)) {
      const why = `why-${contact.id}`;
      return (
        <Unreachable id={why}>
          <Button disabled aria-describedby={why}>
            <Phone aria-hidden />
            {copy.support.call}
          </Button>
          <Button variant="secondary" disabled aria-describedby={why}>
            <MessageSquare aria-hidden />
            {copy.support.message}
          </Button>
        </Unreachable>
      );
    }
    return (
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <a href={telHref(countryCode, national)} aria-label={fill(copy.support.callName, { name: contact.name })}>
            <Phone aria-hidden />
            {copy.support.call}
          </a>
        </Button>
        <Button asChild variant="secondary">
          <a href={smsHref(countryCode, national)} aria-label={fill(copy.support.messageName, { name: contact.name })}>
            <MessageSquare aria-hidden />
            {copy.support.message}
          </a>
        </Button>
        {contact.whatsapp && (
          <Button asChild variant="secondary">
            <a href={whatsAppHref(countryCode, national)} target="_blank" rel="noopener noreferrer" aria-label={fill(contactsCopy.contactWhatsAppName, { name: contact.name })}>
              <MessageCircle aria-hidden />
              {contactsCopy.contactWhatsApp}
            </a>
          </Button>
        )}
        <ReadAloudButton text={spokenPhone(countryCode, national)} label={contactsCopy.readNumber} />
      </div>
    );
  }
  if (contact.method === 'email') {
    return (
      <Button asChild variant="secondary">
        <a href={`mailto:${contact.value}`} aria-label={fill(copy.support.messageName, { name: contact.name })}>
          <Mail aria-hidden />
          {copy.support.message}
        </a>
      </Button>
    );
  }
  return <p className="text-ink-soft">{fill(copy.support.reachOn, { name: contact.name, value: contact.value })}</p>;
}

export function TrustedContacts({ showAddLink = true }: { showAddLink?: boolean }) {
  const { settings } = useSettings();
  if (settings.trustedContacts.length === 0) {
    return showAddLink ? (
      <Link href="/settings#people" className="text-primary underline underline-offset-4">
        {copy.support.addSomeone}
      </Link>
    ) : null;
  }
  return (
    <ul className="flex flex-col gap-3">
      {settings.trustedContacts.map((c) => (
        <li key={c.id} className="flex flex-col gap-2 card p-4">
          <span className="text-lead font-bold">{c.name}</span>
          <ContactActions contact={c} />
        </li>
      ))}
    </ul>
  );
}

export function CampusSupport({ showAddLink = true }: { showAddLink?: boolean }) {
  const { settings } = useSettings();
  const campus = settings.campusSupport;
  if (!campus) {
    return showAddLink ? (
      <Link href="/settings#people" className="text-primary underline underline-offset-4">
        {copy.support.addCampus}
      </Link>
    ) : null;
  }
  const parts = campus.phone ? phoneParts({ value: campus.phone, countryCode: campus.phoneCountryCode, national: campus.phoneNational }, defaultCountry()) : null;
  const phone = parts && { ...parts, broken: !!campus.needsReview || !!phoneProblem(parts.countryCode, parts.national) };
  return (
    <div className="flex flex-col gap-2 card p-4">
      <span className="text-lead font-bold">{campus.name}</span>
      <div className="flex flex-wrap gap-2">
        {phone && !phone.broken && (
          <Button asChild>
            <a href={telHref(phone.countryCode, phone.national)} aria-label={fill(copy.support.callName, { name: campus.name })}>
              <Phone aria-hidden />
              {copy.support.call}
            </a>
          </Button>
        )}
        {phone?.broken && (
          <Unreachable id="why-campus">
            <Button disabled aria-describedby="why-campus">
              <Phone aria-hidden />
              {copy.support.call}
            </Button>
          </Unreachable>
        )}
        {campus.url && (
          <Button asChild variant="secondary">
            <a href={campus.url} target="_blank" rel="noreferrer" aria-label={fill(copy.support.visitWebsite, { name: campus.name })}>
              <Globe aria-hidden />
              {copy.support.website}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
