// Turning demo mode on and off, moving the demo clock, and filling the demo
// workspace. v1's demo mode replaces everything on the device with Maya's
// synthetic three weeks (Settings asks first, because it deletes real
// data); v2's demo workspace has a database of its own, filled by
// seedDemoWorkspace below, which since the demo fix pack is one atomic,
// idempotent transaction that only ever writes to the demo database.
import Dexie from 'dexie';
import { db, dataTables, isMainDatabase } from '../db';
import { DEMO_START, demoClockAt } from '../clock';
import { buildDemoData } from '@/data/demo/seed';
import { buildWorkspaceSeed, demoPersonaSettings } from '@/data/demo/workspaceSeed';
import { clearData } from './data';
import { withSeries } from '../events/series';
import { setSettings } from './settings';
import { currentWorkspace } from '../workspace';

// 4:36 pm: the Bridge to Calculus (4:50 pm) is already on screen when the
// demo starts, and the lab (until 4:40 pm) is still where Maya is.
export const DEMO_BRIDGE_TIME = new Date(2026, 10, 5, 16, 36).getTime();
// 4:41 pm: Calculus starts in 9 minutes, as in the rehearsal step of 14.3.
export const DEMO_JUMP_TIME = new Date(2026, 10, 5, 16, 41).getTime();

export async function loadDemoData(clockBase: number = DEMO_START): Promise<void> {
  const data = buildDemoData();
  await db.transaction('rw', dataTables(), async () => {
    await Promise.all(dataTables().map((t) => t.clear()));
    // bulkPut, not bulkAdd: the tables were just cleared, but a put can
    // never fail on a leftover row the way an add did (demo fix pack, D-1).
    await db.checkins.bulkPut(data.checkins);
    await db.tasks.bulkPut(data.tasks);
    // Weekly classes become series here too: a demo database is created at
    // version 3, so the upgrade that groups old events never runs for it.
    const grouped = withSeries(data.events);
    await db.events.bulkPut(grouped.events);
    await db.eventSeries.bulkPut(grouped.series);
    await db.focusBlocks.bulkPut(data.focusBlocks);
    await db.strategyUses.bulkPut(data.strategyUses);
    await db.transitions.bulkPut(data.transitions);
    await db.wins.bulkPut(data.wins);
    await db.rewards.bulkPut(data.rewards);
  });
  await setSettings(demoPersonaSettings(clockBase));
}

export async function leaveDemo(): Promise<void> {
  await clearData();
  await setSettings({
    demoMode: false,
    demoClock: null,
    name: '',
    trustedContacts: [],
    campusSupport: null,
    dayModeBannerDismissedFor: null,
  });
}

// Moves the demo clock without touching the data (rehearsal only).
export async function setDemoTime(base: number): Promise<void> {
  await setSettings({ demoClock: demoClockAt(base) });
}

// The demo workspace's seed version. Bumping it makes every existing demo
// database reseed once, cleanly, the next time the demo opens.
export const DEMO_SEED_VERSION = 'v2.4-demofix';
export const DEMO_SEED_MARKER = 'demo.seedVersion';

export type SeedOutcome = 'seeded' | 'already';

// Fills the demo workspace (v2 spec 16.3; rebuilt in the demo fix pack,
// D-1). It used to clear and fill most tables in one transaction and add
// the closed days and the bottle in a second one, and it could run twice at
// once: React Strict Mode starts the tour twice in development, two tabs
// can open the demo together, and Restart can be pressed mid-seed. The
// second run cleared what the first had written and then both added the
// same dates, so `dayWraps.bulkAdd()` failed on all eleven rows.
// Now it reads the marker, clears and writes everything with bulkPut, and
// writes the marker last, all in one transaction over every table, so a
// failure rolls the whole thing back and the database is never half seeded.
// `force` reseeds even when the marker says it's current (every tour start).
async function seedOnce(force: boolean, into: Dexie): Promise<SeedOutcome> {
  if (isMainDatabase(into)) throw new Error('The demo seed only writes to the demo workspace, never to the main database.');
  const seed = buildWorkspaceSeed(DEMO_START);
  return into.transaction('rw', into.tables, async () => {
    const settings = into.table('settings');
    const marker = await settings.get(DEMO_SEED_MARKER);
    if (!force && marker?.value === DEMO_SEED_VERSION) return 'already';
    // Every table but settings, taken from the database itself, so a table
    // added later can't be forgotten again (v2 had forgotten nothing yet,
    // but the clearing list and the schema were two lists). Settings keep
    // the presenter's own choices (text size, voice, speech style), as
    // before; the seed's own keys are overwritten below.
    for (const table of into.tables) if (table.name !== 'settings') await table.clear();
    for (const [name, rows] of Object.entries(seed.tables)) await into.table(name).bulkPut(rows);
    await settings.bulkPut(seed.settings);
    await settings.put({ key: DEMO_SEED_MARKER, value: DEMO_SEED_VERSION });
    return 'seeded';
  });
}

// One seed at a time. Callers that arrive while one is running wait for it
// instead of starting another; a forced call that arrives during an
// unforced one runs right after it. Across tabs, the Web Lock does the
// same; without it, the marker inside the transaction still makes the
// second run a no-op.
let running: { force: boolean; promise: Promise<SeedOutcome> } | null = null;

function withLock(fn: () => Promise<SeedOutcome>): Promise<SeedOutcome> {
  const locks = typeof navigator === 'undefined' ? undefined : navigator.locks;
  return locks ? locks.request('tide-demo-seed', fn).then((outcome) => outcome) : fn();
}

export function seedDemoWorkspace({ force = false, into = db }: { force?: boolean; into?: Dexie } = {}): Promise<SeedOutcome> {
  if (running && (running.force || !force)) return running.promise;
  const before = running?.promise;
  const promise = (async () => {
    if (before) await before.catch(() => undefined);
    return withLock(() => seedOnce(force, into));
  })();
  const entry = { force, promise };
  running = entry;
  const done = () => {
    if (running === entry) running = null;
  };
  promise.then(done, done);
  return promise;
}

// Before every tour: back to the seed exactly, so a second run in a row
// starts from the same afternoon, with the Bridge not done yet and the
// planted patterns' numbers intact. Quietly does nothing outside the demo
// workspace, and the seed itself refuses the main database.
export async function resetDemoWorkspace(): Promise<void> {
  if (currentWorkspace() !== 'demo') return;
  await seedDemoWorkspace({ force: true });
}
