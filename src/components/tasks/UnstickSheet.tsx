'use client';

// The "Unstick" sheet: what Maya sees after she moves a task to Stuck. It
// asks why the task feels hard, then offers one small first step that fits
// how she feels right now. If the AI is slow or off, the built-in step table
// in lib/ai/fallbacks.ts answers instead, so this never blocks.
// Each opening mounts a fresh UnstickBody (keyed by the request), so a new
// task never shows the previous task's step.
import { useCallback, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/navigation';
import { copy } from '@/copy/en';
import { useAi } from '@/lib/ai/useAi';
import { now } from '@/lib/clock';
import { db } from '@/lib/db';
import { recentCheckIn } from '@/lib/latestState';
import { loadPatternInput } from '@/lib/patterns/data';
import { helpfulStrategiesFor } from '@/lib/patterns/rules/strategyBeforeTask';
import { moveTask, setFirstStep, setStuckReason } from '@/lib/repo/tasks';
import { useSettings } from '@/lib/settings';
import { useUnstickSheet, type UnstickRequest } from '@/lib/ui';
import type { StuckReason, Task } from '@/lib/types';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { UnstickReasons } from './UnstickReasons';
import { UnstickStep } from './UnstickStep';
import { recallSuggestion, rememberSuggestion, type UnstickSuggestion } from './unstickCache';

export function UnstickSheet() {
  const { request, closeUnstick } = useUnstickSheet();
  const task = useLiveQuery(() => (request ? db.tasks.get(request.taskId) : undefined), [request?.taskId]);
  const key = request
    ? `${request.taskId}:${request.reason ?? ''}:${request.previousStep ?? ''}:${request.resume ? 'resume' : ''}`
    : 'closed';

  return (
    <Sheet open={!!request} onOpenChange={(open) => !open && closeUnstick()}>
      <SheetContent aria-describedby={undefined}>
        {request && task && <UnstickBody key={key} request={request} task={task} onClose={closeUnstick} />}
      </SheetContent>
    </Sheet>
  );
}

function UnstickBody({ request, task, onClose }: { request: UnstickRequest; task: Task; onClose: () => void }) {
  const router = useRouter();
  const { settings } = useSettings();
  const { run } = useAi('unstick');
  const resumed = request.resume ? recallSuggestion(task.id) : undefined;
  const [suggestion, setSuggestion] = useState<UnstickSuggestion | null>(resumed ?? null);
  // Loading from the start when the reason is already known, so the first
  // paint shows "Finding a small first step…" instead of the reason list.
  const [loading, setLoading] = useState(!resumed && !!request.reason);

  const suggest = useCallback(
    async (reason: StuckReason, previousStep?: string) => {
      const at = now();
      const [latest, data] = await Promise.all([recentCheckIn(at), loadPatternInput(at, 28)]);
      const helpful = helpfulStrategiesFor(data, task.type);
      if (task.status === 'stuck') await setStuckReason(task.id, reason);
      const result = await run({
        mode: settings.communicationMode,
        task: { title: task.title.slice(0, 120), type: task.type, energyCost: task.energyCost },
        reason,
        state: latest
          ? { quadrant: latest.quadrant, energy: latest.energy, pleasantness: latest.pleasantness, emotions: latest.emotions }
          : undefined,
        parkingNote: task.parkingNote?.slice(0, 140),
        helpfulStrategies: helpful,
        previousStep: previousStep?.slice(0, 140),
      });
      setLoading(false);
      if (result.safetyTriggered) {
        onClose();
        return router.push('/support?crisis=1');
      }
      const next = { reason, output: result.data, helpful };
      rememberSuggestion(task.id, next);
      setSuggestion(next);
    },
    [run, settings.communicationMode, task, onClose, router],
  );

  // Runs once per opening (the key on this component handles new requests).
  // suggest() only sets state after awaiting the database and the AI call,
  // which is the async-callback pattern the lint rule allows; the compiler
  // can't see past the function call, hence the disable below.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!resumed && request.reason) void suggest(request.reason, request.previousStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ask = (reason: StuckReason, previousStep?: string) => {
    setLoading(true);
    void suggest(reason, previousStep);
  };

  const start = async () => {
    if (!suggestion) return;
    await setFirstStep(task.id, suggestion.output.firstStep);
    if (task.status !== 'in_progress') await moveTask(task.id, 'in_progress');
    onClose();
    router.push(`/focus/${task.id}?minutes=${suggestion.output.focusMinutes}`);
  };

  const doFirst = (strategyId: string) => {
    onClose();
    router.push(`/toolkit/${strategyId}?context=unstick&ref=${task.id}`);
  };

  return (
    <>
      {!suggestion && <UnstickReasons task={task} loading={loading} onChoose={(reason) => ask(reason)} />}
      {suggestion && (
        <UnstickStep
          task={task}
          suggestion={suggestion}
          loading={loading}
          onStart={() => void start()}
          onDifferent={() => ask(suggestion.reason, suggestion.output.firstStep)}
          onNotNow={onClose}
          onDoFirst={doFirst}
        />
      )}
      <p aria-live="polite" className="sr-only">
        {loading ? copy.unstick.loading : ''}
      </p>
    </>
  );
}
