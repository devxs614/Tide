'use client';

// The three Bridge steps. 1 Close: write where you're leaving off (prefilled
// with the task title, so only the end needs typing). 2 Shift: one short
// strategy, picked by the AI among the top-ranked ones, or something else.
// 3 Start: what to bring and where to go. "Done, I'm going" saves the switch.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { byMode, copy, fill } from '@/copy/en';
import { strategyName } from '@/data/strategies';
import type { BridgeOutputT } from '@/lib/ai/schemas';
import { useAi } from '@/lib/ai/useAi';
import { now } from '@/lib/clock';
import { recentCheckIn } from '@/lib/latestState';
import { setParkingNote } from '@/lib/repo/tasks';
import { saveTransition } from '@/lib/repo/transitions';
import { detectCrisis } from '@/lib/safety/detect';
import { useSettings } from '@/lib/settings';
import { rankStrategies, type RankedStrategy } from '@/lib/strategyRank';
import { minutesUntil } from '@/lib/time';
import { useNow } from '@/lib/useNow';
import type { CalendarEvent, StrategyUse, Task } from '@/lib/types';
import { SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { TalkToAPersonButton } from '@/components/safety/TalkToAPersonButton';
import { BridgeShift } from './BridgeShift';
import { BridgeClose } from './BridgeClose';
import { BridgePrep } from './BridgePrep';
import { hardLine } from './BridgeCard';
import { updateDraft, type BridgeDraft } from './bridgeDrafts';

export interface BridgeData {
  to: CalendarEvent;
  fromEvent?: CalendarEvent;
  fromTask?: Task;
  fromKind: string;
  hard: { k: number; n: number } | null;
  uses: StrategyUse[];
  usedHere: StrategyUse[];
}

export function BridgeSteps({ data, draft, onClose }: { data: BridgeData; draft: BridgeDraft; onClose: () => void }) {
  const router = useRouter();
  const { settings } = useSettings();
  const { run } = useAi('bridge');
  const nowTs = useNow(30_000);
  const prefix = data.fromTask ? `${data.fromTask.title}: ` : '';
  const [note, setNote] = useState(draft.note ?? prefix);
  const [plan, setPlan] = useState<{ ai: BridgeOutputT; candidates: RankedStrategy[] } | null>(null);
  const from = data.fromEvent?.title ?? data.fromTask?.title ?? copy.bridge.whatYouAreDoing;
  const line = hardLine({ ...data, minutesUntil: 0 });

  // One suggestion per opening. The state updates happen after the awaits,
  // inside this async function, which the effect rule can't see.
  useEffect(() => {
    void (async () => {
      const at = now();
      const latest = await recentCheckIn(at);
      const ranked = rankStrategies({ quadrant: latest?.quadrant, uses: data.uses, context: 'bridge', now: at }).filter((r) => !r.suppressed);
      const candidates = ranked.slice(0, 3);
      const result = await run({
        mode: settings.communicationMode,
        minutesUntil: minutesUntil(data.to.start, at),
        from: { label: from.slice(0, 80), taskTitle: data.fromTask?.title.slice(0, 120) },
        to: { title: data.to.title.slice(0, 80), kind: data.to.kind, place: data.to.place?.slice(0, 60), prep: data.to.prep?.slice(0, 5) },
        state: latest ? { quadrant: latest.quadrant, energy: latest.energy, pleasantness: latest.pleasantness } : undefined,
        hardBefore: data.hard ?? undefined,
        candidateStrategies: candidates.map((c) => ({ id: c.strategy.id, name: c.strategy.name, durationSec: c.strategy.durationSec, better: c.better, n: c.n })),
      });
      setPlan({ ai: result.data, candidates: ranked.slice(0, 4) });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const meaningful = note.trim().length > 0 && note.trim() !== prefix.trim();

  // Saves the note to the task, after the safety check. Returns false if the
  // check fired (and opens the support screen instead).
  const keepNote = async (announce: boolean) => {
    updateDraft(draft.eventId, { note });
    if (!meaningful) return true;
    if (detectCrisis(note)) {
      onClose();
      router.push('/support?crisis=1');
      return false;
    }
    if (data.fromTask) await setParkingNote(data.fromTask.id, note);
    if (announce) toast(copy.bridge.parkingSaved);
    return true;
  };

  const startStrategy = async (id: string) => {
    if (!(await keepNote(false))) return;
    onClose();
    router.push(`/toolkit/${id}?context=bridge&ref=${draft.transitionId}`);
  };

  const leave = async () => {
    if (!(await keepNote(false))) return;
    const latestUse = [...data.usedHere].sort((a, b) => b.ts - a.ts)[0];
    await saveTransition({
      id: draft.transitionId,
      fromEventId: data.fromEvent?.id,
      fromTaskId: data.fromTask?.id,
      toEventId: data.to.id,
      parkingNote: meaningful ? note.trim() : undefined,
      strategyUseId: latestUse?.id,
    });
    onClose();
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pt-5 pb-4">
        <div className="flex flex-col gap-1 pr-24">
          <SheetTitle>{fill(copy.bridge.sheetTitle, { from, to: data.to.title })}</SheetTitle>
          <p className="font-bold text-primary">{fill(copy.bridge.countdown, { m: minutesUntil(data.to.start, nowTs), to: data.to.title })}</p>
        </div>
        {line && (
          <p className="rounded-card bg-surface-2 p-3">
            {line} {settings.communicationMode === 'gentle' && copy.bridge.patternGentle}
          </p>
        )}
        <p aria-live="polite" className="text-ink-soft">
          {plan ? '' : copy.bridge.loading}
        </p>
        <BridgeClose
          prompt={plan?.ai.parkingPrompt ?? byMode(copy.bridge.parkingFallback, settings.communicationMode)}
          note={note}
          onNote={setNote}
          onSave={() => void keepNote(true)}
        />
        <BridgeShift
          plan={plan}
          // Doing box breathing twice in one Bridge still reads as one line.
          doneNames={[...new Set(data.usedHere.map((u) => strategyName(u.strategyId)))]}
          onStart={(id) => void startStrategy(id)}
        />
        <BridgePrep steps={plan?.ai.prepSteps ?? []} draft={draft} />
      </div>
      <div className="flex flex-col gap-2 border-t border-line p-5">
        <Button size="block" onClick={() => void leave()}>
          {copy.bridge.doneGoing}
        </Button>
        <TalkToAPersonButton />
      </div>
    </>
  );
}
