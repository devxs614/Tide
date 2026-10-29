'use client';

// The everyday "Talk to a person" screen: people Maya trusts, support at her
// school, and the crisis lines further down in case she needs them.
import { useEffect } from 'react';
import { copy } from '@/copy/en';
import { holdQuiet } from '@/lib/sound/useSound';
import { CrisisLines } from './CrisisLines';
import { CampusSupport, TrustedContacts } from './ContactList';

export function SupportScreen() {
  // Playful sounds don't belong on the page where people look for help.
  useEffect(() => holdQuiet(), []);
  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="trusted-heading" className="flex flex-col gap-3">
        <h2 id="trusted-heading" className="text-h2 font-bold">
          {copy.support.trusted}
        </h2>
        <TrustedContacts />
      </section>

      <section aria-labelledby="campus-heading" className="flex flex-col gap-3">
        <h2 id="campus-heading" className="text-h2 font-bold">
          {copy.support.campus}
        </h2>
        <CampusSupport />
      </section>

      <section aria-labelledby="crisis-lines-heading" className="flex flex-col gap-3">
        <h2 id="crisis-lines-heading" className="text-h2 font-bold">
          {copy.support.crisisSection}
        </h2>
        <CrisisLines />
      </section>

      <p className="text-ink-soft">{copy.support.neverContacts}</p>
    </div>
  );
}
