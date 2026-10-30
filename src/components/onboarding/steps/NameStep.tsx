'use client';

// Step 2, "What should we call you?" (optional). The greeting Today will
// show updates as Maya types, so she sees where her name goes.
import { useState } from 'react';
import { copy, fill } from '@/copy/en';
import { now } from '@/lib/clock';
import { useSettings } from '@/lib/settings';
import { dayPart } from '@/lib/time';
import type { StepProps } from '../OnboardingStep';
import { StepFrame } from './StepFrame';

export function NameStep({ onNext }: StepProps) {
  const { settings, update } = useSettings();
  // The field keeps its own text: saving is asynchronous, and binding the
  // field to the saved value dropped letters when typing fast.
  const [draft, setDraft] = useState(settings.name);
  const greeting = copy.today.greeting[dayPart(now())];
  const name = draft.trim();
  return (
    <StepFrame title={copy.ob.nameTitle} sub={copy.ob.nameHint} action={copy.ob.next} onAction={onNext}>
      <label htmlFor="ob-name" className="font-bold">
        {copy.ob.nameLabel}
      </label>
      <input
        id="ob-name"
        value={draft}
        maxLength={40}
        autoComplete="given-name"
        onChange={(e) => {
          setDraft(e.target.value);
          void update('name', e.target.value);
        }}
        className="min-h-12 rounded-input border-2 border-line bg-surface px-3 text-body"
      />
      <div className="card flex flex-col p-4" aria-label={copy.ob.namePreview}>
        <span className="text-caption text-ink-soft">{copy.ob.namePreview}</span>
        <span className="text-h2 font-bold">{name ? fill(copy.today.greetingWithName, { greeting, name }) : greeting}</span>
      </div>
    </StepFrame>
  );
}
