'use client';

// Which onboarding step to show (v2 spec 11.2). Each step is its own small
// file; this keeps the order in one readable list.
import { WelcomeStep } from './steps/WelcomeStep';
import { NameStep } from './steps/NameStep';
import { CompanionStep } from './steps/CompanionStep';
import { NameCompanionStep } from './steps/NameCompanionStep';
import { MakeItYoursStep } from './steps/MakeItYoursStep';
import { SensesStep } from './steps/SensesStep';
import { ColorsStep } from './steps/ColorsStep';
import { TalkStep } from './steps/TalkStep';
import { VoiceStep } from './steps/VoiceStep';
import { DayStep } from './steps/DayStep';
import { PrivacyStep } from './steps/PrivacyStep';
import { FirstCheckInStep } from './steps/FirstCheckInStep';

export interface StepProps {
  onNext: () => void;
  // Jump to a step (choosing "no companion" skips naming and dressing it).
  goTo: (step: number) => void;
}

export function OnboardingStep({ step, onNext, goTo, onFinish }: { step: number; onFinish: () => void } & StepProps) {
  switch (step) {
    case 1:
      return <WelcomeStep onNext={onNext} goTo={goTo} />;
    case 2:
      return <NameStep onNext={onNext} goTo={goTo} />;
    case 3:
      return <CompanionStep onNext={onNext} goTo={goTo} />;
    case 4:
      return <NameCompanionStep onNext={onNext} goTo={goTo} />;
    case 5:
      return <MakeItYoursStep onNext={onNext} goTo={goTo} />;
    case 6:
      return <SensesStep onNext={onNext} goTo={goTo} />;
    case 7:
      return <ColorsStep onNext={onNext} goTo={goTo} />;
    case 8:
      return <TalkStep onNext={onNext} goTo={goTo} />;
    case 9:
      return <VoiceStep onNext={onNext} goTo={goTo} />;
    case 10:
      return <DayStep onNext={onNext} goTo={goTo} />;
    case 11:
      return <PrivacyStep onNext={onNext} goTo={goTo} />;
    default:
      return <FirstCheckInStep onFinish={onFinish} />;
  }
}
