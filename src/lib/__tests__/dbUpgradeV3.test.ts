// Dexie version 3 (v2.1 spec 21.1): a database written by v2 (with Maya's
// demo data) opens in v2.1 with every row intact, its weekly classes grouped
// into series, nothing the pattern engine reads changed, and the upgrade
// running only once.
import { describe, expect, it } from 'vitest';
import Dexie from 'dexie';
import { TideDB } from '@/lib/db';
import { buildDemoData } from '@/data/demo/seed';
import { groupEventsIntoSeries } from '@/lib/events/series';

const V1 = {
  checkins: 'id, ts, quadrant',
  tasks: 'id, status, type, due, order',
  events: 'id, start, kind',
  focusBlocks: 'id, ts, taskId',
  strategyUses: 'id, ts, strategyId, context',
  transitions: 'id, ts, toEventId',
  wins: 'id, ts',
  rewards: 'id',
  dismissedPatterns: 'key',
  dayPlans: 'date',
  settings: 'key',
};
const V2 = {
  dayWraps: 'date, completedAt',
  bottles: 'id, ts, openedAt',
  wins: 'id, ts, kind',
  tasks: 'id, status, type, due, order, someday, snoozedUntil, anchorDate',
};

const EXPECTED_SERIES = [
  ['Calculus', [2, 4]],
  ['Chemistry lab', [2, 4]],
  ['Groceries', [6]],
  ['Part-time job (library)', [1, 3]],
  ['Physics', [1, 3, 5]],
  ['Programming', [1, 3, 5]],
];

describe('weekly series', () => {
  it('groups the seed into one series per class, job and errand', () => {
    const { series } = groupEventsIntoSeries(buildDemoData().events);
    expect(series.map((s) => [s.title, s.days]).sort()).toEqual(EXPECTED_SERIES);
  });
});

describe('Dexie v2 → v3', () => {
  it('keeps every row, groups events into series, and runs once', async () => {
    const name = 'tide-upgrade-v3-test';
    const data = buildDemoData();
    const v2 = new Dexie(name);
    v2.version(1).stores(V1);
    v2.version(2).stores(V2);
    await v2.open();
    await v2.table('checkins').bulkAdd(data.checkins);
    await v2.table('tasks').bulkAdd(data.tasks);
    await v2.table('events').bulkAdd(data.events);
    await v2.table('focusBlocks').bulkAdd(data.focusBlocks);
    await v2.table('strategyUses').bulkAdd(data.strategyUses);
    await v2.table('transitions').bulkAdd(data.transitions);
    await v2.table('wins').bulkAdd(data.wins);
    v2.close();

    const v3 = new TideDB(name);
    await v3.open();
    expect(v3.verno).toBe(3);
    // What the pattern engine reads is exactly as it was.
    expect(await v3.checkins.toArray()).toEqual(await sorted(data.checkins));
    expect(await v3.focusBlocks.toArray()).toEqual(await sorted(data.focusBlocks));
    expect(await v3.strategyUses.toArray()).toEqual(await sorted(data.strategyUses));
    expect(await v3.transitions.toArray()).toEqual(await sorted(data.transitions));
    expect(await v3.tasks.count()).toBe(data.tasks.length);
    expect(await v3.wins.count()).toBe(data.wins.length);
    // Events only gained a series id.
    const events = await v3.events.toArray();
    const withoutSeries = events.map((e) => {
      const copy = { ...e };
      delete copy.seriesId;
      return copy;
    });
    expect(withoutSeries).toEqual(await sorted(data.events));
    expect(events.every((e) => e.seriesId)).toBe(true);
    const series = await v3.eventSeries.toArray();
    expect(series.map((s) => [s.title, s.days]).sort()).toEqual(EXPECTED_SERIES);
    v3.close();

    // Opening again doesn't upgrade again (no duplicate series).
    const again = new TideDB(name);
    await again.open();
    expect(await again.eventSeries.count()).toBe(EXPECTED_SERIES.length);
    again.close();
    await Dexie.delete(name);
  });
});

// Dexie returns rows in primary-key order.
async function sorted<T extends { id: string }>(rows: T[]): Promise<T[]> {
  return [...rows].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
