'use client';

// Comfort: text size, extra spacing, theme, reduced motion, timer vibration,
// and the read-aloud speed and voice. These are the settings that make Tide
// readable and calm for each person; all apply instantly.
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import type { Settings } from '@/lib/types';
import { SwitchRow } from '@/components/ui/switch';
import { TextSizePicker, ThemePicker } from './PreferencePickers';
import { Section } from './Section';
import { VoicePicker } from './VoicePicker';
import { cn } from '@/lib/utils';

const SPEEDS: Array<[Settings['readAloudRate'], string]> = [
  [0.8, copy.settings.speeds.slow],
  [1, copy.settings.speeds.normal],
  [1.2, copy.settings.speeds.fast],
];

export function ComfortSection() {
  const { settings, update, updateMany } = useSettings();
  return (
    <Section id="comfort" title={copy.settings.comfort}>
      <TextSizePicker />
      <SwitchRow id="set-spacing" label={copy.settings.extraSpacing} checked={settings.extraSpacing} onCheckedChange={(v) => void update('extraSpacing', v)} />
      <ThemePicker />
      <SwitchRow id="set-motion" label={copy.settings.reduceMotion} checked={settings.reduceMotion || settings['motion.level'] === 'off'} onCheckedChange={(v) => void updateMany({ reduceMotion: v, 'motion.level': v ? 'off' : 'auto' })} />
      <SwitchRow id="set-vibration" label={copy.settings.vibration} checked={settings['haptics.enabled']} onCheckedChange={(v) => void updateMany({ vibration: v, 'haptics.enabled': v })} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-bold">{copy.settings.readAloudSpeed}</legend>
        <div className="flex flex-wrap gap-2">
          {SPEEDS.map(([rate, label]) => (
            <button
              key={rate}
              type="button"
              aria-pressed={settings.readAloudRate === rate}
              onClick={() => void update('readAloudRate', rate)}
              className={cn(
                'min-h-12 rounded-full border px-4',
                settings.readAloudRate === rate ? 'border-primary bg-primary font-bold text-on-primary' : 'border-line bg-surface',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      <VoicePicker />
    </Section>
  );
}
