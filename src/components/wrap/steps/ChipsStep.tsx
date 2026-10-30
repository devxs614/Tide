'use client';

// Steps 5 and 6, "What helped?" and "What was hard?": chips Maya can pick
// (strategies she actually used today come first for "helped"), and
// "Something else" for her own words, which stay on this device, are never
// sent to the AI, and go through the safety check like any typed text.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { copy } from '@/copy/en';
import { strategyName } from '@/data/strategies';
import { detectCrisis } from '@/lib/safety/detect';
import { Chip } from '@/components/ui/chip';
import type { WrapStepProps } from '../WrapStep';

export function ChipsStep({ wrap, facts, save, kind }: WrapStepProps & { kind: 'helped' | 'hard' }) {
  const router = useRouter();
  const chosen = kind === 'helped' ? wrap.helped : wrap.hard;
  const note = (kind === 'helped' ? wrap.helpedNote : wrap.hardNote) ?? '';
  const [draft, setDraft] = useState(note);
  const [other, setOther] = useState(note.length > 0);
  const general = kind === 'helped' ? copy.wrap.helpedOptions : copy.wrap.hardOptions;
  const used = kind === 'helped' ? [...new Set(facts.strategies.map((s) => s.strategyId))] : [];
  const options = [
    ...used.map((id) => ({ id: `strategy:${id}`, label: strategyName(id) })),
    ...Object.entries(general).map(([id, label]) => ({ id: `general:${id}`, label })),
  ];
  const toggle = (id: string) => {
    const nextList = chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id];
    save(kind === 'helped' ? { helped: nextList } : { hard: nextList });
  };
  const saveNote = (text: string) => {
    if (detectCrisis(text)) return router.push('/support?crisis=1');
    save(kind === 'helped' ? { helpedNote: text.slice(0, 280) } : { hardNote: text.slice(0, 280) });
  };

  return (
    <>
      <h1 className="text-h2 font-extrabold">{kind === 'helped' ? copy.wrap.helpedTitle : copy.wrap.hardTitle}</h1>
      <div role="group" aria-label={kind === 'helped' ? copy.wrap.helpedTitle : copy.wrap.hardTitle} className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o.id} label={o.label} pressed={chosen.includes(o.id)} onToggle={() => toggle(o.id)} />
        ))}
        <Chip label={copy.wrap.somethingElse} pressed={other} onToggle={() => setOther(!other)} />
      </div>
      {other && (
        <div className="flex flex-col gap-2">
          <label htmlFor={`wrap-${kind}-note`} className="font-bold">
            {copy.wrap.noteLabel}
          </label>
          <textarea
            id={`wrap-${kind}-note`}
            rows={2}
            maxLength={280}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => saveNote(draft)}
            className="rounded-input border-2 border-line bg-surface p-3"
          />
        </div>
      )}
    </>
  );
}
