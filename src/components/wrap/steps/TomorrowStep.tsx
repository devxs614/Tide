'use client';

// Step 9, Tomorrow: tomorrow's events, a heads-up for a switch the pattern
// engine knows is often hard (its own numbers), and "Pick one thing to start
// tomorrow". With one picked, the existing Unstick route can prepare a first
// step tonight, while the context is fresh; Maya can edit it before saving.
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { copy, fill } from '@/copy/en';
import { useAi } from '@/lib/ai/useAi';
import { now } from '@/lib/clock';
import { db } from '@/lib/db';
import { loadPatternInput } from '@/lib/patterns/data';
import { hardSwitchFor } from '@/lib/patterns/rules/hardTransition';
import { setAnchor, setFirstStep } from '@/lib/repo/tasks';
import { useSettings } from '@/lib/settings';
import { formatTime } from '@/lib/time';
import { tomorrowOf } from '@/lib/wrap/facts';
import { Button } from '@/components/ui/button';
import { CardButton } from '@/components/ui/card';
import type { WrapStepProps } from '../WrapStep';

export function TomorrowStep({ wrap, facts, save }: WrapStepProps) {
  const { settings } = useSettings();
  const unstick = useAi('unstick');
  const [step, setStep] = useState(wrap.anchorFirstStep ?? '');
  const tasks = useLiveQuery(
    () => db.tasks.filter((t) => t.status !== 'done' && !t.someday).toArray().then((list) => list.sort((a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999') || a.energyCost - b.energyCost)),
    [],
  ) ?? [];
  const hint = useLiveQuery(async () => {
    const ev = facts.tomorrowEvents;
    if (ev.length < 2) return null;
    const data = await loadPatternInput(now(), 28);
    for (let i = 1; i < ev.length; i++) {
      const hard = hardSwitchFor(data, ev[i - 1].kind, ev[i].kind);
      if (hard) return fill(copy.wrap.hardSwitchHint, { pair: `${ev[i - 1].title} → ${ev[i].title}`, time: formatTime(ev[i].start), k: hard.k, n: hard.n });
    }
    return null;
  }, [facts.tomorrowEvents]);
  const anchor = tasks.find((t) => t.id === wrap.anchorTaskId);

  const findStep = async () => {
    if (!anchor) return;
    const result = await unstick.run({
      mode: settings.communicationMode,
      task: { title: anchor.title.slice(0, 120), type: anchor.type, energyCost: anchor.energyCost },
      reason: 'dont_know_start',
      helpfulStrategies: [],
    });
    setStep(result.data.firstStep);
  };

  const saveStep = async () => {
    if (!anchor || !step.trim()) return;
    await setFirstStep(anchor.id, step.trim());
    await setAnchor(anchor.id, tomorrowOf(facts.date));
    save({ anchorFirstStep: step.trim() });
    toast(copy.wrap.stepSaved);
  };

  return (
    <>
      <h1 className="text-h2 font-extrabold">{copy.wrap.tomorrowTitle}</h1>
      {facts.tomorrowEvents.length === 0 ? (
        <p className="text-ink-soft">{copy.wrap.noEvents}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {facts.tomorrowEvents.map((e) => (
            <li key={e.id}>
              <span className="font-bold">{formatTime(e.start)}</span> · {e.title}
            </li>
          ))}
        </ul>
      )}
      {hint && <p className="card-flat p-3">{hint}</p>}
      <h2 className="text-h3 font-extrabold">{copy.wrap.pickOne}</h2>
      <div className="flex flex-col gap-2">
        {tasks.slice(0, 6).map((t) => (
          <CardButton key={t.id} selected={wrap.anchorTaskId === t.id} onClick={() => save({ anchorTaskId: t.id })}>
            <span className="font-bold">{t.title}</span>
          </CardButton>
        ))}
      </div>
      {anchor && (
        <div className="flex flex-col gap-2">
          <p className="font-bold">{copy.wrap.wantStep}</p>
          <Button variant="secondary" className="self-start" loading={unstick.status === 'loading'} onClick={() => void findStep()}>
            {copy.wrap.yesStep}
          </Button>
          <label htmlFor="wrap-first-step" className="font-bold">
            {copy.wrap.stepLabel}
          </label>
          <input id="wrap-first-step" value={step} maxLength={140} onChange={(e) => setStep(e.target.value)} className="min-h-12 rounded-input border-2 border-line bg-surface px-3" />
          <Button className="self-start" disabled={!step.trim()} onClick={() => void saveStep()}>
            {copy.wrap.saveStep}
          </Button>
        </div>
      )}
    </>
  );
}
