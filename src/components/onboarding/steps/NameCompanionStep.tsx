'use client';

// Step 4, "What's your companion's name?" (v2 spec 11.2): keep the name it
// came with, or give it a new one (same gentle rules as the Studio). It
// hops when the name is settled, then the next step follows.
import { useState } from 'react';
import { copy, fill } from '@/copy/en';
import { COMPANION_COPY } from '@/copy/companionCopy';
import { cleanCompanionName, companionNameProblem } from '@/lib/companion/name';
import { COMPANIONS, SIZES } from '@/lib/companion/registry';
import { useCompanion } from '@/lib/companion/useCompanion';
import { useMotionLevel } from '@/lib/motion/useMotionLevel';
import { useSettings } from '@/lib/settings';
import { Button } from '@/components/ui/button';
import { Companion } from '@/components/companion/Companion';
import type { StepProps } from '../OnboardingStep';
import { StepFrame } from './StepFrame';

const HOP_MS = 700;

export function NameCompanionStep({ onNext }: StepProps) {
  const { update } = useSettings();
  const profile = useCompanion();
  const level = useMotionLevel();
  const [draft, setDraft] = useState<string | null>(null);
  const [hop, setHop] = useState(0);
  if (!profile.species) return null;
  const fallback = COMPANIONS[profile.species].defaultName;
  const problem = draft === null ? null : companionNameProblem(draft);

  const settle = async (name: string) => {
    await update('companion.name', name === fallback ? '' : name);
    setHop((h) => h + 1);
    window.setTimeout(onNext, level === 'off' ? 0 : HOP_MS);
  };

  return (
    <StepFrame
      title={copy.ob.nameCompanionTitle}
      action={draft === null ? fill(copy.ob.keepName, { name: profile.name }) : COMPANION_COPY.studio.saveName}
      actionDisabled={!!problem}
      onAction={() => void settle(draft === null ? profile.name : cleanCompanionName(draft))}
      footer={
        draft === null && (
          <Button variant="secondary" onClick={() => setDraft(profile.name)}>
            {copy.ob.rename}
          </Button>
        )
      }
    >
      <div className="flex justify-center">
        <Companion size={SIZES.lg} expression={hop ? 'happy' : 'idle'} reaction={hop ? 'hop' : null} reactionKey={hop} />
      </div>
      {draft !== null && (
        <div className="flex flex-col gap-2">
          <label htmlFor="ob-companion-name" className="font-bold">
            {COMPANION_COPY.studio.nameLabel}
          </label>
          <input
            id="ob-companion-name"
            value={draft}
            maxLength={24}
            autoComplete="off"
            autoFocus
            aria-describedby="ob-companion-name-help"
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-12 rounded-input border-2 border-line bg-surface px-3 text-body"
          />
          <p id="ob-companion-name-help" aria-live="polite" className="text-small text-ink-soft">
            {problem ? COMPANION_COPY.studio.nameErrors[problem] : COMPANION_COPY.studio.nameHelp}
          </p>
        </div>
      )}
    </StepFrame>
  );
}
