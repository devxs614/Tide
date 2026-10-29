'use client';

// One suggested feeling: the word, a one-line definition, and a round check
// to pick it. The colored left border shows the state, but the word and
// definition carry the meaning. Read aloud sits beside the pick control
// rather than inside it, so each is its own button.
import { Check } from 'lucide-react';
import { copy } from '@/copy/en';
import { QUADRANT_STYLES } from '@/lib/quadrantStyles';
import type { Quadrant } from '@/lib/types';
import { ReadAloudButton } from '@/components/ui/ReadAloudButton';
import { cn } from '@/lib/utils';

interface Props {
  word: string;
  definition: string;
  quadrant: Quadrant;
  selected: boolean;
  onToggle: () => void;
}

export function EmotionCandidateCard({ word, definition, quadrant, selected, onToggle }: Props) {
  const style = QUADRANT_STYLES[quadrant];
  return (
    <div className={cn('rounded-card border border-l-[6px] border-line bg-surface', style.borderLeft, selected && style.tint)}>
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        aria-label={`${word}. ${definition}.${selected ? ` ${copy.checkin.selected}.` : ''}`}
        onClick={onToggle}
        className="flex w-full items-center gap-3 rounded-card p-4 text-left"
      >
        <span className="flex flex-1 flex-col gap-1">
          <span className="text-[1.294rem] leading-tight font-bold text-ink">{word}</span>
          <span className="text-[0.882rem] text-ink-soft">{definition}</span>
        </span>
        <span
          aria-hidden
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-full border-2',
            selected ? 'border-primary bg-primary text-on-primary' : 'border-ink-soft bg-surface',
          )}
        >
          {selected && <Check className="size-6" />}
        </span>
      </button>
      <ReadAloudButton text={`${word}. ${definition}`} className="mb-2 ml-2" />
    </div>
  );
}
