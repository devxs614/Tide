'use client';

// Step 1, Welcome (v2 spec 11.2): the beach with all six companions waving,
// what Tide is in one line, and the way in.
import { copy } from '@/copy/en';
import type { StepProps } from '../OnboardingStep';
import { WelcomeShore } from '../WelcomeShore';
import { StepFrame } from './StepFrame';

export function WelcomeStep({ onNext }: StepProps) {
  return (
    <StepFrame title={copy.ob.welcomeTitle} sub={copy.ob.welcomeSub} action={copy.ob.setup} onAction={onNext}>
      <WelcomeShore withCompanions />
    </StepFrame>
  );
}
