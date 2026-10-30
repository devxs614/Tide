'use client';

// Step 12 (v2 spec 11.2): someone you trust (optional, as in v1), then the
// first real check-in with hints at each step and the companion cheering,
// then the welcome shell on a little shore: "Your shore starts here." The
// last button finishes onboarding. Skip (at the top) finishes at any point.
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { copy } from '@/copy/en';
import { SIZES } from '@/lib/companion/registry';
import { useCompanion } from '@/lib/companion/useCompanion';
import { useSettings } from '@/lib/settings';
import { useCheckInSheet } from '@/lib/ui';
import { Companion } from '@/components/companion/Companion';
import { WelcomeShore } from '../WelcomeShore';
import { StepFrame } from './StepFrame';

const CheckInSheet = dynamic(() => import('@/components/checkin/CheckInSheet').then((m) => m.CheckInSheet), { ssr: false });

function Shell() {
  return (
    <svg aria-hidden viewBox="-30 -30 60 60" className="absolute bottom-3 left-1/2 size-16 -translate-x-1/2">
      <path d="M-22 14 Q-24 -16 0 -22 Q24 -16 22 14 Z" fill="var(--accent)" stroke="var(--accent-shadow)" strokeWidth={2.5} strokeLinejoin="round" />
      {[-12, -4, 4, 12].map((x) => (
        <path key={x} d={`M0 -20 Q${x} -4 ${x * 1.2} 13`} fill="none" stroke="var(--accent-shadow)" strokeWidth={2} strokeLinecap="round" />
      ))}
    </svg>
  );
}

export function FirstCheckInStep({ onFinish }: { onFinish: () => void }) {
  const { settings, update } = useSettings();
  const { openCheckIn } = useCheckInSheet();
  const profile = useCompanion();
  const [stage, setStage] = useState<'trusted' | 'checkin' | 'shore'>('trusted');
  const [contactName, setContactName] = useState('');
  const [contactValue, setContactValue] = useState('');

  const saveContact = async () => {
    const name = contactName.trim();
    const value = contactValue.trim();
    if (name && value) {
      const method = /^[+\d\s()-]+$/.test(value) ? 'phone' : 'handle';
      await update('trustedContacts', [...settings.trustedContacts, { id: crypto.randomUUID(), name, method, value }]);
    }
    setStage('checkin');
  };

  if (stage === 'trusted') {
    return (
      <StepFrame title={copy.ob.trustedTitle} sub={copy.onboarding.addTrusted} action={copy.ob.next} onAction={() => void saveContact()}>
        <label htmlFor="ob-contact-name" className="font-bold">
          {copy.settings.contactName}
        </label>
        <input id="ob-contact-name" value={contactName} onChange={(e) => setContactName(e.target.value)} className="min-h-12 rounded-input border-2 border-line bg-surface px-3" />
        <label htmlFor="ob-contact-value" className="font-bold">
          {copy.settings.contactValue}
        </label>
        <input id="ob-contact-value" value={contactValue} onChange={(e) => setContactValue(e.target.value)} className="min-h-12 rounded-input border-2 border-line bg-surface px-3" />
      </StepFrame>
    );
  }

  if (stage === 'checkin') {
    return (
      <StepFrame title={copy.ob.firstCheckinTitle} sub={copy.ob.firstCheckinSub} action={copy.ob.tryIt} onAction={openCheckIn}>
        {profile.species && (
          <div className="flex justify-center">
            <Companion size={SIZES.lg} expression="happy" />
          </div>
        )}
        <CheckInSheet coach onSaved={() => setStage('shore')} />
      </StepFrame>
    );
  }

  return (
    <StepFrame title={copy.ob.welcomeShell} sub={copy.ob.shoreStarts} action={copy.ob.goToDay} onAction={onFinish}>
      <WelcomeShore>
        <Shell />
      </WelcomeShore>
      {profile.species && (
        <div className="flex justify-center">
          <Companion size={SIZES.md} expression="proud" reaction="wiggle" reactionKey={1} />
        </div>
      )}
    </StepFrame>
  );
}
