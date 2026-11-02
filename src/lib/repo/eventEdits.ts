// Editing and deleting calendar events (v2.1 F-04), one at a time or across
// a weekly series: "only this event", "this and future events", or "all".
// Deletes are soft, so one Undo can restore a whole batch. A changed
// weekday set starts a new series from that date, because the old one
// still describes the weeks before it.
import { db } from '../db';
import { now } from '../clock';
import { addDays, fromISODate, toISODate } from '../time';
import type { CalendarEvent, EventKind, EventSeries } from '../types';
import { seriesEvents } from './eventQueries';
import { weeklyDates } from '../calendar/repeat';

export type SeriesScope = 'one' | 'future' | 'all';

export interface EventEdit {
  title: string;
  kind: EventKind;
  date: string; // 'YYYY-MM-DD'; only "only this event" moves the date
  start: string; // 'HH:MM'
  end: string;
  place?: string;
  prep?: string[];
  days?: number[]; // the weekdays a series repeats on (0 = Sunday)
}

export type EventProblem = 'nameNeeded' | 'endBeforeStart' | 'crossesMidnight';

// "HH:MM" strings compare correctly as text. An end earlier than the start
// would mean an overnight event, which Tide can't hold yet (logged in
// DECISIONS), so it gets its own message.
export function eventProblem(edit: Pick<EventEdit, 'title' | 'start' | 'end'>): EventProblem | null {
  const title = edit.title.trim();
  if (!title || title.length > 80) return 'nameNeeded';
  if (edit.end === edit.start) return 'endBeforeStart';
  if (edit.end < edit.start) return 'crossesMidnight';
  return null;
}

export const hhmm = (ts: number) => {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// A local time on a calendar day, built from parts so it's right on both
// sides of a daylight-saving change.
export function atTime(date: string, time: string): number {
  const d = new Date(fromISODate(date));
  const [h, m] = time.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

function shared(edit: EventEdit) {
  const prep = edit.prep?.map((p) => p.trim()).filter(Boolean).slice(0, 5);
  return { title: edit.title.trim(), kind: edit.kind, place: edit.place?.trim() || undefined, prep: prep?.length ? prep : undefined };
}

const sameDays = (a: number[], b: number[]) => a.length === b.length && [...a].sort().every((d, i) => d === [...b].sort()[i]);

export async function editEvent(id: string, edit: EventEdit, scope: SeriesScope, opts: { changePast?: boolean } = {}): Promise<void> {
  const event = await db.events.get(id);
  if (!event) return;
  const at = now();
  const fields = shared(edit);

  if (scope === 'one' || !event.seriesId) {
    await db.events.update(id, {
      ...fields,
      start: atTime(edit.date, edit.start),
      end: atTime(edit.date, edit.end),
      detached: event.seriesId ? true : undefined,
      updatedAt: at,
    });
    return;
  }

  const series = await db.eventSeries.get(event.seriesId);
  if (scope === 'future' && series && edit.days && !sameDays(edit.days, series.days)) {
    await restartSeries(event, series, edit);
    return;
  }

  // The event being edited always changes; its siblings only when they
  // weren't changed on their own ("detached") and fall in the scope.
  const siblings = (await seriesEvents(event.seriesId)).filter(
    (e) => e.id === id || (!e.deletedAt && !e.detached && (scope === 'all' || e.start >= event.start)),
  );
  const timeChanged = edit.start !== hhmm(event.start) || edit.end !== hhmm(event.end);
  await db.transaction('rw', db.events, db.eventSeries, async () => {
    for (const e of siblings) {
      // Past switches point at past events, so "all" leaves their times
      // alone unless Maya said to change them too.
      const moveTime = timeChanged && (scope === 'future' || opts.changePast || e.start >= at);
      const day = toISODate(e.start);
      await db.events.update(e.id, { ...fields, ...(moveTime ? { start: atTime(day, edit.start), end: atTime(day, edit.end) } : {}), updatedAt: at });
    }
    if (series) await db.eventSeries.update(series.id, { ...fields, startHHMM: edit.start, endHHMM: edit.end });
  });
}

// New weekdays from this event's day on: the old series' future instances
// are soft-deleted and a new series is written out until the old end date.
async function restartSeries(event: CalendarEvent, series: EventSeries, edit: EventEdit): Promise<void> {
  const at = now();
  const fields = shared(edit);
  const from = toISODate(event.start);
  const old = (await seriesEvents(series.id)).filter((e) => !e.deletedAt && !e.detached && toISODate(e.start) >= from);
  const days = [...edit.days!].sort((a, b) => a - b);
  const next: EventSeries = { id: `s-${crypto.randomUUID().slice(0, 8)}`, ...fields, days, startHHMM: edit.start, endHHMM: edit.end, until: series.until };
  const instances: CalendarEvent[] = [];
  for (let day = fromISODate(from); toISODate(day) <= series.until; day = addDays(day, 1)) {
    if (!days.includes(new Date(day).getDay())) continue;
    const date = toISODate(day);
    instances.push({ id: crypto.randomUUID(), ...fields, start: atTime(date, edit.start), end: atTime(date, edit.end), seriesId: next.id, updatedAt: at });
  }
  await db.transaction('rw', db.events, db.eventSeries, async () => {
    for (const e of old) await db.events.update(e.id, { deletedAt: at, updatedAt: at });
    await db.events.bulkAdd(instances);
    await db.eventSeries.add(next);
    await db.eventSeries.update(series.id, { until: toISODate(addDays(fromISODate(from), -1)) });
  });
}

// A new weekly event (v2.1 F-10): the series row and one real event per
// matching day, in one transaction, so every v1/v2 reader (the Bridge, the
// Tide Line, the wrap-up's "Tomorrow") sees ordinary events.
export async function addWeeklyEvent(edit: EventEdit & { days: number[]; until: string }): Promise<string> {
  const fields = shared(edit);
  const dates = weeklyDates(edit.date, edit.days, edit.until);
  const series: EventSeries = {
    id: `s-${crypto.randomUUID().slice(0, 8)}`,
    ...fields,
    days: [...edit.days].sort((a, b) => a - b),
    startHHMM: edit.start,
    endHHMM: edit.end,
    until: dates.at(-1) ?? edit.until,
  };
  const at = now();
  const events: CalendarEvent[] = dates.map((date) => ({
    id: crypto.randomUUID(),
    ...fields,
    start: atTime(date, edit.start),
    end: atTime(date, edit.end),
    seriesId: series.id,
    updatedAt: at,
  }));
  await db.transaction('rw', db.events, db.eventSeries, async () => {
    await db.eventSeries.add(series);
    await db.events.bulkAdd(events);
  });
  return series.id;
}

// Soft-deletes the events in scope and returns their ids, for one Undo.
// "All" includes instances that were changed on their own.
export async function deleteEvents(id: string, scope: SeriesScope): Promise<string[]> {
  const event = await db.events.get(id);
  if (!event) return [];
  let ids = [id];
  if (event.seriesId && scope !== 'one') {
    const live = (await seriesEvents(event.seriesId)).filter((e) => !e.deletedAt);
    ids = live.filter((e) => e.id === id || scope === 'all' || (!e.detached && e.start >= event.start)).map((e) => e.id);
  }
  const at = now();
  await db.transaction('rw', db.events, async () => {
    for (const e of ids) await db.events.update(e, { deletedAt: at, updatedAt: at });
  });
  return ids;
}

export async function undoDeleteEvents(ids: string[]): Promise<void> {
  await db.transaction('rw', db.events, async () => {
    for (const id of ids) await db.events.update(id, { deletedAt: undefined });
  });
}

// Settings → Privacy & data → "Permanently remove deleted events". A
// deleted event that a past switch points at stays as a stub (its kind
// kept, its title replaced, place and prep gone) so the switch's record
// and the patterns that count it still make sense.
export async function purgeDeletedEvents(stubTitle: string): Promise<number> {
  const deleted = await db.events.filter((e) => !!e.deletedAt && e.title !== stubTitle).toArray();
  const referenced = new Set((await db.transitions.toArray()).flatMap((t) => [t.toEventId, t.fromEventId ?? '']));
  await db.transaction('rw', db.events, db.eventSeries, async () => {
    for (const e of deleted) {
      if (referenced.has(e.id)) await db.events.update(e.id, { title: stubTitle, place: undefined, prep: undefined, seriesId: undefined });
      else await db.events.delete(e.id);
    }
    const inUse = new Set((await db.events.toArray()).map((e) => e.seriesId));
    const empty = (await db.eventSeries.toArray()).filter((s) => !inUse.has(s.id)).map((s) => s.id);
    await db.eventSeries.bulkDelete(empty);
  });
  return deleted.length;
}
