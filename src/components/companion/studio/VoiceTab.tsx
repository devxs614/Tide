'use client';

// The Studio's Voice tab (v2 spec 8.7): whether the companion's words are
// read aloud, and, when the team set up natural voices, which one it uses.
// Each species has a voice matched to its personality by default; a sample
// plays the companion's own hello so the choice is made by ear.
import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { copy } from '@/copy/en';
import { companionLine } from '@/copy/companions';
import { COMPANION_COPY } from '@/copy/companionCopy';
import { COMPANION_CLOUD_VOICE, type TtsProvider } from '@/data/voices';
import { useSettings } from '@/lib/settings';
import type { CompanionSpecies } from '@/lib/companion/registry';
import { ttsStatus, type TtsStatus } from '@/lib/voice/cloudEngine';
import { useVoice } from '@/lib/voice/useVoice';
import { now } from '@/lib/clock';
import { dayPart } from '@/lib/time';
import { Button } from '@/components/ui/button';
import { WithTooltip } from '@/components/ui/tooltip';
import { CardButton } from '@/components/ui/card';
import { SwitchRow } from '@/components/ui/switch';

export function VoiceTab({ species }: { species: CompanionSpecies }) {
  const { settings, update } = useSettings();
  const voice = useVoice();
  const [cloud, setCloud] = useState<TtsStatus | null>(null);
  useEffect(() => {
    let live = true;
    void ttsStatus().then((s) => live && setCloud(s));
    return () => {
      live = false;
    };
  }, []);

  const t = COMPANION_COPY.studio;
  const natural = !!cloud?.available && settings['privacy.naturalVoiceAllowed'];
  const ownVoice = cloud?.available ? COMPANION_CLOUD_VOICE[cloud.provider as TtsProvider]?.[species] : undefined;
  const chosen = settings['companion.voice'] || ownVoice;
  const sample = companionLine(species, `greeting_${dayPart(now())}`, settings.communicationMode, { name: settings.name });

  return (
    <div className="flex flex-col gap-4">
      <SwitchRow
        id="studio-read-companion"
        label={copy.voice.readCompanion}
        checked={settings['voice.readCompanion']}
        onCheckedChange={(v) => void update('voice.readCompanion', v)}
      />
      {natural && cloud ? (
        <section className="flex flex-col gap-2" aria-labelledby="studio-voice">
          <h2 id="studio-voice" className="font-display font-extrabold">
            {t.companionVoice}
          </h2>
          {cloud.voices.map((v) => (
            <div key={v.id} className="flex items-center gap-2">
              <CardButton
                selected={chosen === v.id}
                onClick={() => void update('companion.voice', v.id === ownVoice ? '' : v.id)}
                className="flex-1"
              >
                <span className="font-display font-extrabold">{v.name}</span>
                {v.id === ownVoice && <span className="text-small text-ink-soft">{t.voiceCurrent}</span>}
              </CardButton>
              <WithTooltip label={copy.voice.playSample}>
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label={`${copy.voice.playSample}: ${v.name}`}
                  onClick={() => void voice.speak(sample, { engine: 'natural', naturalVoice: v.id })}
                >
                  <Volume2 aria-hidden />
                </Button>
              </WithTooltip>
            </div>
          ))}
        </section>
      ) : (
        <p className="text-small text-ink-soft">{t.voiceUnavailable}</p>
      )}
    </div>
  );
}
