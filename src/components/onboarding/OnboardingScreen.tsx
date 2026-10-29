'use client';

// First visit: three short steps. What Tide is (and isn't), making it
// comfortable, and privacy in plain words. Every preference applies the
// moment it is chosen, and "Skip" on any step goes straight to Today with
// sensible defaults. Nothing here is required.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { Button } from '@/components/ui/button';
import { SwitchRow } from '@/components/ui/switch';
import { ModePicker, TextSizePicker, ThemePicker } from '@/components/settings/PreferencePickers';
import { WaveArt } from './WaveArt';

export function OnboardingScreen() {
  const router = useRouter();
  const { settings, update, updateMany } = useSettings();
  const [step, setStep] = useState(1);
  const [contactName, setContactName] = useState('');
  const [contactValue, setContactValue] = useState('');

  const finish = async () => {
    const contact = contactName.trim() && contactValue.trim();
    await updateMany({
      onboarded: true,
      // Marks this person as a v2 user, so the v1 → v2 migration never
      // mistakes them for someone who should keep the v1 look.
      schemaVersion: 2,
      ...(contact
        ? { trustedContacts: [...settings.trustedContacts, { id: crypto.randomUUID(), name: contactName.trim(), method: /^[+\d\s()-]+$/.test(contactValue) ? 'phone' : 'handle', value: contactValue.trim() }] }
        : {}),
    });
    router.replace('/');
  };

  return (
    <div className="flex min-h-dvh flex-col gap-6 p-5">
      <div className="flex items-center justify-between">
        <p className="text-ink-soft">{fill(copy.onboarding.progress, { n: step })}</p>
        <Button variant="quiet" onClick={() => void finish()}>
          {copy.onboarding.skip}
        </Button>
      </div>

      {step === 1 && (
        <section aria-labelledby="ob-title" className="flex flex-col gap-5">
          <WaveArt />
          <h1 id="ob-title" className="text-h1 font-bold">
            {copy.onboarding.step1Title}
          </h1>
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">{copy.onboarding.does}</h2>
            <ul className="flex flex-col gap-1">
              {copy.onboarding.doesList.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">{copy.onboarding.doesnt}</h2>
            <ul className="flex flex-col gap-1">
              {copy.onboarding.doesntList.map((item) => (
                <li key={item} className="flex gap-2">
                  <X className="mt-1 size-4 shrink-0 text-ink-soft" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {step === 2 && (
        <section aria-labelledby="ob-title" className="flex flex-col gap-5">
          <h1 id="ob-title" className="text-h1 font-bold">
            {copy.onboarding.step2Title}
          </h1>
          <TextSizePicker />
          <ThemePicker />
          <SwitchRow id="ob-motion" label={copy.settings.reduceMotion} checked={settings.reduceMotion || settings['motion.level'] === 'off'} onCheckedChange={(v) => void updateMany({ reduceMotion: v, 'motion.level': v ? 'off' : 'auto' })} />
          <ModePicker />
        </section>
      )}

      {step === 3 && (
        <section aria-labelledby="ob-title" className="flex flex-col gap-5">
          <h1 id="ob-title" className="text-h1 font-bold">
            {copy.onboarding.step3Title}
          </h1>
          <p>{copy.onboarding.privacyBody}</p>
          <SwitchRow id="ob-ai" label={copy.settings.useAi} checked={settings.aiEnabled} onCheckedChange={(v) => void update('aiEnabled', v)} />
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-bold">{copy.onboarding.addTrusted}</legend>
            <label htmlFor="ob-contact-name">{copy.settings.contactName}</label>
            <input id="ob-contact-name" value={contactName} onChange={(e) => setContactName(e.target.value)} className="min-h-12 rounded-input border border-line bg-surface-2 px-3" />
            <label htmlFor="ob-contact-value">{copy.settings.contactValue}</label>
            <input id="ob-contact-value" value={contactValue} onChange={(e) => setContactValue(e.target.value)} className="min-h-12 rounded-input border border-line bg-surface-2 px-3" />
          </fieldset>
          <p className="rounded-card bg-surface-2 p-3">{copy.global.notMedical}</p>
        </section>
      )}

      <div className="mt-auto flex flex-col gap-2">
        {step < 3 ? (
          <Button size="block" onClick={() => setStep(step + 1)}>
            {copy.onboarding.continue}
          </Button>
        ) : (
          <Button size="block" onClick={() => void finish()}>
            {copy.onboarding.start}
          </Button>
        )}
        {step > 1 && (
          <Button variant="quiet" onClick={() => setStep(step - 1)}>
            {copy.global.back}
          </Button>
        )}
      </div>
    </div>
  );
}
