// Editing and deleting events (v2.1 F-04): one event, or a weekly series as
// "only this", "this and future" or "all"; a weekday change starts a new
// series; events changed on their own stay out of series edits; and a
// deleted event never reaches the Bridge. The seed's grouping into series
// is checked in src/lib/__tests__/dbUpgradeV3.test.ts.
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/lib/db';
import { demoClockAt, setDemoClock } from '@/lib/clock';
import { getUpcomingTransition } from '@/lib/bridge';
import { withSeries } from '@/lib/events/series';
import { toISODate } from '@/lib/time';
import { resetApp } from '@/test/utils';
import type { CalendarEvent } from '@/lib/types';
import { addEvent } from './events';
import { eventsBetween, getEvent, seriesEvents } from './eventQueries';
import { deleteEvents, editEvent, hhmm, purgeDeletedEvents, undoDeleteEvents, type EventEdit } from './eventEdits';

// Calculus on Tue and Thu at 4:50 pm for three weeks of November 2026;
// "now" is Thursday Nov 5 at noon, so Nov 3 is in the past.
const NOW = new Date(2026, 10, 5, 12, 0).getTime();
const DAYS = [3, 5, 10, 12, 17, 19];
const at = (day: number, h: number, m: number) => new Date(2026, 10, day, h, m).getTime();

async function seedCalculus(): Promise<CalendarEvent[]> {
  const raw = DAYS.map((d, i): CalendarEvent => ({ id: `calc-${i}`, title: 'Calculus', kind: 'class', start: at(d, 16, 50), end: at(d, 18, 20), place: 'Room 4-203' }));
  const { events, series } = withSeries(raw);
  await db.events.bulkAdd(events);
  await db.eventSeries.bulkAdd(series);
  return events;
}

const edit = (e: CalendarEvent, patch: Partial<EventEdit> = {}): EventEdit => ({
  title: e.title,
  kind: e.kind,
  date: toISODate(e.start),
  start: hhmm(e.start),
  end: hhmm(e.end),
  place: e.place,
  ...patch,
});

beforeEach(async () => {
  await resetApp();
  setDemoClock(demoClockAt(NOW));
});

describe('single events', () => {
  it('edits in place and deletes with undo', async () => {
    const e = await addEvent({ title: 'Study group', kind: 'social', start: at(6, 15, 0), end: at(6, 16, 0) });
    await editEvent(e.id, { ...edit(e), date: '2026-11-07', start: '10:00', end: '11:30', title: ' Study group (library) ' }, 'one');
    expect(await getEvent(e.id)).toMatchObject({ title: 'Study group (library)', start: at(7, 10, 0), end: at(7, 11, 30) });
    expect((await getEvent(e.id))?.detached).toBeUndefined();

    const ids = await deleteEvents(e.id, 'one');
    expect(ids).toEqual([e.id]);
    expect(await getEvent(e.id)).toBeUndefined();
    expect(await eventsBetween(at(7, 0, 0), at(7, 23, 59))).toEqual([]);
    await undoDeleteEvents(ids);
    expect(await getEvent(e.id)).toBeDefined();
  });
});

describe('series', () => {
  it('"only this" detaches the one event, and later series edits leave it alone', async () => {
    const [, thu] = await seedCalculus();
    await editEvent(thu.id, edit(thu, { start: '17:00', end: '18:30' }), 'one');
    expect(await getEvent(thu.id)).toMatchObject({ detached: true, start: at(5, 17, 0) });
    await editEvent('calc-0', edit((await getEvent('calc-0'))!, { place: 'Room 5-101' }), 'all');
    const all = await seriesEvents(thu.seriesId!);
    expect(all.filter((e) => e.place === 'Room 5-101').map((e) => e.id)).toEqual(['calc-0', 'calc-2', 'calc-3', 'calc-4', 'calc-5']);
    expect((await getEvent(thu.id))?.place).toBe('Room 4-203');
  });

  it('"this and future" moves the time on each date from this event on', async () => {
    await seedCalculus();
    await editEvent('calc-2', edit((await getEvent('calc-2'))!, { start: '15:00', end: '16:30' }), 'future');
    const times = (await seriesEvents((await getEvent('calc-0'))!.seriesId!)).map((e) => hhmm(e.start));
    expect(times).toEqual(['16:50', '16:50', '15:00', '15:00', '15:00', '15:00']);
    expect((await getEvent('calc-4'))?.start).toBe(at(17, 15, 0));
  });

  it('"all" keeps past times unless asked, and then changes them too', async () => {
    const [past] = await seedCalculus();
    await editEvent('calc-1', edit((await getEvent('calc-1'))!, { start: '15:00', end: '16:30' }), 'all');
    expect(hhmm((await getEvent(past.id))!.start)).toBe('16:50');
    expect(hhmm((await getEvent('calc-5'))!.start)).toBe('15:00');
    await editEvent('calc-1', edit((await getEvent('calc-1'))!, { start: '14:00', end: '15:30' }), 'all', { changePast: true });
    expect(hhmm((await getEvent(past.id))!.start)).toBe('14:00');
  });

  it('a weekday change starts a new series from this date', async () => {
    const events = await seedCalculus();
    const oldSeries = events[0].seriesId!;
    await editEvent('calc-2', edit((await getEvent('calc-2'))!, { days: [1, 3] }), 'future');
    // Nov 3 and 5 stay in the old series; Nov 10 on are soft-deleted.
    expect((await seriesEvents(oldSeries)).filter((e) => !e.deletedAt).map((e) => e.id)).toEqual(['calc-0', 'calc-1']);
    expect((await db.eventSeries.get(oldSeries))?.until).toBe('2026-11-09');
    const fresh = (await db.events.toArray()).filter((e) => e.seriesId && e.seriesId !== oldSeries);
    // Mon/Wed from Tue Nov 10 until Thu Nov 19: Nov 11, 16 and 18.
    expect(fresh.map((e) => new Date(e.start).getDate()).sort((a, b) => a - b)).toEqual([11, 16, 18]);
    expect(await db.eventSeries.get(fresh[0].seriesId!)).toMatchObject({ days: [1, 3], until: '2026-11-19' });
  });

  it('deletes only this, this and future, or all (changed-on-their-own events only with all)', async () => {
    const events = await seedCalculus();
    const sid = events[0].seriesId!;
    await editEvent('calc-4', edit((await getEvent('calc-4'))!, { place: 'Online' }), 'one');
    expect(await deleteEvents('calc-1', 'one')).toEqual(['calc-1']);
    expect((await deleteEvents('calc-2', 'future')).sort()).toEqual(['calc-2', 'calc-3', 'calc-5']);
    expect((await seriesEvents(sid)).filter((e) => !e.deletedAt).map((e) => e.id)).toEqual(['calc-0', 'calc-4']);
    expect((await deleteEvents('calc-0', 'all')).sort()).toEqual(['calc-0', 'calc-4']);
    const batch = ['calc-2', 'calc-3', 'calc-5'];
    await undoDeleteEvents(batch);
    expect((await seriesEvents(sid)).filter((e) => !e.deletedAt).map((e) => e.id)).toEqual(batch);
  });

  it('a deleted event never reaches the Bridge', async () => {
    await seedCalculus();
    const beforeClass = at(5, 16, 41);
    const upcoming = async () => getUpcomingTransition(beforeClass, await eventsBetween(beforeClass - 86_400_000, beforeClass + 86_400_000), [], [], 15);
    expect((await upcoming())?.to.id).toBe('calc-1');
    const ids = await deleteEvents('calc-1', 'one');
    expect(await upcoming()).toBeNull();
    // Even a caller that passes deleted events along gets no Bridge for them.
    expect(getUpcomingTransition(beforeClass, await db.events.toArray(), [], [], 15)).toBeNull();
    await undoDeleteEvents(ids);
    expect((await upcoming())?.to.id).toBe('calc-1');
  });

  it('removes deleted events for good, keeping a stub where a past switch points', async () => {
    await seedCalculus();
    await db.transitions.add({ id: 't1', ts: at(3, 16, 40), toEventId: 'calc-0', strategyIds: [] } as never);
    await deleteEvents('calc-0', 'all');
    expect(await purgeDeletedEvents('Deleted event')).toBe(6);
    const left = await db.events.toArray();
    expect(left).toEqual([expect.objectContaining({ id: 'calc-0', title: 'Deleted event', kind: 'class' })]);
    expect(left[0].place).toBeUndefined();
    expect(await db.eventSeries.count()).toBe(0);
    expect(await purgeDeletedEvents('Deleted event')).toBe(0);
  });
});
