'use client';

// The focus block: one task, its first step, and a timer, with nothing else
// on screen. Maya picks a length (preselected from Unstick or from how she
// feels), starts, can pause, and ends whenever she wants. The timer never
// rolls into a new task by itself; at the end it only asks how it went.
import { useCallback, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/navigation';
import { fill } from '@/copy/en';
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
import { emitCompanion } from '@/lib/companion/bus';
import { SIZES } from '@/lib/companion/registry';
import { CompanionHost } from '@/components/companion/CompanionHost';
import { useCelebrate } from '@/lib/celebrate/useCelebrate';
import { useAmbience } from '@/lib/sound/useAmbience';
import { useWakeLock } from '@/lib/useWakeLock';
import { getTask } from '@/lib/repo/taskQueries';
import { focusAlertCopy } from '@/copy/focusAlertCopy';
import { useFocusAlert } from './useFocusAlert';
import { EndGlow } from './EndGlow';
import { useNudges } from './useNudges';
import { NudgeCard } from './NudgeCard';
import { BreakPanel } from './BreakPanel';
import { FocusCoach, FocusMenu } from './FocusMenu';
import { EndFocusDialog } from './EndFocusDialog';
import { Headphones } from 'lucide-react';
import { ambienceCopy } from '@/copy/ambienceCopy';
import { useAmbienceState } from '@/lib/sound/ambienceState';
import { AmbienceSheet } from '@/components/ambience/AmbienceSheet';
import { useAmbienceFocusEnd } from '@/components/ambience/useAmbienceFocusEnd';
import { MINUTE } from '@/lib/time';
import { clearFocusRunning, markFocusRunning } from '@/lib/focusRunning';
import { focusCopy } from '@/copy/focusCopy';

const LENGTHS: FocusMinutes[] = [5, 10, 15, 25];
const BY_STATE: Record<Quadrant, FocusMinutes> = { ebb: 5, surge: 10, still: 15, swell: 25 };

export function FocusScreen({ taskId, suggestedMinutes }: { taskId: string; suggestedMinutes?: FocusMinutes }) {
  const router = useRouter();
  const { settings, update } = useSettings();
  const { openUnstick } = useUnstickSheet();
  const task = useLiveQuery(async () => (await getTask(taskId)) ?? null, [taskId]);
  const rewards = useLiveQuery(() => db.rewards.toArray(), []) ?? [];
  const latestState = useLiveQuery(async () => (await recentCheckIn(now()))?.quadrant ?? null, []);
  const ruleMinutes = latestState === undefined ? undefined : latestState ? BY_STATE[latestState] : 10;
  const [chosen, setChosen] = useState<FocusMinutes | null>(null);
  const [asking, setAsking] = useState(false);
  // A fixed length from Settings → Focus wins over the v1 rule ("auto").
  const fixed = settings['focus.defaultMinutes'] === 'auto' ? undefined : settings['focus.defaultMinutes'];
  const minutes = chosen ?? suggestedMinutes ?? recallSuggestion(taskId)?.output.focusMinutes ?? fixed ?? ruleMinutes ?? 10;

  // The sound, vibration and tab signals at the end live in useFocusAlert
  // (v2.1 F-06); this only opens the "how did it go?" question.
  const onFinish = useCallback(() => setAsking(true), []);
  const timer = useFocusTimer(minutes, onFinish);
  const endAlert = useFocusAlert({ phase: timer.phase, endsAt: timer.endsAt, remaining: timer.remaining, completed: timer.completed, taskTitle: task?.title ?? '' });
  const nudges = useNudges({
    phase: timer.phase,
    endsAt: timer.endsAt,
    totalMs: minutes * MINUTE,
    blocked: asking,
    taskTitle: task?.title ?? '',
    pause: timer.pause,
    resume: timer.resume,
  });
  // v2.1 F-09: a background sound chosen here; "until focus ends" fades out
  // before the end alert.
  const [soundsOpen, setSoundsOpen] = useState(false);
  // Where the companion's words go (v2.3 Item 3), handed to it by ref.
  const [speechSlot, setSpeechSlot] = useState<HTMLDivElement | null>(null);
  // v2.1 F-08: "End the focus block?" after the first minute.
  const [confirmEnd, setConfirmEnd] = useState(false);
  const ambience = useAmbienceState();
  useAmbienceFocusEnd(timer.phase, timer.endsAt);
  // v2.1 F-07: the first block of 15 minutes or more points at the nudges
  // toggle, once ever.
  const [coach, setCoach] = useState(false);
  const start = () => {
    endAlert.prime();
    timer.start();
    if (!settings['focus.nudgeCoachSeen'] && minutes >= 15 && settings['focus.refocusNudge'] === 'off') {
      setCoach(true);
      void update('focus.nudgeCoachSeen', true);
    }
  };
  useAmbience(timer.phase === 'running');
  useWakeLock(timer.phase === 'running' && settings['focus.keepAwake']);
  const celebrate = useCelebrate();

  // v2.1 F-03: a delete in another tab can say "this will also end the focus
  // timer" while a block is going, and once the task is gone the block ends
  // quietly, with no "how did it go?" about a task that isn't there.
  const active = timer.phase === 'running' || timer.phase === 'paused';
  const stopTimer = timer.stop;
  useEffect(() => {
    if (!active) return;
    markFocusRunning(taskId);
    return () => clearFocusRunning(taskId);
  }, [active, taskId]);
  useEffect(() => {
    if (task === null && active) stopTimer();
  }, [task, active, stopTimer]);

  if (task === undefined) return null;
  if (task === null) {
    return (
      <div className="flex flex-col gap-4 p-5">
        <p>{focusCopy.taskMissing}</p>
        <Button onClick={() => router.push('/tasks')}>{focusCopy.backToTasks}</Button>
      </div>
    );
  }

  // The nudge counts go with the block for patterns later (v2.1 F-07).
  const nudgeCounts = () => (settings['focus.refocusNudge'] === 'off' ? {} : nudges.counts);

  // "I'm done early": stop, then "How did it go?" (v1).
  const doneEarly = () => {
    timer.stop();
    setAsking(true);
  };

  // "End" (v2.1 F-08): ask first after a minute; keep the time so far, and
  // no outcome question. A block under a minute just ends.
  const elapsed = minutes * MINUTE - timer.remaining;
  const end = () => {
    if (timer.phase === 'ready' || timer.phase === 'finished') return router.push('/tasks');
    if (elapsed > MINUTE) return setConfirmEnd(true);
    timer.stop();
    router.push('/tasks');
  };
  const endNow = async () => {
    setConfirmEnd(false);
    timer.stop();
    await saveFocusBlock({ taskId, ts: timer.startedAt ?? now(), minutes, completed: false, endedBy: 'end', ...nudgeCounts() });
    router.push('/tasks');
  };

  const answer = async (outcome: Outcome) => {
    await saveFocusBlock({ taskId, ts: timer.startedAt ?? now(), minutes, completed: timer.completed, outcome, ...nudgeCounts() });
    emitCompanion({ type: 'focusEnded', outcome });
    if (outcome === 'didnt_start') return;
    // Getting going on a task that was stuck is the big one (v2 spec 10.2);
    // the first focus block ever gets a pearl; otherwise a small win.
    const first = (await db.focusBlocks.count()) === 1;
    if (outcome === 'got_going' && task?.stuckReason) void celebrate('unstuck');
    else if (first) void celebrate('firstTime', { feature: 'focus' });
    else void celebrate('focusDone');
  };

  const smallerStep = () => {
    const reason = task.stuckReason ?? recallSuggestion(taskId)?.reason ?? 'too_big';
    router.push('/tasks');
    openUnstick({ taskId, reason, previousStep: task.firstStep });
  };

  return (
    <div className="flow-enter flex min-h-dvh flex-col gap-5 p-5">
      <header className="flex flex-wrap items-start gap-3">
        <h1 className="min-w-0 flex-1 basis-48 text-h2 font-bold break-words">{task.title}</h1>
        <FocusMenu onOpen={() => setCoach(false)} />
        <Button variant="secondary" onClick={end}>
          {focusCopy.end}
        </Button>
      </header>
      {coach && <FocusCoach onDone={() => setCoach(false)} />}
      <LeftOffNote task={task} />
      {task.firstStep && (
        <section className="card p-4">
          <h2 className="text-caption text-ink-soft">{focusCopy.firstStep}</h2>
          <p className="text-lead font-bold">{task.firstStep}</p>
        </section>
      )}

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        {timer.phase === 'ready' ? (
          <fieldset className="flex flex-col items-center gap-3">
            <legend className="mb-3 text-center font-bold">{focusCopy.chooseLength}</legend>
            <div className="flex flex-wrap justify-center gap-2">
              {LENGTHS.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={minutes === m}
                  onClick={() => setChosen(m)}
                  className={`min-h-12 min-w-16 rounded-full border px-4 ${minutes === m ? 'border-primary bg-primary font-bold text-on-primary' : 'border-line bg-surface'}`}
                >
                  {fill(focusCopy.minutesOption, { n: m })}
                </button>
              ))}
            </div>
          </fieldset>
        ) : (
          // Body doubling: the companion works on its own little task beside
          // the water while Maya works on hers (v2 spec 9). It appears when
          // the block starts, so its first line is "let's start".
          <>
          <div className="flex flex-wrap items-end justify-center gap-4">
            <div data-bubble-avoid>
              <WaterFill progress={timer.progress} remaining={timer.remaining} />
            </div>
            <CompanionHost
              placement="focus"
              size={SIZES.lg}
              base={
                endAlert.timesUp ? (latestState === 'ebb' ? 'soft' : 'proud') : timer.phase === 'finished' || !settings['focus.companionActivity'] ? 'idle' : 'focused'
              }
              listens={['focusEnded', 'nudge']}
              openingLine="focus_start"
              bubble="slot"
              slotEl={speechSlot}
              noneAlt="waves"
            />
          </div>
          {/* v2.3 Item 3: the companion's words sit here, in the layout, with
              room kept for them. Floating, they covered the timer ("Let's
              make the step tinier" over 4:52) in the team's screenshot. */}
          <div ref={setSpeechSlot} data-speech-slot="focus" className="flex min-h-14 w-full max-w-sm justify-center" />
          </>
        )}
        {endAlert.timesUp && <h2 className="text-h2 font-extrabold">{focusAlertCopy.timesUp}</h2>}
        {nudges.breakUntil && timer.phase === 'paused' && <BreakPanel until={nudges.breakUntil} onBack={nudges.backToIt} />}
        {timer.phase === 'paused' && <p className="text-ink-soft">{focusCopy.paused}</p>}
        {/* The heads-up before the end (v2.1 F-06), said once, politely. */}
        <p aria-live="polite" className="text-ink-soft">
          {endAlert.warning ?? ''}
        </p>
        <p aria-live="polite" className="sr-only">
          {timer.phase === 'finished' && timer.completed ? focusCopy.finished : ''}
        </p>
        <div className="flex w-full max-w-xs flex-col gap-2">
          {timer.phase === 'ready' && (
            <Button
              data-demo-id="focus-start"
              size="lg"
              onClick={start}
            >
              {focusCopy.start}
            </Button>
          )}
          {timer.phase === 'running' && (
            <Button size="lg" variant="secondary" onClick={timer.pause}>
              {focusCopy.pause}
            </Button>
          )}
          {timer.phase === 'paused' && (
            <Button
              size="lg"
              onClick={() => {
                endAlert.prime();
                timer.resume();
              }}
            >
              {focusCopy.resume}
            </Button>
          )}
          {/* The ambience player (v2.1 F-09); the button names the sound
              that's playing. */}
          <Button variant="secondary" onClick={() => setSoundsOpen(true)} data-demo-id="focus-sounds">
            <Headphones aria-hidden />
            {ambience.sound && !ambience.paused ? ambienceCopy.names[ambience.sound] : ambienceCopy.sounds}
          </Button>
          {(timer.phase === 'running' || timer.phase === 'paused') && (
            <Button variant="quiet" onClick={doneEarly}>
              {focusCopy.endEarly}
            </Button>
          )}
        </div>
      </div>

      {endAlert.timesUp && <EndGlow />}
      <AmbienceSheet open={soundsOpen} onOpenChange={setSoundsOpen} />
      <EndFocusDialog open={confirmEnd} onKeep={() => setConfirmEnd(false)} onEnd={() => void endNow()} />
      {nudges.card && !asking && (
        <NudgeCard
          kind={nudges.card}
          task={task}
          onYes={nudges.yes}
          onDrifted={nudges.drifted}
          onPickUp={nudges.pickUp}
          onBreak={nudges.takeBreak}
          onStop={nudges.stop}
        />
      )}
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
