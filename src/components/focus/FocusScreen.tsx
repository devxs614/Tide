'use client';

// The focus block: one task, its first step, and a timer, with nothing else
// on screen. Maya picks a length (preselected from Unstick or from how she
// feels), starts, can pause, and ends whenever she wants. The timer never
// rolls into a new task by itself; at the end it only asks how it went.
import { useCallback, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/navigation';
import { copy, fill } from '@/copy/en';
import { now } from '@/lib/clock';
import { db } from '@/lib/db';
import { recentCheckIn } from '@/lib/latestState';
import { saveFocusBlock } from '@/lib/repo/focus';
import { useSettings } from '@/lib/settings';
import { useUnstickSheet } from '@/lib/ui';
import type { FocusMinutes, FocusOutcome as Outcome, Quadrant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { LeftOffNote } from '@/components/tasks/LeftOffNote';
import { recallSuggestion } from '@/components/tasks/unstickCache';
import { FocusOutcome } from './FocusOutcome';
import { useFocusTimer } from './useFocusTimer';
import { WaterFill } from './WaterFill';

const LENGTHS: FocusMinutes[] = [5, 10, 15, 25];
const BY_STATE: Record<Quadrant, FocusMinutes> = { ebb: 5, surge: 10, still: 15, swell: 25 };

export function FocusScreen({ taskId, suggestedMinutes }: { taskId: string; suggestedMinutes?: FocusMinutes }) {
  const router = useRouter();
  const { settings } = useSettings();
  const { openUnstick } = useUnstickSheet();
  const task = useLiveQuery(async () => (await db.tasks.get(taskId)) ?? null, [taskId]);
  const rewards = useLiveQuery(() => db.rewards.toArray(), []) ?? [];
  const ruleMinutes = useLiveQuery(async () => {
    const latest = await recentCheckIn(now());
    return latest ? BY_STATE[latest.quadrant] : 10;
  }, []);
  const [chosen, setChosen] = useState<FocusMinutes | null>(null);
  const [asking, setAsking] = useState(false);
  const minutes = chosen ?? suggestedMinutes ?? recallSuggestion(taskId)?.output.focusMinutes ?? ruleMinutes ?? 10;

  const onFinish = useCallback(() => {
    if (settings.vibration && typeof navigator !== 'undefined') navigator.vibrate?.([200, 100, 200]);
    setAsking(true);
  }, [settings.vibration]);
  const timer = useFocusTimer(minutes, onFinish);

  if (task === undefined) return null;
  if (task === null) {
    return (
      <div className="flex flex-col gap-4 p-5">
        <p>{copy.focus.taskMissing}</p>
        <Button onClick={() => router.push('/tasks')}>{copy.focus.backToTasks}</Button>
      </div>
    );
  }

  const end = () => {
    if (timer.phase === 'ready') return router.push('/tasks');
    timer.stop();
    setAsking(true);
  };

  const answer = async (outcome: Outcome) => {
    await saveFocusBlock({ taskId, ts: timer.startedAt ?? now(), minutes, completed: timer.completed, outcome });
  };

  const smallerStep = () => {
    const reason = task.stuckReason ?? recallSuggestion(taskId)?.reason ?? 'too_big';
    router.push('/tasks');
    openUnstick({ taskId, reason, previousStep: task.firstStep });
  };

  return (
    <div className="flex min-h-dvh flex-col gap-5 p-5">
      <header className="flex items-start gap-3">
        <h1 className="flex-1 text-h2 font-bold break-words">{task.title}</h1>
        <Button variant="secondary" onClick={end}>
          {copy.focus.end}
        </Button>
      </header>
      <LeftOffNote task={task} />
      {task.firstStep && (
        <section className="card p-4">
          <h2 className="text-caption text-ink-soft">{copy.focus.firstStep}</h2>
          <p className="text-lead font-bold">{task.firstStep}</p>
        </section>
      )}

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        {timer.phase === 'ready' ? (
          <fieldset className="flex flex-col items-center gap-3">
            <legend className="mb-3 text-center font-bold">{copy.focus.chooseLength}</legend>
            <div className="flex flex-wrap justify-center gap-2">
              {LENGTHS.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={minutes === m}
                  onClick={() => setChosen(m)}
                  className={`min-h-12 min-w-16 rounded-full border px-4 ${minutes === m ? 'border-primary bg-primary font-bold text-on-primary' : 'border-line bg-surface'}`}
                >
                  {fill(copy.focus.minutesOption, { n: m })}
                </button>
              ))}
            </div>
          </fieldset>
        ) : (
          <WaterFill progress={timer.progress} remaining={timer.remaining} />
        )}
        {timer.phase === 'paused' && <p className="text-ink-soft">{copy.focus.paused}</p>}
        <p aria-live="polite" className="sr-only">
          {timer.phase === 'finished' && timer.completed ? copy.focus.finished : ''}
        </p>
        <div className="flex w-full max-w-xs flex-col gap-2">
          {timer.phase === 'ready' && (
            <Button size="lg" onClick={timer.start}>
              {copy.focus.start}
            </Button>
          )}
          {timer.phase === 'running' && (
            <Button size="lg" variant="secondary" onClick={timer.pause}>
              {copy.focus.pause}
            </Button>
          )}
          {timer.phase === 'paused' && (
            <Button size="lg" onClick={timer.resume}>
              {copy.focus.resume}
            </Button>
          )}
          {(timer.phase === 'running' || timer.phase === 'paused') && (
            <Button variant="quiet" onClick={end}>
              {copy.focus.endEarly}
            </Button>
          )}
        </div>
      </div>

      <FocusOutcome
        open={asking}
        rewards={rewards.map((r) => r.text)}
        onAnswer={answer}
        onSmallerStep={smallerStep}
        onDone={() => router.push('/tasks')}
      />
    </div>
  );
}
