// /onboarding — the twelve first-visit steps (v2 spec 11.2), outside the
// tab layout so the tabs and the Check in button stay out of the way until
// she is done.
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
