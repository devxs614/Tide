'use client';

// The Studio's Personality tab (v2 spec 8.8): how much the companion talks,
// each option with a real line it would say, so "chatty" isn't abstract.
// "Hear a line" shows one in the bubble on the stage (and reads it aloud if
// a voice is available), whatever the setting, because Maya asked for it.
import { MessageCircle } from 'lucide-react';
import { fill } from '@/copy/en';
import { COMPANION_COPY, companionLine, type LineContext } from '@/copy/companions';
import { useSettings } from '@/lib/settings';
import type { CompanionSpecies } from '@/lib/companion/registry';
import type { Settings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CardButton } from '@/components/ui/card';

const LEVELS: Array<Settings['companion.talkativeness']> = ['quiet', 'some', 'chatty'];
// The kind of line each level adds: quiet keeps only breathing guidance,
// some speaks at key moments, chatty adds a tip now and then.
const EXAMPLE: Record<Settings['companion.talkativeness'], LineContext> = {
  quiet: 'breathing_invite',
  some: 'after_checkin_swell',
  chatty: 'idle_tip',
};

export function PersonalityTab({ species, onHearLine }: { species: CompanionSpecies; onHearLine: () => void }) {
  const { settings, update } = useSettings();
  const t = COMPANION_COPY;
  const value = settings['companion.talkativeness'];

  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-labelledby="studio-talk" className="flex flex-col gap-2">
        <h3 id="studio-talk" className="font-display font-extrabold">
          {t.studio.talkativeness}
        </h3>
        {LEVELS.map((level) => (
          <CardButton key={level} selected={value === level} onClick={() => void update('companion.talkativeness', level)}>
            <span className="font-display font-extrabold">{t.talkativeness[level].name}</span>
            <span className="text-small text-ink-soft">{t.talkativeness[level].description}</span>
            <span className="text-small italic">
              {fill(t.studio.exampleLine, {
                line: companionLine(species, EXAMPLE[level], settings.communicationMode, { name: settings.name, quadrant: 'Swell' }),
              })}
            </span>
          </CardButton>
        ))}
      </div>
      <Button variant="secondary" className="self-start" onClick={onHearLine}>
        <MessageCircle aria-hidden />
        {t.studio.hearLine}
      </Button>
    </div>
  );
}
