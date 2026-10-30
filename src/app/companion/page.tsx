// /companion — the Companion Studio (v2 spec 8.8). Full screen and outside
// the tab layout, like Focus, because it's a place to spend a minute with
// the companion, not a tab to pass through. Reached from the companion in
// the top bar, Settings → Companion, and onboarding.
import type { Metadata } from 'next';
import { PhoneFrame } from '@/components/shell/PhoneFrame';
import { CompanionStudio } from '@/components/companion/studio/CompanionStudio';
import { COMPANION_COPY } from '@/copy/companionCopy';

export const metadata: Metadata = { title: `${COMPANION_COPY.studio.title} · Tide` };

export default function CompanionPage() {
  return (
    <PhoneFrame>
      <main>
        <CompanionStudio />
      </main>
    </PhoneFrame>
  );
}
