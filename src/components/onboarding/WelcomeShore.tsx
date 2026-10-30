'use client';

// The little beach at the start and end of onboarding (v2 spec 11.2): the
// six companions pop in one by one, waving, on the first step; on the last,
// the welcome shell rests on the sand. At motion Off it's just the shore and
// the waves, with nothing popping in.
import type { CSSProperties, ReactNode } from 'react';
import { SPECIES } from '@/lib/companion/registry';
import { useMotionLevel } from '@/lib/motion/useMotionLevel';
import { Companion } from '@/components/companion/Companion';

export function WelcomeShore({ withCompanions = false, children }: { withCompanions?: boolean; children?: ReactNode }) {
  const level = useMotionLevel();
  return (
    <div aria-hidden className="relative h-44 w-full overflow-hidden rounded-card border-2 border-line bg-linear-to-b from-sky-top to-sky-bottom">
      <svg className="absolute inset-x-0 bottom-0 h-24 w-full" viewBox="0 0 400 96" preserveAspectRatio="none">
        <path d="M0 22 Q50 12 100 22 T200 22 T300 22 T400 22 V96 H0 Z" fill="var(--sea)" opacity={0.5} />
        <path d="M0 52 Q110 34 210 46 T400 42 V96 H0 Z" fill="var(--sand)" />
      </svg>
      {withCompanions && level !== 'off' && (
        <div className="absolute inset-x-2 bottom-2 flex items-end justify-between">
          {SPECIES.map((species, i) => (
            <span key={species} className="ob-pop" style={{ '--i': i } as CSSProperties}>
              <Companion override={{ species }} size={52} expression="waving" decorative />
            </span>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
