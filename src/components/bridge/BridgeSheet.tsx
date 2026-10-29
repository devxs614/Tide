'use client';

// The Bridge sheet: help for the switch from one activity to the next, in
// three small steps. It loads the switch (what she's coming from, where
// she's going, how this kind of switch has gone before) and then hands the
// steps to BridgeSteps. One Bridge per event; the draft survives a trip to
// the strategy runner and back.
import { useLiveQuery } from 'dexie-react-hooks';
import { now } from '@/lib/clock';
import { db } from '@/lib/db';
import { resolveFrom } from '@/lib/bridge';
import { loadPatternInput } from '@/lib/patterns/data';
import { hardSwitchFor } from '@/lib/patterns/rules/hardTransition';
import { DAY } from '@/lib/time';
import { useBridgeSheet } from '@/lib/ui';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { BridgeSteps, type BridgeData } from './BridgeSteps';
import { draftFor } from './bridgeDrafts';

export function BridgeSheet() {
  const { eventId, closeBridge } = useBridgeSheet();
  return (
    <Sheet open={!!eventId} onOpenChange={(o) => !o && closeBridge()}>
      <SheetContent aria-describedby={undefined}>{eventId && <BridgeBody key={eventId} eventId={eventId} onClose={closeBridge} />}</SheetContent>
    </Sheet>
  );
}

function BridgeBody({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const draft = draftFor(eventId);
  const data = useLiveQuery(async (): Promise<BridgeData | null> => {
    const at = now();
    const to = await db.events.get(eventId);
    if (!to) return null;
    const [events, tasks, uses] = await Promise.all([
      db.events.where('start').between(at - DAY, at + DAY, true, true).toArray(),
      db.tasks.where('status').anyOf(['in_progress', 'stuck']).toArray(),
      db.strategyUses.toArray(),
    ]);
    const { fromEvent, fromTask } = resolveFrom(at, events, tasks, to);
    const fromKind = fromEvent?.kind ?? 'task';
    const hard = hardSwitchFor(await loadPatternInput(at, 28), fromKind, to.kind);
    return { to, fromEvent, fromTask, fromKind, hard, uses, usedHere: uses.filter((u) => u.transitionId === draft.transitionId) };
  }, [eventId]);

  if (!data) return null;
  return <BridgeSteps data={data} draft={draft} onClose={onClose} />;
}
