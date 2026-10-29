'use client';

// Bridge step 3, Start: a short checklist for the next activity (what to
// bring, where to go). The ticks only live in this sheet; nothing is graded.
import { useState } from 'react';
import { copy } from '@/copy/en';
import { CheckboxRow } from '@/components/ui/checkbox';
import { updateDraft, type BridgeDraft } from './bridgeDrafts';

export function BridgePrep({ steps, draft }: { steps: string[]; draft: BridgeDraft }) {
  const [checked, setChecked] = useState<string[]>(draft.checked);
  const toggle = (step: string, on: boolean) => {
    const next = on ? [...checked, step] : checked.filter((s) => s !== step);
    updateDraft(draft.eventId, { checked: next });
    setChecked(next);
  };
  return (
    <section aria-labelledby="bridge-start" className="flex flex-col gap-1">
      <h3 id="bridge-start" className="text-h3 font-bold">
        3 · {copy.bridge.startStep}
      </h3>
      {steps.map((step, i) => (
        <CheckboxRow key={step} id={`prep-${i}`} label={step} checked={checked.includes(step)} onCheckedChange={(on) => toggle(step, on)} />
      ))}
    </section>
  );
}
