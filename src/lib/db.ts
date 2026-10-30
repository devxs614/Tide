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
  FocusBlock,
  Reward,
  StrategyUse,
  Task,
  Transition,
  Win,
} from './types';

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
  }
}

export const db = new TideDB();

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
  ];
}
