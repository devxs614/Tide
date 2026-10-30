'use client';

// The Companion Studio (v2 spec 8.8): one page to meet the companion, name
// it, dress it, decide how much it talks and where it shows up. Every change
// saves at once. Changing who the companion is, or its name, comes with an
// Undo, because those are the two changes that would feel like losing
// someone if they happened by accident.
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { copy } from '@/copy/en';
import { companionLine, type LineContext } from '@/copy/companions';
import { COMPANION_ABOUT, COMPANION_COPY } from '@/copy/companionCopy';
import { useSettings } from '@/lib/settings';
import { useCompanion } from '@/lib/companion/useCompanion';
import { useCompanionVoice } from '@/lib/companion/useCompanionVoice';
import type { CompanionSpecies } from '@/lib/companion/registry';
import { useSound } from '@/lib/sound/useSound';
import { useVoice } from '@/lib/voice/useVoice';
import type { Settings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BreathTogether } from './BreathTogether';
import { LookTab } from './LookTab';
import { NameRow } from './NameRow';
import { PersonalityTab } from './PersonalityTab';
import { StudioHero } from './StudioHero';
import { VoiceTab } from './VoiceTab';
import { WhereTab } from './WhereTab';

// "Hear a line" walks through a few kinds of moments, so a handful of taps
// gives a real sense of the companion's voice.
const SAMPLE_CONTEXTS: LineContext[] = ['greeting_morning', 'after_checkin_swell', 'focus_start', 'after_checkin_ebb', 'celebration', 'idle_tip'];

export function CompanionStudio() {
  const router = useRouter();
  const { settings, updateMany } = useSettings();
  const profile = useCompanion();
  const naturalVoice = useCompanionVoice();
  const play = useSound();
  const voice = useVoice();
  const [line, setLine] = useState<{ text: string; key: number } | null>(null);
  const sampleIndex = useRef(0);
  const t = COMPANION_COPY.studio;
  const species = profile.species;

  const changeWithUndo = (values: Partial<Settings>, message: string) => {
    const before: Partial<Settings> = {};
    for (const key of Object.keys(values) as Array<keyof Settings>) Object.assign(before, { [key]: settings[key] });
    void updateMany(values);
    toast(message, { duration: 8000, action: { label: copy.global.undo, onClick: () => void updateMany(before) } });
  };

  const chooseSpecies = (next: CompanionSpecies | 'none') => {
    if (next === settings['companion.species']) return;
    // Colors belong to a species, so the new one starts in its own first
    // color. The name stays: if Maya named her companion, that's hers.
    changeWithUndo({ 'companion.species': next, 'companion.variant': '' }, t.changedSpecies);
  };

  const hearLine = () => {
    if (!species) return;
    const context = SAMPLE_CONTEXTS[sampleIndex.current++ % SAMPLE_CONTEXTS.length];
    const text = companionLine(species, context, settings.communicationMode, { name: settings.name, quadrant: 'Swell', m: 10 }, String(sampleIndex.current));
    setLine((prev) => ({ text, key: (prev?.key ?? 0) + 1 }));
    play(`chirp-${species}`);
    if (voice.available) void voice.speak(text, { naturalVoice });
  };

  const goBack = () => (window.history.length > 1 ? router.back() : router.push('/'));

  return (
    <div className="flex flex-col gap-5 px-4 pt-3 pb-10">
      <Button variant="quiet" size="sm" className="self-start" onClick={goBack} aria-label={t.backLabel}>
        <ArrowLeft aria-hidden />
        {copy.global.back}
      </Button>

      <StudioHero line={line} onLineDone={() => setLine(null)} />

      <NameRow
        species={species}
        name={profile.name}
        onRename={(name) => {
          if (name !== settings['companion.name']) changeWithUndo({ 'companion.name': name }, t.changedName);
        }}
      />

      <Tabs defaultValue="look">
        <TabsList aria-label={t.title}>
          <TabsTrigger value="look">{t.tabs.look}</TabsTrigger>
          <TabsTrigger value="personality" disabled={!species}>
            {t.tabs.personality}
          </TabsTrigger>
          <TabsTrigger value="where">{t.tabs.where}</TabsTrigger>
          <TabsTrigger value="voice" disabled={!species}>
            {t.tabs.voice}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="look">
          <LookTab onSpecies={chooseSpecies} />
        </TabsContent>
        {species && (
          <TabsContent value="personality">
            <PersonalityTab species={species} onHearLine={hearLine} />
          </TabsContent>
        )}
        <TabsContent value="where">
          <WhereTab />
        </TabsContent>
        {species && (
          <TabsContent value="voice">
            <VoiceTab species={species} />
          </TabsContent>
        )}
      </Tabs>

      {species && <BreathTogether />}

      {species && (
        <section aria-labelledby="studio-about" className="flex flex-col gap-2">
          <h2 id="studio-about" className="text-h3 font-extrabold">
            {t.about}
          </h2>
          <p className="text-ink-soft">{COMPANION_ABOUT[species]}</p>
        </section>
      )}
    </div>
  );
}
