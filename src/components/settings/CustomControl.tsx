'use client';

// The bigger pieces of Settings pages (theme grid, voice picker, people,
// data, demo…), by catalog id. Most existed in v1 or earlier v2 phases and
// are reused as they are.
import Link from 'next/link';
import { toast } from 'sonner';
import { copy } from '@/copy/en';
import { db } from '@/lib/db';
import type { CustomId } from '@/lib/settings/catalog';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

// Each piece loads only on the page that shows it, so the Appearance page
// doesn't carry the voice picker or the demo controls.
const load = <T,>(loader: () => Promise<T>) => dynamic(loader as never, { ssr: false });
const AboutSection = load(() => import('./AboutSection').then((m) => m.AboutSection));
const AiSection = load(() => import('./AiSection').then((m) => m.AiSection));
const BackupControls = load(() => import('./BackupControls').then((m) => m.BackupControls));
const CompanionSection = load(() => import('./CompanionSection').then((m) => m.CompanionSection));
const DataSection = load(() => import('./DataSection').then((m) => m.DataSection));
const DemoSection = load(() => import('./DemoSection').then((m) => m.DemoSection));
const ShortcutsList = load(() => import('@/components/shell/ShortcutsList').then((m) => m.ShortcutsList));
const PeopleSection = load(() => import('./PeopleSection').then((m) => m.PeopleSection));
const ModePicker = load(() => import('./PreferencePickers').then((m) => m.ModePicker));
const TextSizePicker = load(() => import('./PreferencePickers').then((m) => m.TextSizePicker));
const SoundSection = load(() => import('./SoundSection').then((m) => m.SoundSection));
const ThemeGrid = load(() => import('./ThemeGrid').then((m) => m.ThemeGrid));
const VoicePicker = load(() => import('./VoicePicker').then((m) => m.VoicePicker));

function Anchored({ id, children }: { id: CustomId; children: React.ReactNode }) {
  return (
    <div id={`setting-${id}`} className="setting-target rounded-card">
      {children}
    </div>
  );
}

export function CustomControl({ id }: { id: CustomId }) {
  switch (id) {
    case 'companion':
      return <Anchored id={id}><CompanionSection /></Anchored>;
    case 'theme':
      return <Anchored id={id}><ThemeGrid /></Anchored>;
    case 'textSize':
      return <Anchored id={id}><TextSizePicker /></Anchored>;
    case 'sound':
      return <Anchored id={id}><SoundSection /></Anchored>;
    case 'voice':
      return <Anchored id={id}><VoicePicker /></Anchored>;
    case 'mode':
      return <Anchored id={id}><ModePicker /></Anchored>;
    case 'ai':
      return <Anchored id={id}><AiSection /></Anchored>;
    case 'data':
      return <Anchored id={id}><DataSection /></Anchored>;
    case 'backup':
      return <BackupControls />;
    case 'people':
      return <Anchored id={id}><PeopleSection /></Anchored>;
    case 'demo':
      return <Anchored id={id}><DemoSection /></Anchored>;
    case 'shortcutsList':
      return (
        <Anchored id={id}>
          {/* The page title already says "Keyboard shortcuts". */}
          <p className="mb-2 text-ink-soft">{copy.shortcuts.intro}</p>
          <ShortcutsList />
        </Anchored>
      );
    case 'about':
      return (
        <Anchored id={id}>
          <AboutSection />
          <Link href="/whats-new" className="mt-2 inline-block font-bold text-primary underline underline-offset-4">
            {copy.set.labels.whatsNewLink}
          </Link>
        </Anchored>
      );
    case 'showDismissed':
      return (
        <Anchored id={id}>
          <Button variant="secondary" onClick={() => void db.dismissedPatterns.clear().then(() => toast(copy.set.labels.dismissedCleared))}>
            {copy.set.labels.showDismissed}
          </Button>
        </Anchored>
      );
  }
}
