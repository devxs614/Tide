'use client';

// Step 1, Welcome (v2 spec 11.2): the beach with all six companions waving,
// what Tide is in one line, the way in, and the guided demo (which runs in
// its own space, so it never touches what Maya sets up).
import { copy } from '@/copy/en';
import type { StepProps } from '../OnboardingStep';
import { WelcomeShore } from '../WelcomeShore';
import { StepFrame } from './StepFrame';
import { Button } from '@/components/ui/button';
import { enterDemoWorkspace } from '@/lib/workspace';

export function WelcomeStep({ onNext }: StepProps) {
  return (
    <StepFrame
      title={copy.ob.welcomeTitle}
      sub={copy.ob.welcomeSub}
      action={copy.ob.setup}
      onAction={onNext}
      footer={
        <Button variant="secondary" onClick={() => enterDemoWorkspace('full')}>
          {copy.ob.watchDemo}
        </Button>
      }
    >
      <WelcomeShore withCompanions />
    </StepFrame>
  );
}
