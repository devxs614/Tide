'use client';

// Step 12, wind down (optional): a slow minute of breathing with a sleepy
// companion, emptying your head into tasks for tomorrow, or just resting.
import { useState } from 'react';
import { toast } from 'sonner';
import { copy, fill } from '@/copy/en';
import { addTask, moveToDate } from '@/lib/repo/tasks';
import { tomorrowOf } from '@/lib/wrap/facts';
import { Button } from '@/components/ui/button';
import { CardButton } from '@/components/ui/card';
import { BreathTogether } from '@/components/companion/studio/BreathTogether';
import type { WrapStepProps } from '../WrapStep';

export function WindDownStep({ facts, save, next }: WrapStepProps) {
  const [choice, setChoice] = useState<'breathing' | 'brain_dump' | null>(null);
  const [text, setText] = useState('');

  const dump = async () => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 12);
    for (const line of lines) {
      const task = await addTask({ title: line.slice(0, 120), type: 'other', energyCost: 1 });
      await moveToDate(task.id, facts.date, tomorrowOf(facts.date));
    }
    setText('');
    toast(fill(copy.wrap.dumpSaved, { n: lines.length }));
  };

  return (
    <>
      <h1 className="text-h2 font-extrabold">{copy.wrap.windTitle}</h1>
      <div className="flex flex-col gap-2">
        <CardButton selected={choice === 'breathing'} onClick={() => (setChoice('breathing'), save({ windDown: 'breathing' }))}>
          <span className="font-bold">{copy.wrap.windBreathing}</span>
        </CardButton>
        <CardButton selected={choice === 'brain_dump'} onClick={() => (setChoice('brain_dump'), save({ windDown: 'brain_dump' }))}>
          <span className="font-bold">{copy.wrap.windDump}</span>
          <span className="text-small text-ink-soft">{copy.wrap.windDumpHint}</span>
        </CardButton>
        <CardButton onClick={() => (save({ windDown: 'rest' }), next())}>
          <span className="font-bold">{copy.wrap.windRest}</span>
        </CardButton>
      </div>
      {choice === 'breathing' && <BreathTogether rounds={4} title={copy.wrap.windBreathing} sleepy />}
      {choice === 'brain_dump' && (
        <div className="flex flex-col gap-2">
          <label htmlFor="wrap-dump" className="font-bold">
            {copy.wrap.dumpLabel}
          </label>
          <textarea id="wrap-dump" rows={5} value={text} onChange={(e) => setText(e.target.value)} className="rounded-input border-2 border-line bg-surface p-3" />
          <Button className="self-start" disabled={!text.trim()} onClick={() => void dump()}>
            {copy.wrap.dumpSave}
          </Button>
        </div>
      )}
    </>
  );
}
