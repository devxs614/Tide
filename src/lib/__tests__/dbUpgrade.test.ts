// Dexie version 2 (v2 spec 18.2): a database written by v1 opens in v2 with
// every row intact, a kind inferred for each old win (with the task's type
// and energy for task wins), and the new tables ready.
import { describe, expect, it } from 'vitest';
import Dexie from 'dexie';
import { TideDB } from '@/lib/db';

const V1_SCHEMA = {
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

describe('Dexie v1 → v2', () => {
  it('keeps every row, infers win kinds and adds the new tables', async () => {
    const name = 'tide-upgrade-test';
    const v1 = new Dexie(name);
    v1.version(1).stores(V1_SCHEMA);
    await v1.open();
    await v1.table('tasks').add({ id: 't1', title: 'Essay', type: 'writing', energyCost: 3, status: 'done', createdAt: 1, order: 0 });
    await v1.table('checkins').add({ id: 'c1', ts: 1, quadrant: 'ebb', energy: -2, pleasantness: -2, emotions: [], aiUsed: false });
    await v1.table('wins').bulkAdd([
      { id: 'w1', ts: 1, text: 'Finished: Essay', source: 'task', refId: 't1' },
      { id: 'w2', ts: 2, text: 'Got unstuck: Essay', source: 'task', refId: 't1' },
      { id: 'w3', ts: 3, text: 'Got through: Lab → Calculus', source: 'transition', refId: 'x' },
      { id: 'w4', ts: 4, text: 'Felt better after: Box breathing', source: 'strategy', refId: 'y' },
      { id: 'w5', ts: 5, text: 'Called my mom', source: 'manual' },
    ]);
    v1.close();

    const v2 = new TideDB(name);
    await v2.open();
    expect(v2.verno).toBe(2);
    expect(await v2.tasks.count()).toBe(1);
    expect(await v2.checkins.count()).toBe(1);
    const wins = await v2.wins.orderBy('ts').toArray();
    expect(wins.map((w) => w.kind)).toEqual(['task_done', 'unstuck', 'transition', 'strategy_better', 'manual']);
    expect(wins[0].meta).toEqual({ taskType: 'writing', energyCost: 3 });
    expect(wins.map((w) => w.text)).toEqual(['Finished: Essay', 'Got unstuck: Essay', 'Got through: Lab → Calculus', 'Felt better after: Box breathing', 'Called my mom']);
    expect(await v2.wins.where('kind').equals('manual').count()).toBe(1);
    expect(await v2.bottles.count()).toBe(0);
    expect(await v2.dayWraps.count()).toBe(0);
    v2.close();
    await Dexie.delete(name);
  });
});
