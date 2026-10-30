'use client';

// Step 6, "How do you like your senses?" (v2 spec 11.2, 15.3): the presets
// as cards, each saying in a few words what it sets. Picking one applies it
// at once, so Maya sees and hears the change. Sounds have their own switch
// underneath, with a sample.
import { useState } from 'react';
import { copy } from '@/copy/en';
import { hapticsSupported } from '@/lib/haptics';
import { PRESET_IDS, presetValues, type PresetId } from '@/lib/settings/presets';
import { useSettings } from '@/lib/settings';
import { useSound } from '@/lib/sound/useSound';
import { Button } from '@/components/ui/button';
import { CardButton } from '@/components/ui/card';
import { SwitchRow } from '@/components/ui/switch';
import type { StepProps } from '../OnboardingStep';
import { StepFrame } from './StepFrame';

export function SensesStep({ onNext }: StepProps) {
  const { settings, update, updateMany } = useSettings();
  const play = useSound();
  const [picked, setPicked] = useState<PresetId | 'later' | null>(null);
  return (
    <StepFrame title={copy.ob.sensesTitle} sub={copy.ob.sensesSub} action={copy.ob.next} onAction={onNext}>
      <div className="flex flex-col gap-2">
        {PRESET_IDS.map((id) => (
          <CardButton
            key={id}
            selected={picked === id}
            onClick={() => {
              setPicked(id);
              void updateMany(presetValues(id, hapticsSupported()));
            }}
          >
            <span className="font-display font-extrabold">{copy.ob.presets[id].name}</span>
            <span className="text-small text-ink-soft">{copy.ob.presets[id].summary}</span>
          </CardButton>
        ))}
        <CardButton selected={picked === 'later'} onClick={() => setPicked('later')}>
          <span className="font-display font-extrabold">{copy.ob.customizeLater}</span>
        </CardButton>
      </div>
      <SwitchRow
        id="ob-sounds"
        label={copy.sound.enabled}
        description={settings['sound.enabled'] ? undefined : copy.ob.soundsOff}
        checked={settings['sound.enabled']}
        onCheckedChange={(v) => void update('sound.enabled', v)}
      />
      {settings['sound.enabled'] && (
        <Button variant="secondary" className="self-start" onClick={() => play('celebrate-small')}>
          {copy.sound.playSample}
        </Button>
      )}
    </StepFrame>
  );
}
