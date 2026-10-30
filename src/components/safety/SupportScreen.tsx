'use client';

// The everyday "Talk to a person" screen: people Maya trusts, support at her
// school, and the crisis lines further down in case she needs them.
import { useEffect } from 'react';
import { copy } from '@/copy/en';
import { holdQuiet } from '@/lib/sound/useSound';
import { CrisisLines } from './CrisisLines';
import { CampusSupport, TrustedContacts } from './ContactList';
import { SIZES } from '@/lib/companion/registry';
import { CompanionHost } from '@/components/companion/CompanionHost';
import { holdCelebrations } from '@/lib/celebrate/store';

export function SupportScreen() {
  // Playful sounds don't belong on the page where people look for help.
  useEffect(() => holdQuiet(), []);
  // Never a celebration here, whatever happens elsewhere (v2 spec 10.4).
  useEffect(() => holdCelebrations(), []);
  return (
    <div className="flex flex-col gap-8">
      {/* A small, soft companion for company on the everyday support page
          only. The crisis screen never shows one (v2 spec 9). */}
      <CompanionHost placement="support" size={SIZES.sm} base="soft" bubble="none" noneAlt="nothing" decorative className="self-center" />
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
