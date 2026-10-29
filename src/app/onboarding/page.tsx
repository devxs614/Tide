// /onboarding — the three first-visit steps, outside the tab layout.
import { PhoneFrame } from '@/components/shell/PhoneFrame';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';

export default function OnboardingPage() {
  return (
    <PhoneFrame>
      <main>
        <OnboardingScreen />
      </main>
    </PhoneFrame>
  );
}
