'use client';

// Step 7, "Pick your colors" (v2 spec 11.2): the same theme grid as
// Settings, with live previews. A preset from the step before may already
// have picked one.
import { copy } from '@/copy/en';
import { ThemeGrid } from '@/components/settings/ThemeGrid';
import type { StepProps } from '../OnboardingStep';
import { StepFrame } from './StepFrame';

export function ColorsStep({ onNext }: StepProps) {
  return (
    <StepFrame title={copy.ob.colorsTitle} action={copy.ob.next} onAction={onNext}>
      <ThemeGrid />
    </StepFrame>
  );
}
