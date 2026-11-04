// Everything the demo workspace holds after a seed, built in memory before
// anything is written (demo fix pack, D-1). It's the same data the seed
// wrote before: v1's three weeks for Maya, the weekly classes grouped into
// series, the twelve closed days, the bottle, and the persona's settings.
// Only how it reaches the database changed, so building it here, pure and
// complete, lets the seed write it in one transaction and lets a test check
// the rows (unique keys, planted patterns) without a database.
import { DEMO_START, demoClockAt } from '@/lib/clock';
import { withSeries } from '@/lib/events/series';
import type { Settings } from '@/lib/types';
import { buildDemoData } from './seed';
import { DEMO_BOTTLE, DEMO_SETTINGS_V2, demoDayWraps } from './seedV2';

// Which field is each table's primary key. Most are ids; a few are natural
// keys (a date, a setting's name), and those are the ones that collided
// when two seeds overlapped: every closed day has the same date both times.
export const SEED_KEYS = {
  checkins: 'id',
  tasks: 'id',
  events: 'id',
  eventSeries: 'id',
  focusBlocks: 'id',
  strategyUses: 'id',
  transitions: 'id',
  wins: 'id',
  rewards: 'id',
  dayWraps: 'date',
  bottles: 'id',
} as const;

export type SeedTable = keyof typeof SEED_KEYS;

export interface WorkspaceSeed {
  tables: Record<SeedTable, Array<Record<string, unknown>>>;
  settings: Array<{ key: string; value: unknown }>;
}

// The persona's v1 preferences, shared with v1's demo mode (loadDemoData),
// so both paths always agree on who Maya is.
export function demoPersonaSettings(clockBase: number = DEMO_START): Partial<Settings> {
  return {
    demoMode: true,
    demoClock: demoClockAt(clockBase),
    onboarded: true,
    name: 'Maya',
    communicationMode: 'gentle',
    // Clearly fake number; the persona is fictional.
    trustedContacts: [{ id: 'demo-contact-sofi', name: 'Sofi (roommate)', method: 'phone', value: '+52 81 0000 0000' }],
    campusSupport: { name: 'Student Wellbeing Center' },
    dayModeBannerDismissedFor: null,
  };
}

// Two rows with the same key would make the whole seed fail (or, with
// bulkPut, quietly keep only the last one). The generator has never done
// that; this says so loudly in development and tests if it ever does.
export function assertUniqueKeys(table: string, rows: Array<Record<string, unknown>>, key: string): void {
  const seen = new Set<unknown>();
  for (const row of rows) {
    if (seen.has(row[key])) throw new Error(`Demo seed: two ${table} rows share the ${key} "${String(row[key])}".`);
    seen.add(row[key]);
  }
}

export function buildWorkspaceSeed(clockBase: number = DEMO_START): WorkspaceSeed {
  const data = buildDemoData();
  const grouped = withSeries(data.events);
  const tables: WorkspaceSeed['tables'] = {
    checkins: data.checkins,
    tasks: data.tasks,
    events: grouped.events,
    eventSeries: grouped.series,
    focusBlocks: data.focusBlocks,
    strategyUses: data.strategyUses,
    transitions: data.transitions,
    wins: data.wins,
    rewards: data.rewards,
    // The wraps used to be built from the strategy uses read back from the
    // database; the same uses are right here.
    dayWraps: demoDayWraps(data.strategyUses),
    bottles: [DEMO_BOTTLE],
  } as unknown as WorkspaceSeed['tables'];
  const settings = Object.entries({ ...demoPersonaSettings(clockBase), ...DEMO_SETTINGS_V2 }).map(([key, value]) => ({ key, value }));
  if (process.env.NODE_ENV !== 'production') {
    for (const [table, key] of Object.entries(SEED_KEYS)) assertUniqueKeys(table, tables[table as SeedTable], key);
    assertUniqueKeys('settings', settings, 'key');
  }
  return { tables, settings };
}
