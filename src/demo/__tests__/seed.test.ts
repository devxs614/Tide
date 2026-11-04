// The demo workspace seed after the demo fix pack (D-1): twice in a row,
// twice at once, forced over an existing seed, a failure halfway, and the
// main database, never once a BulkError, and the same data every time. The
// generated rows are checked for unique keys before any database sees them.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db, TideDB } from '@/lib/db';
import { DEMO_START } from '@/lib/clock';
import { computePatterns } from '@/lib/patterns/engine';
import { loadPatternInput } from '@/lib/patterns/data';
import { addTask } from '@/lib/repo/tasks';
import { DEMO_SEED_MARKER, DEMO_SEED_VERSION, seedDemoWorkspace } from '@/lib/repo/demo';
import { assertUniqueKeys, buildWorkspaceSeed, SEED_KEYS } from '@/data/demo/workspaceSeed';
import { resetApp } from '@/test/utils';

// Every table's rows in key order, minus the one value that is meant to
// differ between two seeds: when the demo clock started.
async function snapshot(): Promise<string> {
  const out: Record<string, unknown> = {};
  for (const table of db.tables) {
    const rows = await table.toArray();
    const key = table.schema.primKey.keyPath as string;
    out[table.name] = rows
      .filter((r) => r[key] !== 'demoClock')
      .sort((a, b) => String(a[key]).localeCompare(String(b[key])));
  }
  return JSON.stringify(out);
}

beforeEach(async () => {
  await resetApp();
  await db.settings.clear();
});

afterEach(() => vi.restoreAllMocks());

// Dexie hands out a fresh table object each time (db.dayWraps, db.table()),
// so the spy sits on the shared prototype and looks at the table's name.
function spyOnBulkPut(table: string, fail?: Error) {
  const proto = Object.getPrototypeOf(db.dayWraps) as { bulkPut: (...args: unknown[]) => Promise<unknown> };
  const original = proto.bulkPut;
  const calls: string[] = [];
  vi.spyOn(proto, 'bulkPut').mockImplementation(function (this: { name: string }, ...args: unknown[]) {
    if (this.name === table) {
      calls.push(table);
      if (fail && calls.length === 1) return Promise.reject(fail);
    }
    return original.apply(this, args);
  });
  return calls;
}

describe('demo workspace seed', () => {
  it('a second seed in a row does nothing', async () => {
    expect(await seedDemoWorkspace()).toBe('seeded');
    const first = await snapshot();
    expect(await seedDemoWorkspace()).toBe('already');
    expect(await snapshot()).toBe(first);
    expect((await db.settings.get(DEMO_SEED_MARKER))?.value).toBe(DEMO_SEED_VERSION);
  });

  it('two seeds at once write once and match a single seed', async () => {
    await seedDemoWorkspace();
    const single = await snapshot();
    await resetApp();
    await db.settings.clear();
    const writes = spyOnBulkPut('dayWraps');
    const outcomes = await Promise.all([seedDemoWorkspace(), seedDemoWorkspace(), seedDemoWorkspace({ force: false })]);
    expect(outcomes).toEqual(['seeded', 'seeded', 'seeded']);
    expect(writes).toHaveLength(1);
    expect(await snapshot()).toBe(single);
  });

  it('a forced seed over an existing one, even several at once, equals a fresh seed', async () => {
    await seedDemoWorkspace();
    const fresh = await snapshot();
    await addTask({ title: 'Added during a tour', type: 'admin', energyCost: 1 });
    await db.dayWraps.put({ date: '2026-11-05', startedAt: 1, step: 1, helped: [], hard: [], carryover: [] });
    await Promise.all([seedDemoWorkspace({ force: true }), seedDemoWorkspace({ force: true }), seedDemoWorkspace()]);
    expect(await snapshot()).toBe(fresh);
  });

  it('a failure halfway leaves the database as it was, and the next try works', async () => {
    // Empty database: still empty, no marker.
    spyOnBulkPut('dayWraps', new Error('disk full'));
    await expect(seedDemoWorkspace({ force: true })).rejects.toThrow('disk full');
    expect(await db.checkins.count()).toBe(0);
    expect(await db.settings.get(DEMO_SEED_MARKER)).toBeUndefined();

    // Seeded database: the old data stays, tour changes and all.
    await seedDemoWorkspace();
    await addTask({ title: 'Added during a tour', type: 'admin', energyCost: 1 });
    const before = await snapshot();
    vi.restoreAllMocks();
    spyOnBulkPut('bottles', new Error('disk full'));
    await expect(seedDemoWorkspace({ force: true })).rejects.toThrow('disk full');
    expect(await snapshot()).toBe(before);

    vi.restoreAllMocks();
    await seedDemoWorkspace({ force: true });
    expect((await db.tasks.toArray()).some((t) => t.title === 'Added during a tour')).toBe(false);
  });

  it('refuses the main database and writes nothing to it', async () => {
    const main = new TideDB('tide');
    await expect(seedDemoWorkspace({ force: true, into: main })).rejects.toThrow(/never to the main database/);
    expect(await main.checkins.count()).toBe(0);
    expect(await main.settings.count()).toBe(0);
    await main.delete();
  });

  it('keeps exactly the planted patterns', async () => {
    await seedDemoWorkspace({ force: true });
    const patterns = computePatterns(await loadPatternInput(DEMO_START, 28));
    expect(patterns.map((p) => p.key).sort()).toEqual([
      'hardTransition:lab:class',
      'strategyBeforeTask:m-walk-3:writing',
      'strategyEffect:c-box',
      'wrapHelped:c-box',
    ]);
  });
});

describe('demo seed rows', () => {
  it('have unique keys in every table, before any write', () => {
    const seed = buildWorkspaceSeed();
    for (const [table, key] of Object.entries(SEED_KEYS)) {
      const rows = seed.tables[table as keyof typeof SEED_KEYS];
      expect(rows.length, table).toBeGreaterThan(0);
      expect(new Set(rows.map((r) => r[key])).size, table).toBe(rows.length);
    }
    expect(new Set(seed.settings.map((r) => r.key)).size).toBe(seed.settings.length);
    expect(() => assertUniqueKeys('dayWraps', [{ date: '2026-11-01' }, { date: '2026-11-01' }], 'date')).toThrow(/share the date/);
  });

  it('name the same keys as the database', () => {
    for (const [table, key] of Object.entries(SEED_KEYS)) expect(db.table(table).schema.primKey.keyPath, table).toBe(key);
  });
});
