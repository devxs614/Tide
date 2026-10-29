'use client';

// Comfort: text size, extra spacing, light or dark, and reduced motion. The
// settings that make Tide readable and calm for each person; all apply
// instantly. (Voice, sound and vibration have their own sections in v2.)
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { SwitchRow } from '@/components/ui/switch';
import { TextSizePicker, ThemePicker } from './PreferencePickers';
import { Section } from './Section';

export function ComfortSection() {
  const { settings, update, updateMany } = useSettings();
  return (
    <Section id="comfort" title={copy.settings.comfort}>
      <TextSizePicker />
      <SwitchRow id="set-spacing" label={copy.settings.extraSpacing} checked={settings.extraSpacing} onCheckedChange={(v) => void update('extraSpacing', v)} />
      <ThemePicker />
      <SwitchRow id="set-motion" label={copy.settings.reduceMotion} checked={settings.reduceMotion || settings['motion.level'] === 'off'} onCheckedChange={(v) => void updateMany({ reduceMotion: v, 'motion.level': v ? 'off' : 'auto' })} />
    </Section>
  );
}
