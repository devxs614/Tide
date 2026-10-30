'use client';

// The proposed lighter day: the idea in one sentence, then "Keep today" and
// "Move to tomorrow", each task with a button to switch sides. The kept
// energy total updates as Maya flips tasks, so she can see the plan fits.
import { ArrowDown, ArrowUp } from 'lucide-react';
import { copy, fill } from '@/copy/en';
import { keptEnergy } from '@/lib/daymode';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { EnergyDots } from '@/components/ui/Dots';
import { ReadAloudButton } from '@/components/ui/ReadAloudButton';
import { StepHeader } from '@/components/checkin/StepHeader';

interface Props {
  tasks: Task[];
  keep: string[];
  budget: number;
  rationale: string;
  onToggle: (id: string) => void;
  onApply: () => void;
  onKeepAsIs: () => void;
}

function Side({ title, tasks, kept, onToggle }: { title: string; tasks: Task[]; kept: boolean; onToggle: (id: string) => void }) {
  return (
    <section aria-label={title} className="flex flex-col gap-2">
      <h3 className="font-bold">{title}</h3>
      {tasks.length === 0 && <p className="text-ink-soft">{copy.dayMode.emptySide}</p>}
      <ul className="flex flex-col gap-2">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-3 card p-3">
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="break-words">{t.title}</span>
              <EnergyDots cost={t.energyCost} />
            </span>
            <Button variant="secondary" size="sm" onClick={() => onToggle(t.id)}>
              {kept ? <ArrowDown aria-hidden /> : <ArrowUp aria-hidden />}
              <span className="sr-only">{fill(kept ? copy.dayMode.moveThis : copy.dayMode.keepThis, { title: t.title })}</span>
              <span aria-hidden>{kept ? copy.dayMode.moveTomorrow : copy.dayMode.keepToday}</span>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DayModeProposal({ tasks, keep, budget, rationale, onToggle, onApply, onKeepAsIs }: Props) {
  const keepSet = new Set(keep);
  const kept = tasks.filter((t) => keepSet.has(t.id));
  const moved = tasks.filter((t) => !keepSet.has(t.id));
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-5 pb-4">
        <StepHeader title={copy.dayMode.title} />
        {tasks.length === 0 ? (
          <p>{copy.dayMode.nothingToPlan}</p>
        ) : (
          <>
            <div className="flex flex-col gap-1 rounded-card bg-surface-2 p-3">
              <p className="text-caption text-ink-soft">{copy.global.suggestion}</p>
              <p className="text-lead">{rationale}</p>
              <ReadAloudButton text={rationale} />
            </div>
            <p aria-live="polite" className="font-bold">
              {fill(copy.dayMode.keptEnergy, { kept: keptEnergy(tasks, keep), budget })}
            </p>
            <Side title={copy.dayMode.keepToday} tasks={kept} kept onToggle={onToggle} />
            <Side title={copy.dayMode.moveTomorrow} tasks={moved} kept={false} onToggle={onToggle} />
          </>
        )}
      </div>
      <div className="flex flex-col gap-2 border-t border-line p-5">
        {tasks.length > 0 && (
          <Button size="block" onClick={onApply} data-demo-id="daymode-apply">
            {copy.dayMode.useThisPlan}
          </Button>
        )}
        <Button variant="secondary" size="block" onClick={onKeepAsIs}>
          {copy.dayMode.keepAsIs}
        </Button>
      </div>
    </>
  );
}
