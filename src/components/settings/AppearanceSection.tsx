'use client';

// Appearance (v2 spec 15.2): colors, the font pairing and how much things
// move. Every choice applies at once, so Maya sees it while she chooses.
// It sits on the Settings page for now and becomes its own page in V9.
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import type { AppearanceFont, Settings } from '@/lib/types';
import { CardButton } from '@/components/ui/card';
import { Section } from './Section';
import { ThemeGrid } from './ThemeGrid';

const FONTS: AppearanceFont[] = ['playful', 'hyperlegible', 'lexend', 'system'];
const FONT_FAMILY: Record<AppearanceFont, string> = {
  playful: 'var(--font-nunito)',
  hyperlegible: 'var(--font-atkinson)',
  lexend: 'var(--font-lexend)',
  system: 'system-ui',
};
const LEVELS: Array<Settings['motion.level']> = ['auto', 'off', 'calm', 'lively'];

export function AppearanceSection() {
  const { settings, update } = useSettings();
  return (
    <Section id="appearance" title={copy.appearance.title}>
      <ThemeGrid />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-display font-extrabold">{copy.appearance.font}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {FONTS.map((font) => (
            <CardButton key={font} selected={settings['appearance.font'] === font} onClick={() => void update('appearance.font', font)}>
              {/* Each option is shown in its own font, so the choice is visible. */}
              <span className="text-lead font-bold" style={{ fontFamily: FONT_FAMILY[font] }}>
                {copy.appearance.fonts[font].name}
              </span>
              <span className="text-small text-ink-soft">{copy.appearance.fonts[font].description}</span>
            </CardButton>
          ))}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-display font-extrabold">{copy.appearance.motionLevel}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {LEVELS.map((level) => (
            <CardButton key={level} selected={settings['motion.level'] === level} onClick={() => void update('motion.level', level)}>
              <span className="font-display font-extrabold">{copy.appearance.motionLevels[level].name}</span>
              <span className="text-small text-ink-soft">{copy.appearance.motionLevels[level].description}</span>
            </CardButton>
          ))}
        </div>
      </fieldset>
    </Section>
  );
}
