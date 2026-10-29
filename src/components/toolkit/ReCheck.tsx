'use client';

// "How do you feel now compared to before?" One tap after each strategy:
// Better, Same, Worse, or Skip. This is the signal the Patterns screen
// learns from, and every answer is fine. "Worse" is taken seriously: Tide
// thanks Maya and suggests that strategy less.
import { copy } from '@/copy/en';
import type { RecheckResult } from '@/lib/types';
import { Button } from '@/components/ui/button';

const OPTIONS: RecheckResult[] = ['better', 'same', 'worse'];

export function ReCheck({ onAnswer, saving }: { onAnswer: (result: RecheckResult | undefined) => void; saving: boolean }) {
  return (
    <section aria-labelledby="recheck-heading" className="flex flex-col gap-3 card p-4">
      <h3 id="recheck-heading" className="text-h3 font-bold">
        {copy.toolkit.recheck}
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((o) => (
          <Button key={o} variant="secondary" disabled={saving} onClick={() => onAnswer(o)}>
            {copy.toolkit.recheckOptions[o]}
          </Button>
        ))}
      </div>
      <Button variant="quiet" disabled={saving} onClick={() => onAnswer(undefined)}>
        {copy.global.skip}
      </Button>
    </section>
  );
}
