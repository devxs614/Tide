'use client';

// 5-4-3-2-1 senses, one card at a time: 5 things you can see, 4 you can feel,
// down to 1 you can taste. Typing is optional; "Next" alone is enough.
// Nothing typed here is saved.
import { useState } from 'react';
import { copy, fill } from '@/copy/en';
import { Button } from '@/components/ui/button';
import { emitCompanion } from '@/lib/companion/bus';
import type { ToolProps } from './types';

export function Grounding54321({ onDone }: ToolProps) {
  const [card, setCard] = useState(0);
  const prompts = copy.tools.grounding.prompts;
  const count = 5 - card;
  const last = card === prompts.length - 1;

  // A new sense: the companion in the corner perks up (v2 spec 9).
  const nextCard = () => {
    setCard(card + 1);
    emitCompanion({ type: 'nudge', expression: 'curious', reaction: 'lean' });
  };

  return (
    <section aria-live="polite" className="flex flex-col gap-4 card p-4">
      <p className="text-caption text-ink-soft">{fill(copy.tools.grounding.progress, { n: card + 1 })}</p>
      <h3 className="text-h3 font-bold">{prompts[card]}</h3>
      <div key={card} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {Array.from({ length: count }, (_, i) => (
          <input
            key={i}
            aria-label={fill(copy.tools.grounding.inputLabel, { n: i + 1 })}
            className="min-h-12 rounded-input border border-line bg-surface-2 px-3"
          />
        ))}
      </div>
      <Button onClick={() => (last ? onDone() : nextCard())}>{last ? copy.global.done : copy.global.next}</Button>
    </section>
  );
}
