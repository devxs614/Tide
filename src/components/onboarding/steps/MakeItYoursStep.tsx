'use client';

// Step 5, "Make it yours" (v2 spec 11.2): color and accessory, with the
// companion previewing every change live. Everything is unlocked.
import { copy } from '@/copy/en';
import { COMPANION_COPY } from '@/copy/companionCopy';
import { ACCESSORIES, COMPANIONS, SIZES } from '@/lib/companion/registry';
import { useCompanion } from '@/lib/companion/useCompanion';
import { useSettings } from '@/lib/settings';
import { CardButton } from '@/components/ui/card';
import { Companion } from '@/components/companion/Companion';
import type { StepProps } from '../OnboardingStep';
import { StepFrame } from './StepFrame';

export function MakeItYoursStep({ onNext }: StepProps) {
  const { update } = useSettings();
  const profile = useCompanion();
  if (!profile.species) return null;
  const species = profile.species;
  const variants = COMPANIONS[species].variants;
  const variant = variants.find((v) => v.id === profile.variant)?.id ?? variants[0].id;
  return (
    <StepFrame title={copy.ob.makeItYours} action={copy.ob.looksGood} onAction={onNext}>
      <div className="flex justify-center">
        <Companion size={SIZES.lg} expression="happy" />
      </div>
      <div role="group" aria-labelledby="ob-color" className="flex flex-col gap-2">
        <h2 id="ob-color" className="font-display font-extrabold">
          {COMPANION_COPY.studio.color}
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {variants.map((v) => (
            <CardButton key={v.id} selected={variant === v.id} onClick={() => void update('companion.variant', v.id)} className="items-center gap-1 px-1 py-2 text-center">
              <Companion override={{ species, variant: v.id }} size={SIZES.sm} decorative />
              <span className="text-caption font-bold">{COMPANION_COPY.variants[v.id] ?? v.id}</span>
            </CardButton>
          ))}
        </div>
      </div>
      <div role="group" aria-labelledby="ob-accessory" className="flex flex-col gap-2">
        <h2 id="ob-accessory" className="font-display font-extrabold">
          {COMPANION_COPY.studio.accessory}
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {ACCESSORIES.map((a) => (
            <CardButton key={a} selected={profile.accessory === a} onClick={() => void update('companion.accessory', a)} className="items-center gap-1 px-1 py-2 text-center">
              <Companion override={{ species, variant, accessory: a }} size={SIZES.sm} decorative />
              <span className="text-caption font-bold">{COMPANION_COPY.accessories[a]}</span>
            </CardButton>
          ))}
        </div>
      </div>
    </StepFrame>
  );
}
