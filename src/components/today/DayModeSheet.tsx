'use client';

// "Make today lighter": Maya picks Gentle or Minimum, Tide proposes which
// tasks to keep today and which to move to tomorrow, and she can flip any
// task before using the plan. Nothing is ever deleted; moved tasks stay on
// the board with a label, and Undo restores everything for 10 seconds.
import { useState } from 'react';
import { toast } from 'sonner';
import { copy } from '@/copy/en';
import { useAi } from '@/lib/ai/useAi';
import { now } from '@/lib/clock';
import { buildDayModeInput, ENERGY_BUDGET, plannableTasks, type LighterMode } from '@/lib/daymode';
import { db } from '@/lib/db';
import { recentCheckIn } from '@/lib/latestState';
import { applyDayPlan, undoDayPlan } from '@/lib/repo/dayPlans';
import { useSettings } from '@/lib/settings';
import { addDays, endOfDay, startOfDay, toISODate } from '@/lib/time';
import { useDayModeSheet } from '@/lib/ui';
import type { Task } from '@/lib/types';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { StepHeader } from '@/components/checkin/StepHeader';
import { DayModeProposal } from './DayModeProposal';

const MODES: LighterMode[] = ['gentle', 'minimum'];

export function DayModeSheet() {
  const { open, closeDayMode } = useDayModeSheet();
  return (
    <Sheet open={open} onOpenChange={(o) => !o && closeDayMode()}>
      <SheetContent aria-describedby={undefined}>{open && <DayModeBody onClose={closeDayMode} />}</SheetContent>
    </Sheet>
  );
}

function DayModeBody({ onClose }: { onClose: () => void }) {
  const { settings } = useSettings();
  const { run } = useAi('daymode');
  const [requested, setRequested] = useState<LighterMode | null>(null);
  const [planned, setPlanned] = useState<Task[]>([]);
  const [keep, setKeep] = useState<string[]>([]);
  const [rationale, setRationale] = useState('');
  const [loading, setLoading] = useState(false);

  const choose = async (mode: LighterMode) => {
    setRequested(mode);
    setLoading(true);
    const at = now();
    const [tasks, events, latest] = await Promise.all([
      db.tasks.toArray(),
      db.events.where('start').between(startOfDay(at), endOfDay(at)).sortBy('start'),
      recentCheckIn(at),
    ]);
    const input = buildDayModeInput({ mode: settings.communicationMode, requested: mode, now: at, latest, tasks, events });
    const result = await run(input);
    setPlanned(plannableTasks(tasks));
    setKeep(result.data.keep);
    setRationale(result.data.rationale);
    setLoading(false);
  };

  const apply = async () => {
    if (!requested) return;
    const at = now();
    const keepSet = new Set(keep);
    const snapshot = await applyDayPlan({
      date: toISODate(at),
      tomorrow: toISODate(addDays(at, 1)),
      mode: requested,
      keptTaskIds: planned.filter((t) => keepSet.has(t.id)).map((t) => t.id),
      movedTaskIds: planned.filter((t) => !keepSet.has(t.id)).map((t) => t.id),
      rationale,
    });
    onClose();
    toast(copy.dayMode.applied, {
      duration: 10_000,
      action: { label: copy.global.undo, onClick: () => void undoDayPlan(snapshot) },
    });
  };

  if (requested && !loading) {
    return (
      <DayModeProposal
        tasks={planned}
        keep={keep}
        budget={ENERGY_BUDGET[requested]}
        rationale={rationale}
        onToggle={(id) => setKeep((k) => (k.includes(id) ? k.filter((x) => x !== id) : [...k, id]))}
        onApply={() => void apply()}
        onKeepAsIs={onClose}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto px-5 pt-5 pb-6">
      <StepHeader title={copy.dayMode.title} />
      {loading ? (
        <div className="flex flex-col gap-3" aria-live="polite">
          <p className="text-ink-soft">{copy.dayMode.loading}</p>
          <div aria-hidden className="h-40 animate-pulse rounded-card bg-surface-2" />
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {MODES.map((m) => (
            <li key={m}>
              <button
                type="button"
                onClick={() => void choose(m)}
                className="flex w-full flex-col gap-1 rounded-card border border-line bg-surface p-4 text-left hover:bg-surface-2"
              >
                <span className="text-lead font-bold">{copy.dayMode[m].name}</span>
                <span>{copy.dayMode[m].body}</span>
                <span className="text-ink-soft">{copy.dayMode[m].budget}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
