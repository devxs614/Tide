'use client';

// "None of these": all 48 words, grouped by state with a plain description
// of each state, plus a box to add a word of Maya's own. The same two-word
// limit applies here. A custom word has no fixed place on the map, so the
// dot stays wherever she puts it.
import { useState } from 'react';
import { copy } from '@/copy/en';
import { SIMPLE_EMOTION_IDS, emotionsInQuadrant } from '@/data/emotions';
import { QUADRANTS } from '@/lib/quadrant';
import { Button } from '@/components/ui/button';
import { StepHeader } from './StepHeader';
import { ToggleChip } from './ToggleChip';
import { QuadrantDot } from '@/components/ui/QuadrantDot';
import { useSettings } from '@/lib/settings';

interface Props {
  selected: string[];
  onToggleEmotion: (id: string) => void;
  onBack: () => void;
}

export function AllWords({ selected, onToggleEmotion, onBack }: Props) {
  const simple = useSettings().settings['checkin.vocabulary'] === 'simple';
  const [own, setOwn] = useState('');
  const addOwn = () => {
    const word = own.trim().slice(0, 30);
    if (!word) return;
    onToggleEmotion(`custom:${word}`);
    setOwn('');
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pt-5 pb-4">
        <StepHeader title={copy.checkin.allWordsTitle} stepNumber={2} />
        {QUADRANTS.map((q) => (
          <section key={q} aria-labelledby={`words-${q}`} className="flex flex-col gap-2">
            <h3 id={`words-${q}`} className="flex items-center gap-2 font-bold">
              <QuadrantDot quadrant={q} />
              {copy.quadrants[q].name}
              <span className="font-normal text-ink-soft">· {copy.quadrants[q].subtitle}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {emotionsInQuadrant(q).filter((e) => !simple || SIMPLE_EMOTION_IDS.includes(e.id)).map((e) => (
                <ToggleChip key={e.id} label={e.word} pressed={selected.includes(e.id)} onToggle={() => onToggleEmotion(e.id)} />
              ))}
            </div>
          </section>
        ))}
        <div className="flex flex-col gap-2">
          <label htmlFor="own-word" className="font-bold">
            {copy.checkin.addOwnWord}
          </label>
          <div className="flex gap-2">
            <input
              id="own-word"
              value={own}
              maxLength={30}
              onChange={(e) => setOwn(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addOwn();
                }
              }}
              className="min-h-12 flex-1 rounded-input border border-line bg-surface-2 px-3 text-body"
            />
            <Button variant="secondary" onClick={addOwn} disabled={!own.trim()}>
              {copy.checkin.ownWordAdd}
            </Button>
          </div>
        </div>
      </div>
      <div className="border-t border-line p-5">
        <Button size="block" onClick={onBack}>
          {copy.global.done}
        </Button>
      </div>
    </>
  );
}
