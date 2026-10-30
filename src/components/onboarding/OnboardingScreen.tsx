'use client';

// Onboarding 2.0 (v2 spec 11.2): twelve short steps that feel like setting
// up a profile, with nothing leaving the device. A progress bar, Back and
// Skip on every step, and progress saved after each one, so closing the app
// and coming back resumes where Maya left off. "Skip setup" (in the menu at
// the top right) applies sensible defaults and goes straight to Today.
import { useRouter } from 'next/navigation';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { useSettings } from '@/lib/settings';
import { SKIP_SETUP_DEFAULTS } from '@/lib/settings/presets';
import { createWelcomeWin } from '@/lib/repo/wins';
import type { Settings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { OnboardingStep } from './OnboardingStep';

export const TOTAL_STEPS = 12;

// What "Skip" on a step leaves behind. Most steps already show their
// defaults, so skipping just keeps them; choosing a companion is the one
// that needs a value (Lolo, spec 11.2).
const STEP_DEFAULTS: Partial<Record<number, Partial<Settings>>> = {
  3: { 'companion.species': 'axolotl', 'companion.variant': 'pink' },
};

export function OnboardingScreen() {
  const router = useRouter();
  const { settings, update, updateMany } = useSettings();
  const step = Math.min(TOTAL_STEPS, Math.max(1, settings['onboarding.step']));

  const go = (n: number) => void update('onboarding.step', Math.min(TOTAL_STEPS, Math.max(1, n)));
  // With "no companion", Back from the senses step skips naming and
  // dressing a companion that isn't there.
  const back = step === 6 && settings['companion.species'] === 'none' ? 3 : step - 1;

  const finish = async (extra: Partial<Settings> = {}) => {
    await updateMany({
      ...extra,
      onboarded: true,
      // Marks this person as a v2 user, so the v1 → v2 migration never
      // mistakes them for someone who should keep the v1 look.
      schemaVersion: 2,
      'onboarding.step': 1,
    });
    await createWelcomeWin(copy.ob.welcomeShell);
    router.replace('/');
  };

  const skipStep = async () => {
    const defaults = STEP_DEFAULTS[step];
    if (defaults && settings['companion.species'] === null) await updateMany(defaults);
    if (step === TOTAL_STEPS) return finish();
    go(step + 1);
  };

  // Skip setup keeps whatever Maya already chose: a companion she picked,
  // or the look she set, is never replaced by a default (D93).
  const skipSetup = () => {
    const extra: Partial<Settings> = { ...SKIP_SETUP_DEFAULTS };
    if (settings['companion.species'] !== null) {
      delete extra['companion.species'];
      delete extra['companion.variant'];
    }
    if (step > 6) {
      delete extra['appearance.theme'];
      delete extra['appearance.followSystem'];
      delete extra['appearance.font'];
      delete extra['motion.level'];
      delete extra['sound.enabled'];
    }
    void finish(extra);
  };

  return (
    <div className="flex min-h-dvh flex-col gap-5 p-5">
      <div className="flex items-center gap-2">
        {step > 1 ? (
          <Button variant="quiet" size="sm" onClick={() => go(back)}>
            <ArrowLeft aria-hidden />
            {copy.ob.back}
          </Button>
        ) : (
          <span className="min-h-12" />
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button variant="quiet" size="sm" onClick={() => void skipStep()}>
            {copy.ob.skip}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="quiet" size="sm">
                <MoreHorizontal aria-hidden />
                {copy.ob.moreOptions}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={skipSetup}>{copy.ob.skipSetup}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ProgressBar value={step} max={TOTAL_STEPS} label={fill(copy.ob.stepOf, { n: step, total: TOTAL_STEPS })} />
      <p className="sr-only" aria-live="polite">
        {fill(copy.ob.stepOf, { n: step, total: TOTAL_STEPS })}
      </p>
      <div key={step} className="flow-enter flex flex-1 flex-col">
        <OnboardingStep step={step} onNext={() => go(step + 1)} goTo={go} onFinish={() => void finish()} />
      </div>
    </div>
  );
}
