'use client';

// Brain dump: type (or say) everything in your head, one thing per line.
// Nothing is kept by default. If Maya wants, she ticks the lines that should
// become tasks. Because this is free text, the safety check runs before
// anything else happens with it.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { fill } from '@/copy/en';
import { toolsCopy } from '@/copy/toolsCopy';
import { addTask } from '@/lib/repo/tasks';
import { detectCrisis } from '@/lib/safety/detect';
import { Button } from '@/components/ui/button';
import { CheckboxRow } from '@/components/ui/checkbox';
import { DictateButton } from '@/components/ui/DictateButton';
import { SoftTimer } from './SoftTimer';
import type { ToolProps } from './types';

export function BrainDump({ onDone, onDraft }: ToolProps) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [picking, setPicking] = useState(false);
  const [chosen, setChosen] = useState<number[]>([]);
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 20);

  // Typed lines make Cancel ask first, offering to keep them as tasks
  // (v2.1 F-08). The safety check still comes before anything is saved.
  const dirty = lines.length > 0;
  useEffect(() => {
    if (!onDraft) return;
    onDraft(
      dirty
        ? {
            save: async () => {
              if (detectCrisis(text)) return void router.push('/support?crisis=1');
              for (const line of lines) await addTask({ title: line.slice(0, 120), type: 'other', energyCost: 1 });
              toast(toolsCopy.brainDump.added);
            },
          }
        : null,
    );
    // `lines` comes from `text`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, text, onDraft]);

  // Returns false (and opens the support screen) if the text sounds like a crisis.
  const safe = () => {
    if (!detectCrisis(text)) return true;
    router.push('/support?crisis=1');
    return false;
  };

  const addChosen = async () => {
    for (const i of chosen) await addTask({ title: lines[i].slice(0, 120), type: 'other', energyCost: 1 });
    toast(toolsCopy.brainDump.added);
    onDone();
  };

  if (picking) {
    return (
      <div className="flex flex-col gap-3">
        <p>{toolsCopy.brainDump.pickLines}</p>
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
          {chosen.length === 1 ? toolsCopy.brainDump.addOneTask : fill(toolsCopy.brainDump.addTasks, { n: chosen.length })}
        </Button>
        <Button variant="quiet" onClick={onDone}>
          {toolsCopy.brainDump.keepHere}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <SoftTimer seconds={120} />
      <label htmlFor="brain-dump" className="font-bold">
        {toolsCopy.brainDump.label}
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
        {toolsCopy.brainDump.turnIntoTasks}
      </Button>
      <Button variant="secondary" onClick={() => safe() && onDone()}>
        {toolsCopy.brainDump.keepHere}
      </Button>
    </div>
  );
}
