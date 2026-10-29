'use client';

// Maya's trusted people and her campus support, with buttons that open the
// phone's own call, message or mail app. Shared by the Support screen and the
// crisis screen. Nothing here sends anything by itself.
import Link from 'next/link';
import { Globe, Mail, MessageSquare, Phone } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import type { TrustedContact } from '@/lib/types';
import { Button } from '@/components/ui/button';

function telValue(value: string): string {
  return value.replace(/[^\d+]/g, '');
}

function ContactActions({ contact }: { contact: TrustedContact }) {
  if (contact.method === 'phone') {
    const number = telValue(contact.value);
    return (
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <a href={`tel:${number}`} aria-label={fill(copy.support.callName, { name: contact.name })}>
            <Phone aria-hidden />
            {copy.support.call}
          </a>
        </Button>
        <Button asChild variant="secondary">
          <a href={`sms:${number}`} aria-label={fill(copy.support.messageName, { name: contact.name })}>
            <MessageSquare aria-hidden />
            {copy.support.message}
          </a>
        </Button>
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
  return (
    <div className="flex flex-col gap-2 card p-4">
      <span className="text-lead font-bold">{campus.name}</span>
      <div className="flex flex-wrap gap-2">
        {campus.phone && (
          <Button asChild>
            <a href={`tel:${telValue(campus.phone)}`} aria-label={fill(copy.support.callName, { name: campus.name })}>
              <Phone aria-hidden />
              {copy.support.call}
            </a>
          </Button>
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
