'use client';

// Brain dump: type (or say) everything in your head, one thing per line.
// Nothing is kept by default. If Maya wants, she ticks the lines that should
// become tasks. Because this is free text, the safety check runs before
// anything else happens with it.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { copy, fill } from '@/copy/en';
import { addTask } from '@/lib/repo/tasks';
import { detectCrisis } from '@/lib/safety/detect';
import { Button } from '@/components/ui/button';
import { CheckboxRow } from '@/components/ui/checkbox';
import { DictateButton } from '@/components/ui/DictateButton';
import { SoftTimer } from './SoftTimer';
import type { ToolProps } from './types';

export function BrainDump({ onDone }: ToolProps) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [picking, setPicking] = useState(false);
  const [chosen, setChosen] = useState<number[]>([]);
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 20);

  // Returns false (and opens the support screen) if the text sounds like a crisis.
  const safe = () => {
    if (!detectCrisis(text)) return true;
    router.push('/support?crisis=1');
    return false;
  };

  const addChosen = async () => {
    for (const i of chosen) await addTask({ title: lines[i].slice(0, 120), type: 'other', energyCost: 1 });
    toast(copy.tools.brainDump.added);
    onDone();
  };

  if (picking) {
    return (
      <div className="flex flex-col gap-3">
        <p>{copy.tools.brainDump.pickLines}</p>
        <div className="flex flex-col">
          {lines.map((line, i) => (
            <CheckboxRow
              key={`${i}-${line}`}
              id={`dump-${i}`}
              label={line}
              checked={chosen.includes(i)}
              onCheckedChange={(on) => setChosen((c) => (on ? [...c, i] : c.filter((x) => x !== i)))}
            />
          ))}
        </div>
        <Button disabled={chosen.length === 0} onClick={() => void addChosen()}>
          {chosen.length === 1 ? copy.tools.brainDump.addOneTask : fill(copy.tools.brainDump.addTasks, { n: chosen.length })}
        </Button>
        <Button variant="quiet" onClick={onDone}>
          {copy.tools.brainDump.keepHere}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <SoftTimer seconds={120} />
      <label htmlFor="brain-dump" className="font-bold">
        {copy.tools.brainDump.label}
      </label>
      <textarea
        id="brain-dump"
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-input border border-line bg-surface-2 p-3 text-body"
      />
      <DictateButton value={text} onChange={setText} />
      <Button disabled={lines.length === 0} onClick={() => safe() && setPicking(true)}>
        {copy.tools.brainDump.turnIntoTasks}
      </Button>
      <Button variant="secondary" onClick={() => safe() && onDone()}>
        {copy.tools.brainDump.keepHere}
      </Button>
    </div>
  );
}
