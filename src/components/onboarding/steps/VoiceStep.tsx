'use client';

// Step 9, "Want Tide to read things aloud?" (v2 spec 11.2, 7.8): the three
// best voices on this device with a sample each, the speed, and a yes or a
// "No thanks". Read-aloud buttons stay either way; "yes" also reads AI
// suggestions and the companion's lines without being asked.
import { Volume2 } from 'lucide-react';
import { copy } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { cleanVoiceName } from '@/lib/voice/voiceRanking';
import { useDeviceVoices } from '@/lib/voice/useDeviceVoices';
import { useVoice } from '@/lib/voice/useVoice';
import { Button } from '@/components/ui/button';
import { WithTooltip } from '@/components/ui/tooltip';
import { CardButton } from '@/components/ui/card';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { StepProps } from '../OnboardingStep';
import { StepFrame } from './StepFrame';

const RATES = [0.8, 0.9, 1, 1.1];

export function VoiceStep({ onNext }: StepProps) {
  const { settings, update, updateMany } = useSettings();
  const voice = useVoice();
  const voices = useDeviceVoices(settings['voice.accent']).slice(0, 3);
  const yes = () => {
    void updateMany({ 'voice.autoReadAi': true, 'voice.readCompanion': true });
    onNext();
  };
  return (
    <StepFrame
      title={copy.ob.voiceTitle}
      action={copy.ob.yesVoice}
      onAction={yes}
      footer={
        <Button variant="secondary" onClick={onNext}>
          {copy.ob.noThanks}
        </Button>
      }
    >
      {voices.length > 0 && (
        <div className="flex flex-col gap-2">
          {voices.map((v) => (
            <div key={v.voiceURI} className="flex items-center gap-2">
              <CardButton selected={settings['voice.deviceVoiceURI'] === v.voiceURI} onClick={() => void update('voice.deviceVoiceURI', v.voiceURI)} className="flex-1">
                <span className="font-display font-extrabold">{cleanVoiceName(v.name)}</span>
              </CardButton>
              <WithTooltip label={copy.voice.playSample}>
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label={`${copy.voice.playSample}: ${cleanVoiceName(v.name)}`}
                  onClick={() => void voice.speak(copy.voice.voiceSample, { engine: 'device', deviceVoiceURI: v.voiceURI })}
                >
                  <Volume2 aria-hidden />
                </Button>
              </WithTooltip>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <span className="font-display font-extrabold">{copy.voice.rate}</span>
        <SegmentedControl
          label={copy.voice.rate}
          value={String(settings['voice.rate'])}
          onChange={(v) => void update('voice.rate', Number(v))}
          options={RATES.map((r) => ({ value: String(r), label: `${r}×` }))}
        />
      </div>
    </StepFrame>
  );
}
