'use client';

// Settings → Focus → "Alert volume" with "Test sound" (v2.1 F-06). The test
// plays the chosen end sound at this volume, whatever the other sound
// settings say, because it's the same alarm the timer will use.
import { Volume2 } from 'lucide-react';
import { settingsCopy } from '@/copy/settingsCopy';
import { useSettings } from '@/lib/settings';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';

const VOLUMES = [0.2, 0.4, 0.6, 0.8, 1];

export function FocusAlertVolume() {
  const { settings, update } = useSettings();
  const current = settings['focus.alertVolume'];
  const volume = VOLUMES.reduce((best, v) => (Math.abs(v - current) < Math.abs(best - current) ? v : best));
  const test = () => {
    void import('@/lib/focus/alertEngine').then((engine) => {
      engine.unlockAlertAudio();
      engine.playTone(settings['focus.endTone'], current);
    });
  };
  return (
    <div className="flex flex-col gap-2">
      <span className="font-display font-extrabold">{settingsCopy.labels.alertVolume}</span>
      <SegmentedControl
        label={settingsCopy.labels.alertVolume}
        value={String(volume)}
        onChange={(v) => void update('focus.alertVolume', Number(v))}
        options={VOLUMES.map((v) => ({ value: String(v), label: `${Math.round(v * 100)}%` }))}
      />
      <Button variant="secondary" size="sm" className="self-start" onClick={test}>
        <Volume2 aria-hidden />
        {settingsCopy.testSound}
      </Button>
    </div>
  );
}
