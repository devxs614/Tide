'use client';

// The Bridge sheet: help for the switch from one activity to the next, in
// three small steps. It loads the switch (what she's coming from, where
// she's going, how this kind of switch has gone before) and then hands the
// steps to BridgeSteps. One Bridge per event; the draft survives a trip to
// the strategy runner and back.
import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { eventEditCopy } from '@/copy/eventEditCopy';
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
import { tasksByStatus } from '@/lib/repo/taskQueries';
import { eventsBetween, getEvent } from '@/lib/repo/eventQueries';

export function BridgeSheet() {
  const { eventId, closeBridge } = useBridgeSheet();
  return (
    <Sheet open={!!eventId} onOpenChange={(o) => !o && closeBridge()}>
      <SheetContent aria-describedby={undefined}>{eventId && <BridgeBody key={eventId} eventId={eventId} onClose={closeBridge} />}</SheetContent>
    </Sheet>
  );
}

// v2.1 F-04: the event was deleted while its Bridge was open (from another
// tab, or by Undo running out). Close, and say why.
function EventGone({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    toast(eventEditCopy.bridgeGone);
    onClose();
  }, [onClose]);
  return null;
}

function BridgeBody({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const draft = draftFor(eventId);
  const data = useLiveQuery(async (): Promise<BridgeData | null> => {
    const at = now();
    const to = await getEvent(eventId);
    if (!to) return null;
    const [events, tasks, uses] = await Promise.all([
      eventsBetween(at - DAY, at + DAY),
      tasksByStatus(['in_progress', 'stuck']),
      db.strategyUses.toArray(),
    ]);
    const { fromEvent, fromTask } = resolveFrom(at, events, tasks, to);
    const fromKind = fromEvent?.kind ?? 'task';
    const hard = hardSwitchFor(await loadPatternInput(at, 28), fromKind, to.kind);
    return { to, fromEvent, fromTask, fromKind, hard, uses, usedHere: uses.filter((u) => u.transitionId === draft.transitionId) };
  }, [eventId]);

  if (data === null) return <EventGone onClose={onClose} />;
  if (!data) return null;
  return <BridgeSteps data={data} draft={draft} onClose={onClose} />;
}
