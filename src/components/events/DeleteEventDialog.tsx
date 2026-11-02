'use client';

// "Delete this event?" (v2.1 F-04). A single event gets Delete or Keep it;
// one in a weekly series also gets "this and future" and "all". Either way
// the delete is soft and one Undo brings back the whole batch.
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { copy, fill } from '@/copy/en';
import { eventEditCopy as t } from '@/copy/eventEditCopy';
import { getEvent } from '@/lib/repo/eventQueries';
import { deleteEvents, undoDeleteEvents, type SeriesScope } from '@/lib/repo/eventEdits';
import { UNDO_MS } from '@/lib/repo/taskEdits';
import { formatLongDate } from '@/lib/time';
import { ScopeDialog, type ScopeChoice } from './ScopeDialog';

export async function deleteEventsWithUndo(id: string, scope: SeriesScope) {
  const ids = await deleteEvents(id, scope);
  toast(ids.length > 1 ? fill(t.deletedMany, { n: ids.length }) : t.deleted, {
    duration: UNDO_MS,
    action: { label: copy.global.undo, onClick: () => void undoDeleteEvents(ids) },
  });
}

export function DeleteEventDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const event = useLiveQuery(() => getEvent(id), [id]);
  if (!event) return null;
  // An event changed on its own is treated as a single event here.
  const inSeries = !!event.seriesId && !event.detached;
  const choices: ScopeChoice[] = inSeries
    ? [
        { scope: 'one', label: t.deleteOne, demoId: 'event-delete-one' },
        { scope: 'future', label: t.deleteFuture },
        { scope: 'all', label: t.deleteAll },
      ]
    : [{ scope: 'one', label: t.delete, demoId: 'event-delete-one' }];
  return (
    <ScopeDialog
      title={fill(t.deleteTitle, { title: event.title, date: formatLongDate(event.start) })}
      body={inSeries ? `${t.deleteBody} ${t.deleteSeriesBody}` : t.deleteBody}
      choices={choices}
      destructive
      cancelLabel={t.keepIt}
      onCancel={onClose}
      onPick={(scope) => {
        onClose();
        void deleteEventsWithUndo(event.id, scope);
      }}
    />
  );
}
