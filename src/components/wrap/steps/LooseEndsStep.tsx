'use client';

// Step 8, Loose ends: each unfinished task from today, with a choice:
// tomorrow, later this week, let it go (to Someday, bring it back anytime),
// or keep as is. Nothing is deleted, and each change can be undone by
// choosing "Keep as is" again, which puts the task back exactly as it was.
import { useState } from 'react';
import { copy, fill } from '@/copy/en';
import { letGo, moveToDate, restoreTask, snoozeTask } from '@/lib/repo/tasks';
import { laterThisWeek, tomorrowOf } from '@/lib/wrap/facts';
import type { Task } from '@/lib/types';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { WrapStepProps } from '../WrapStep';

type Decision = 'tomorrow' | 'this_week' | 'let_go' | 'keep';
const CHOICES: Decision[] = ['tomorrow', 'this_week', 'let_go', 'keep'];

export function LooseEndsStep({ wrap, facts, save }: WrapStepProps) {
  // The tasks as they were when this step opened, for "Keep as is".
  const [originals] = useState<Task[]>(() => facts.looseEnds);
  const decisionFor = (id: string): Decision => wrap.carryover.find((c) => c.taskId === id)?.decision ?? 'keep';

  const choose = async (task: Task, decision: Decision) => {
    await restoreTask(task);
    if (decision === 'tomorrow') await moveToDate(task.id, facts.date, tomorrowOf(facts.date));
    if (decision === 'this_week') await snoozeTask(task.id, laterThisWeek(facts.date));
    if (decision === 'let_go') await letGo(task.id);
    save({ carryover: [...wrap.carryover.filter((c) => c.taskId !== task.id), { taskId: task.id, decision }] });
  };

  const moved = wrap.carryover.filter((c) => c.decision === 'tomorrow' || c.decision === 'this_week').length;
  const letGoCount = wrap.carryover.filter((c) => c.decision === 'let_go').length;

  return (
    <>
      <h1 className="text-h2 font-extrabold">{copy.wrap.looseTitle}</h1>
      {originals.length === 0 && <p>{copy.wrap.noLoose}</p>}
      <ul className="flex flex-col gap-4">
        {originals.map((task) => (
          <li key={task.id} className="flex flex-col gap-2">
            <span className="font-bold">{task.title}</span>
            <SegmentedControl
              label={task.title}
              value={decisionFor(task.id)}
              onChange={(d) => void choose(task, d)}
              options={CHOICES.map((c) => ({ value: c, label: copy.wrap.carry[c] }))}
            />
            {decisionFor(task.id) === 'let_go' && <p className="text-small text-ink-soft">{copy.wrap.letGoHint}</p>}
          </li>
        ))}
      </ul>
      {originals.length > 0 && <p className="text-small text-ink-soft">{fill(copy.wrap.looseCount, { moved, letGo: letGoCount })}</p>}
    </>
  );
}
