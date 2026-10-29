// Tide's local database. Everything Maya records lives here, in IndexedDB on
// her own device; there is no server copy. Components read with useLiveQuery
// and write only through lib/repo/*, so every write has one place to test.
// Schema changes after launch need a new version() with an upgrade function.
import Dexie, { type Table } from 'dexie';
import type {
  CalendarEvent,
  CheckIn,
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

  constructor() {
    super('tide');
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
  ];
}
