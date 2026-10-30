'use client';

// Settings → Companion: who the companion is right now, and the way into the
// Companion Studio, where everything about it is chosen. Kept short here on
// purpose, so the Studio stays the one place to change it.
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { COMPANION_COPY } from '@/copy/companions';
import { useCompanion } from '@/lib/companion/useCompanion';
import { SIZES } from '@/lib/companion/registry';
import { Companion } from '@/components/companion/Companion';
import { Section } from './Section';

export function CompanionSection() {
  const profile = useCompanion();
  const t = COMPANION_COPY.settings;
  const status = profile.species
    ? `${profile.name}, ${COMPANION_COPY.species[profile.species].kind.toLowerCase()}`
    : profile.chosen
      ? t.none
      : t.notChosen;
  return (
    <Section id="companion" title={t.title}>
      <Link href="/companion" className="press-3d card flex min-h-12 items-center gap-3 p-3 [--ledge-color:var(--line)] hover:bg-surface-2">
        <Companion size={SIZES.sm} decorative />
        <span className="flex flex-1 flex-col">
          <span className="font-display font-extrabold">{t.open}</span>
          <span className="text-small text-ink-soft">{status}</span>
        </span>
        <ChevronRight aria-hidden className="size-5 text-ink-soft" />
      </Link>
    </Section>
  );
}
