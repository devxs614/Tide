'use client';

// "Read-aloud voice" in Settings → Comfort. Voices sound very different from
// one device to the next, and some people find a voice tiring that others
// like, so Maya can hear one and choose it. Hidden where speech isn't there.
import { copy, fill } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { useEnglishVoices } from '@/lib/useVoices';
import { ReadAloudButton } from '@/components/ui/ReadAloudButton';

const accentOf = (lang: string) => copy.settings.accents[lang.replace('_', '-')] ?? copy.settings.accents.other;

export function VoicePicker() {
  const { settings, update } = useSettings();
  const voices = useEnglishVoices();
  if (voices.length === 0) return null;
  // A voice chosen on another device may not exist here; show Automatic then.
  const chosen = voices.some((v) => v.name === settings.readAloudVoice) ? settings.readAloudVoice : '';

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="set-voice" className="font-bold">
        {copy.settings.readAloudVoice}
      </label>
      <select
        id="set-voice"
        value={chosen}
        onChange={(e) => void update('readAloudVoice', e.target.value)}
        className="min-h-12 rounded-input border border-line bg-surface-2 px-3 text-body"
      >
        <option value="">{copy.settings.voiceAuto}</option>
        {voices.map((v) => (
          <option key={v.voiceURI} value={v.name}>
            {fill(copy.settings.voiceOption, { name: v.name, accent: accentOf(v.lang) })}
          </option>
        ))}
      </select>
      <p className="text-caption text-ink-soft">{copy.settings.voiceHint}</p>
      <ReadAloudButton text={copy.settings.voiceSample} label={copy.settings.tryVoice} />
    </div>
  );
}
