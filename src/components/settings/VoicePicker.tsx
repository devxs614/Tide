'use client';

// Settings → Voice (v2 spec 7.8): how Tide reads aloud. Pick the engine
// (Auto, Natural, Device or Off), hear the best voices on this device and
// choose one, set the speed and accent, and decide what gets read
// automatically. Voices differ a lot between devices, and one person's
// "calm" is another's "tiring", so every voice can be heard before choosing.
import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import type { Settings, VoiceAccent } from '@/lib/types';
import { ttsStatus, type TtsStatus } from '@/lib/voice/cloudEngine';
import { cleanVoiceName, scoreVoice } from '@/lib/voice/voiceRanking';
import { useDeviceVoices } from '@/lib/voice/useDeviceVoices';
import { useVoice } from '@/lib/voice/useVoice';
import { Button } from '@/components/ui/button';
import { CardButton } from '@/components/ui/card';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { SwitchRow } from '@/components/ui/switch';

const ENGINES: Array<Settings['voice.engine']> = ['auto', 'natural', 'device', 'off'];
const RATES = [0.8, 0.9, 1, 1.1, 1.2];
const ACCENTS = Object.keys(copy.voice.accents) as VoiceAccent[];

function accentLabel(lang: string): string {
  const key = lang.replace('_', '-') as VoiceAccent;
  return copy.voice.accents[key] ?? lang;
}

export function VoicePicker() {
  const { settings, update } = useSettings();
  const voice = useVoice();
  const devices = useDeviceVoices(settings['voice.accent']);
  const [cloud, setCloud] = useState<TtsStatus | null>(null);
  useEffect(() => {
    let live = true;
    void ttsStatus().then((s) => live && setCloud(s));
    return () => {
      live = false;
    };
  }, []);

  const engine = settings['voice.engine'];
  const natural = cloud?.available ?? false;
  // Every voice here is weak: suggest Edge or natural voices (spec 7.8).
  const limited = devices.length > 0 && !natural && devices.every((v) => scoreVoice(v) < 15);
  const sample = copy.voice.voiceSample;

  return (
    <div className="flex flex-col gap-4" id="voice-picker">
      <div className="flex flex-col gap-2">
        <span className="font-display font-extrabold" id="voice-engine-label">
          {copy.voice.engine}
        </span>
        <SegmentedControl
          label={copy.voice.engine}
          value={engine}
          onChange={(value) => void update('voice.engine', value)}
          options={ENGINES.map((e) => ({ value: e, label: copy.voice.engines[e].name, disabled: e === 'natural' && !natural }))}
        />
        <p className="text-small text-ink-soft">{copy.voice.engines[engine].description}</p>
        {!natural && <p className="text-small text-ink-soft">{copy.voice.naturalUnavailable}</p>}
      </div>

      {engine !== 'off' && (
        <>
          {natural && cloud && (
            <section className="flex flex-col gap-2" aria-label={copy.voice.voiceNatural}>
              <h4 className="font-display font-extrabold">{copy.voice.voiceNatural}</h4>
              <p className="text-small text-ink-soft">
                {fill(copy.voice.voicePrivacy, { provider: copy.voice.providers[cloud.provider as 'openai'] ?? cloud.provider })}
              </p>
              <SwitchRow
                id="voice-natural-allowed"
                label={copy.voice.naturalAllowed}
                checked={settings['privacy.naturalVoiceAllowed']}
                onCheckedChange={(v) => void update('privacy.naturalVoiceAllowed', v)}
              />
              <div className="grid gap-2 sm:grid-cols-2">
                {cloud.voices.map((v) => (
                  <div key={v.id} className="flex items-center gap-2">
                    <CardButton
                      selected={(settings['voice.naturalVoice'] || cloud.voices[0]?.id) === v.id}
                      onClick={() => void update('voice.naturalVoice', v.id)}
                      className="flex-1"
                    >
                      <span className="font-display font-extrabold">{v.name}</span>
                    </CardButton>
                    <Button variant="secondary" size="icon" aria-label={`${copy.voice.playSample}: ${v.name}`} onClick={() => void voice.speak(sample, { engine: 'natural', naturalVoice: v.id })}>
                      <Volume2 aria-hidden />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {devices.length > 0 && (
            <section className="flex flex-col gap-2" aria-label={copy.voice.voiceDevice}>
              <h4 className="font-display font-extrabold">{copy.voice.voiceDevice}</h4>
              <CardButton selected={!settings['voice.deviceVoiceURI']} onClick={() => void update('voice.deviceVoiceURI', null)}>
                <span className="font-display font-extrabold">{copy.voice.automatic}</span>
              </CardButton>
              {devices.map((v) => (
                <div key={v.voiceURI} className="flex items-center gap-2">
                  <CardButton
                    selected={settings['voice.deviceVoiceURI'] === v.voiceURI}
                    onClick={() => void update('voice.deviceVoiceURI', v.voiceURI)}
                    className="flex-1"
                  >
                    <span className="font-display font-extrabold">{cleanVoiceName(v.name)}</span>
                    <span className="text-small text-ink-soft">{accentLabel(v.lang)}</span>
                  </CardButton>
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label={`${copy.voice.playSample}: ${cleanVoiceName(v.name)}`}
                    onClick={() => void voice.speak(sample, { engine: 'device', deviceVoiceURI: v.voiceURI })}
                  >
                    <Volume2 aria-hidden />
                  </Button>
                </div>
              ))}
              {limited && <p className="text-small text-ink-soft">{copy.voice.voiceLimited}</p>}
            </section>
          )}

          <div className="flex flex-col gap-2">
            <span className="font-display font-extrabold">{copy.voice.rate}</span>
            <SegmentedControl
              label={copy.voice.rate}
              value={String(settings['voice.rate'])}
              onChange={(value) => void update('voice.rate', Number(value))}
              options={RATES.map((r) => ({ value: String(r), label: `${r}×` }))}
            />
          </div>

          <label className="flex flex-col gap-2">
            <span className="font-display font-extrabold">{copy.voice.accent}</span>
            <select
              value={settings['voice.accent']}
              onChange={(e) => void update('voice.accent', e.target.value as VoiceAccent)}
              className="min-h-12 rounded-input border-2 border-line bg-surface-2 px-3 text-body"
            >
              {ACCENTS.map((a) => (
                <option key={a} value={a}>
                  {copy.voice.accents[a]}
                </option>
              ))}
            </select>
          </label>

          <SwitchRow id="voice-auto-ai" label={copy.voice.autoReadAi} checked={settings['voice.autoReadAi']} onCheckedChange={(v) => void update('voice.autoReadAi', v)} />
          <SwitchRow id="voice-companion" label={copy.voice.readCompanion} checked={settings['voice.readCompanion']} onCheckedChange={(v) => void update('voice.readCompanion', v)} />
          <SwitchRow id="voice-breathing" label={copy.voice.breathingCues} checked={settings['voice.breathingCues']} onCheckedChange={(v) => void update('voice.breathingCues', v)} />
        </>
      )}
    </div>
  );
}
