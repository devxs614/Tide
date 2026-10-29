'use client';

// Settings → Sound & haptics (v2 spec 6, 15.2). Sound is off until Maya
// turns it on; then she can tune the volume, choose which kinds of sounds
// play, add a background sound for focus, and hear a sample. Vibration is
// offered only where the phone supports it.
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { hapticsSupported } from '@/lib/haptics';
import { useIsClient } from '@/lib/useIsClient';
import { useSound } from '@/lib/sound/useSound';
import type { Settings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { SwitchRow } from '@/components/ui/switch';
import { Section } from './Section';

const VOLUMES = [0.2, 0.4, 0.6, 0.8, 1];
const AMBIENCES: Array<Settings['sound.ambience']> = ['none', 'waves', 'rain', 'brown'];

export function SoundSection() {
  const { settings, update, updateMany } = useSettings();
  const play = useSound();
  const isClient = useIsClient();
  const on = settings['sound.enabled'];
  const canVibrate = isClient && hapticsSupported();
  const volume = VOLUMES.reduce((best, v) => (Math.abs(v - settings['sound.volume']) < Math.abs(best - settings['sound.volume']) ? v : best));

  return (
    <Section id="sound" title={copy.sound.title}>
      <SwitchRow id="sound-on" label={copy.sound.enabled} description={on ? undefined : copy.sound.offByDefault} checked={on} onCheckedChange={(v) => void update('sound.enabled', v)} />
      {on && (
        <>
          <div className="flex flex-col gap-2">
            <span className="font-display font-extrabold">{copy.sound.volume}</span>
            <SegmentedControl
              label={copy.sound.volume}
              value={String(volume)}
              onChange={(v) => void update('sound.volume', Number(v))}
              options={VOLUMES.map((v) => ({ value: String(v), label: `${Math.round(v * 100)}%` }))}
            />
          </div>
          <SwitchRow id="sound-ui" label={copy.sound.ui} checked={settings['sound.ui']} onCheckedChange={(v) => void update('sound.ui', v)} />
          <SwitchRow id="sound-celebrations" label={copy.sound.celebrations} checked={settings['sound.celebrations']} onCheckedChange={(v) => void update('sound.celebrations', v)} />
          <SwitchRow id="sound-companion" label={copy.sound.companion} checked={settings['sound.companion']} onCheckedChange={(v) => void update('sound.companion', v)} />
          <div className="flex flex-col gap-2">
            <span className="font-display font-extrabold">{copy.sound.ambience}</span>
            <SegmentedControl
              label={copy.sound.ambience}
              value={settings['sound.ambience']}
              onChange={(v) => void update('sound.ambience', v)}
              options={AMBIENCES.map((a) => ({ value: a, label: copy.sound.ambiences[a] }))}
            />
          </div>
          <Button variant="secondary" className="self-start" onClick={() => play('celebrate-small')}>
            {copy.sound.playSample}
          </Button>
        </>
      )}
      {canVibrate ? (
        <SwitchRow
          id="set-vibration"
          label={copy.sound.haptics}
          checked={settings['haptics.enabled']}
          onCheckedChange={(v) => void updateMany({ vibration: v, 'haptics.enabled': v })}
        />
      ) : (
        <p className="text-small text-ink-soft">
          {copy.sound.haptics}: {copy.sound.hapticsUnsupported}
        </p>
      )}
    </Section>
  );
}
