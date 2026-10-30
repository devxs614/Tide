'use client';

// Settings 2.0, the index (v2 spec 15.1): search at the top, quick presets,
// the companion, and every section as a row. Each section opens its own page
// with a live preview. Every change applies at once; there is no Save button.
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Bell, CalendarClock, ChevronRight, Eye, HeartHandshake, Info, Languages, PawPrint, PenLine, PlayCircle, Shell, ShieldCheck, Sparkles, Timer, UserRound, Volume2, Waves,
} from 'lucide-react';
import { copy } from '@/copy/en';
import { SECTIONS, type SectionId } from '@/lib/settings/catalog';
import { CompanionSection } from './CompanionSection';
import { PresetsRow } from './PresetsRow';
import { SettingsSearch } from './SettingsSearch';

const ICONS: Record<SectionId, LucideIcon> = {
  profile: UserRound,
  companion: PawPrint,
  appearance: Eye,
  motion: Waves,
  sound: Bell,
  voice: Volume2,
  language: Languages,
  checkin: PenLine,
  day: CalendarClock,
  focus: Timer,
  patterns: Sparkles,
  shore: Shell,
  privacy: ShieldCheck,
  people: HeartHandshake,
  demo: PlayCircle,
  about: Info,
};

export function SettingsScreen() {
  return (
    <div className="flex flex-col gap-6">
      <SettingsSearch />
      <PresetsRow />
      <CompanionSection />
      <nav aria-label={copy.settings.title}>
        <ul className="flex flex-col gap-2">
          {SECTIONS.map(({ id }) => {
            const Icon = ICONS[id];
            return (
              <li key={id}>
                <Link href={`/settings/${id}`} className="press-3d card flex min-h-14 items-center gap-3 px-4 py-3 [--ledge-color:var(--line)] hover:bg-surface-2">
                  <Icon aria-hidden className="size-5 text-primary" />
                  <span className="flex-1 font-display font-extrabold">{copy.set.sections[id]}</span>
                  <ChevronRight aria-hidden className="size-5 text-ink-soft" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
