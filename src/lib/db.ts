// Tide's local database. Everything Maya records lives here, in IndexedDB on
// her own device; there is no server copy. Components read with useLiveQuery
// and write only through lib/repo/*, so every write has one place to test.
// Schema changes after launch need a new version() with an upgrade function.
import Dexie, { type Table } from 'dexie';
import type {
  Bottle,
  CalendarEvent,
  CheckIn,
  DayWrap,
  DayPlan,
  DismissedPattern,
  EventSeries,
  FocusBlock,
  Reward,
  StrategyUse,
  Task,
  Transition,
  Win,
} from './types';
import { currentWorkspace } from './workspace';
import { groupEventsIntoSeries } from './events/series';

export interface SettingRow {
  key: string;
  value: unknown;
}

export class TideDB extends Dexie {
  checkins!: Table<CheckIn, string>;
  tasks!: Table<Task, string>;
  events!: Table<CalendarEvent, string>;
  focusBlocks!: Table<FocusBlock, string>;
  strategyUses!: Table<StrategyUse, string>;
  transitions!: Table<Transition, string>;
  wins!: Table<Win, string>;
  rewards!: Table<Reward, string>;
  dismissedPatterns!: Table<DismissedPattern, string>;
  dayPlans!: Table<DayPlan, string>;
  settings!: Table<SettingRow, string>;
  dayWraps!: Table<DayWrap, string>;
  bottles!: Table<Bottle, string>;
  eventSeries!: Table<EventSeries, string>;

  // The name lets the demo workspace (and tests) open a separate database
  // with the same shape; the app's own data is always 'tide'.
  constructor(name = 'tide') {
    super(name);
    this.version(1).stores({
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
    });
    // v2 (spec 18.2): wrap-ups and bottles, an index on win kinds, and the
    // new task fields. Only the tables that change are restated, each with
    // its full v1 index list plus the new ones. Existing wins get a kind
    // inferred from what v1 stored, so they appear on the Shore.
    this.version(2)
      .stores({
        dayWraps: 'date, completedAt',
        bottles: 'id, ts, openedAt',
        wins: 'id, ts, kind',
        tasks: 'id, status, type, due, order, someday, snoozedUntil, anchorDate',
      })
      .upgrade(async (tx) => {
        const tasks = new Map((await tx.table<Task, string>('tasks').toArray()).map((t) => [t.id, t]));
        await tx
          .table<Win, string>('wins')
          .toCollection()
          .modify((w) => {
            if (w.kind) return;
            if (w.source === 'task' && w.text.startsWith('Got unstuck')) w.kind = 'unstuck';
            else if (w.source === 'task') w.kind = 'task_done';
            else if (w.source === 'transition') w.kind = 'transition';
            else if (w.source === 'strategy') w.kind = 'strategy_better';
            else w.kind = 'manual';
            const task = w.source === 'task' && w.refId ? tasks.get(w.refId) : undefined;
            if (task) w.meta = { taskType: task.type, energyCost: task.energyCost };
          });
      });
    // v2.1 (spec 21.1): deleted and cleared tasks, weekly event series.
    // Additive only: the two changed tables restate their full v2 index
    // lists plus the new ones. Existing weekly events are grouped into
    // series, so "delete all Physics events" works on data from before v2.1.
    this.version(3)
      .stores({
        tasks: 'id, status, type, due, order, someday, snoozedUntil, anchorDate, deletedAt, clearedAt',
        events: 'id, start, kind, seriesId, deletedAt',
        eventSeries: 'id, title',
      })
      .upgrade(async (tx) => {
        const events = await tx.table<CalendarEvent, string>('events').toArray();
        const { series, assignments } = groupEventsIntoSeries(events);
        await tx.table<EventSeries, string>('eventSeries').bulkPut(series);
        await tx
          .table<CalendarEvent, string>('events')
          .toCollection()
          .modify((e) => {
            const id = assignments.get(e.id);
            if (id) e.seriesId = id;
          });
      });
  }
}

// The demo workspace has its own database with the same shape (v2 spec
// 16.3); which one opens is decided once, at load.
export function databaseName(workspace = currentWorkspace()): string {
  return workspace === 'demo' ? 'tide-demo' : 'tide';
}

// Tests run on a database of their own name, neither the main one nor the
// demo one, so the demo seed's guard (never the main database) can be
// tested against a real main-named database without touching the others.
export const TEST_DATABASE = 'tide-test';

export const db = new TideDB(process.env.NODE_ENV === 'test' ? TEST_DATABASE : databaseName());

// Which database this page actually opened. The workspace flag lives in
// localStorage, which every tab shares, so another tab entering the demo
// flips it while this tab still has the main database open. Anything that
// replaces data asks these, never the flag (demo fix pack, D-1).
export function isMainDatabase(database: Dexie = db): boolean {
  return database.name === databaseName('main');
}

export function isDemoDatabase(database: Dexie = db): boolean {
  return database.name === databaseName('demo');
}

// Every table except settings. Seeding demo data and "Delete everything"
// both walk this list, so a new table only has to be added in one place.
export function dataTables() {
  return [
    db.checkins,
    db.tasks,
    db.events,
    db.focusBlocks,
    db.strategyUses,
    db.transitions,
    db.wins,
    db.rewards,
    db.dismissedPatterns,
    db.dayPlans,
    // v2: wrap-ups and notes to self are Maya's data too, so they go in
    // her export and "Delete everything" removes them.
    db.dayWraps,
    db.bottles,
    // v2.1: weekly event series.
    db.eventSeries,
  ];
}
