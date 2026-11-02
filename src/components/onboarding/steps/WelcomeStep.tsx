'use client';

// Step 1, Welcome (v2 spec 11.2): the beach with all six companions waving,
// what Tide is in one line, the way in, and the guided demo (which runs in
// its own space, so it never touches what Maya sets up).
import { onboardingCopy } from '@/copy/onboardingCopy';
import type { StepProps } from '../OnboardingStep';
import { WelcomeShore } from '../WelcomeShore';
import { StepFrame } from './StepFrame';
import { Button } from '@/components/ui/button';
import { enterDemoWorkspace } from '@/lib/workspace';

export function WelcomeStep({ onNext }: StepProps) {
  return (
    <StepFrame
      title={onboardingCopy.welcomeTitle}
      sub={onboardingCopy.welcomeSub}
      action={onboardingCopy.setup}
      onAction={onNext}
      footer={
        <Button variant="secondary" onClick={() => enterDemoWorkspace('full')}>
          {onboardingCopy.watchDemo}
        </Button>
      }
    >
      <WelcomeShore withCompanions />
    </StepFrame>
  );
}
