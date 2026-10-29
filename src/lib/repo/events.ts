// Calendar events Maya adds by hand (classes, lab, work). They stay on the
// device; calendar import is on the roadmap, not in the MVP.
import { db } from '../db';
import type { CalendarEvent } from '../types';

export type NewEvent = Omit<CalendarEvent, 'id'>;

export async function addEvent(input: NewEvent): Promise<CalendarEvent> {
  const event: CalendarEvent = {
    ...input,
    id: crypto.randomUUID(),
    title: input.title.trim(),
    place: input.place?.trim() || undefined,
    prep: input.prep?.map((p) => p.trim()).filter(Boolean).slice(0, 3),
  };
  if (event.prep && event.prep.length === 0) delete event.prep;
  await db.events.add(event);
  return event;
}

export async function getEvent(id: string): Promise<CalendarEvent | undefined> {
  return db.events.get(id);
}

export async function eventsBetween(from: number, to: number): Promise<CalendarEvent[]> {
  return db.events.where('start').between(from, to, true, true).sortBy('start');
}
