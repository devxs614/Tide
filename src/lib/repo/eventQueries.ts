// Every read of calendar events goes through here (v2.1 F-04), so a deleted
// event never reaches the Tide Line, the Bridge, Day Mode or the wrap-up.
// The pattern engine is the exception: past switches still count by the
// event's kind, which a deleted event keeps. As with tasks, these
// are plain Dexie queries filtered afterwards, so live queries update in
// the same render as the write.
import { db } from '../db';
import type { CalendarEvent, EventSeries } from '../types';

export const isActiveEvent = (e: CalendarEvent): boolean => !e.deletedAt;

const byStart = (a: CalendarEvent, b: CalendarEvent) => a.start - b.start;

// Events starting in [from, to], inclusive at both ends, earliest first.
export function eventsBetween(from: number, to: number): Promise<CalendarEvent[]> {
  return db.events
    .where('start')
    .between(from, to, true, true)
    .toArray()
    .then((list) => list.filter(isActiveEvent).sort(byStart));
}

export function getEvent(id: string, opts: { includeDeleted?: boolean } = {}): Promise<CalendarEvent | undefined> {
  return db.events.get(id).then((e) => (e && (opts.includeDeleted || isActiveEvent(e)) ? e : undefined));
}

export function getSeries(id: string | undefined): Promise<EventSeries | undefined> {
  return id ? db.eventSeries.get(id) : Promise.resolve(undefined);
}

// Every event in a series, deleted ones included (the edit and delete code
// decides what to touch), earliest first.
export function seriesEvents(seriesId: string): Promise<CalendarEvent[]> {
  return db.events.filter((e) => e.seriesId === seriesId).toArray().then((list) => list.sort(byStart));
}

export function allEventsForPatterns(): Promise<CalendarEvent[]> {
  return db.events.toArray();
}

// Titles for past switches in the wrap-up, a deleted event's included: the
// switch happened, and its record keeps the name it had.
export async function eventTitles(): Promise<Map<string, string>> {
  return new Map((await db.events.toArray()).map((e) => [e.id, e.title]));
}

// Stubs left for past switches (see purgeDeletedEvents) don't count: there's
// nothing more to remove from them.
export function countDeletedEvents(stubTitle: string): Promise<number> {
  return db.events.filter((e) => !!e.deletedAt && e.title !== stubTitle).count();
}
