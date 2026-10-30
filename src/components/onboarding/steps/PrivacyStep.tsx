'use client';

// Step 11, "Your privacy" (v2 spec 11.2): v1's plain words about what stays
// on the device, "No account. No ads. No tracking.", the AI switch, the
// natural-voices consent when the team set them up, and the reminder that
// Tide is not a medical service.
import { useEffect, useState } from 'react';
import { copy, fill } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { ttsStatus, type TtsStatus } from '@/lib/voice/cloudEngine';
import { SwitchRow } from '@/components/ui/switch';
import type { StepProps } from '../OnboardingStep';
import { StepFrame } from './StepFrame';

export function PrivacyStep({ onNext }: StepProps) {
  const { settings, update } = useSettings();
  const [cloud, setCloud] = useState<TtsStatus | null>(null);
  useEffect(() => {
    let live = true;
    void ttsStatus().then((s) => live && setCloud(s));
    return () => {
      live = false;
    };
  }, []);
  return (
    <StepFrame title={copy.ob.privacyTitle} action={copy.ob.next} onAction={onNext}>
      <p>{copy.onboarding.privacyBody}</p>
      <p className="font-bold">{copy.ob.privacyBullets}</p>
      <SwitchRow id="ob-ai" label={copy.settings.useAi} checked={settings.aiEnabled} onCheckedChange={(v) => void update('aiEnabled', v)} />
      {cloud?.available && (
        <div className="flex flex-col gap-1">
          <SwitchRow
            id="ob-natural"
            label={copy.voice.naturalAllowed}
            checked={settings['privacy.naturalVoiceAllowed']}
            onCheckedChange={(v) => void update('privacy.naturalVoiceAllowed', v)}
          />
          <p className="text-small text-ink-soft">
            {fill(copy.voice.voicePrivacy, { provider: copy.voice.providers[cloud.provider as 'openai'] ?? cloud.provider })}
          </p>
        </div>
      )}
      <p className="rounded-card bg-surface-2 p-3">{copy.global.notMedical}</p>
    </StepFrame>
  );
}
