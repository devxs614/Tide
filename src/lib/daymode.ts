// Day Mode rules: when Tide suggests a lighter day, how much "energy" each
// plan keeps, which tasks count as today's, and the input the daymode route
// receives. All deterministic; the AI only proposes the split, and Maya can
// flip any task before using the plan.
import type { DayModeInputT } from './ai/schemas';
import { formatTime, toISODate } from './time';
import type { CalendarEvent, CheckIn, CommunicationMode, DayPlan, Task } from './types';

export const ENERGY_BUDGET = { gentle: 4, minimum: 2 } as const;
export type LighterMode = keyof typeof ENERGY_BUDGET;

export type BannerReason = 'ebb' | 'surge' | 'adjust';

// The three reasons from the spec, in order. A neutral or good check-in
// never triggers it; only today's latest check-in counts.
export function bannerReason(latestToday: CheckIn | null | undefined): BannerReason | null {
  if (!latestToday) return null;
  if (latestToday.quadrant === 'ebb') return 'ebb';
  if (latestToday.quadrant === 'surge' && latestToday.energy >= 3 && latestToday.pleasantness <= -3) return 'surge';
  if (latestToday.need === 'adjust') return 'adjust';
  return null;
}

export function shouldShowBanner(opts: {
  latestToday: CheckIn | null | undefined;
  plan: DayPlan | undefined;
  dismissedFor: string | null;
}): BannerReason | null {
  const reason = bannerReason(opts.latestToday);
  if (!reason || !opts.latestToday) return null;
  if (opts.plan && opts.plan.mode !== 'full') return null;
  if (opts.dismissedFor === opts.latestToday.id) return null;
  return reason;
}

// Today's tasks: due today, kept in today's plan, carried over to today, or
// already in progress. Anything moved off today and anything done is not.
export function todaysTasks(tasks: Task[], plan: DayPlan | undefined, today: string): Task[] {
  const kept = new Set(plan?.keptTaskIds ?? []);
  return tasks
    .filter((t) => t.status !== 'done' && t.movedFrom !== today)
    // v2: tasks let go to Someday, or snoozed past today, wait elsewhere.
    .filter((t) => !t.someday && !(t.snoozedUntil && t.snoozedUntil > today))
    .filter((t) => t.due === today || kept.has(t.id) || t.movedTo === today || t.status === 'in_progress' || t.anchorDate === today)
    .sort((a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999') || a.order - b.order);
}

export function movedFromToday(tasks: Task[], today: string): Task[] {
  return tasks.filter((t) => t.movedFrom === today && t.status !== 'done');
}

// Every open task can be planned; at most 25 go to the AI (the schema's
// limit), soonest due first.
export function plannableTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999') || a.order - b.order)
    .slice(0, 25);
}

export function keptEnergy(tasks: Task[], keepIds: string[]): number {
  const keep = new Set(keepIds);
  return tasks.filter((t) => keep.has(t.id)).reduce((sum, t) => sum + t.energyCost, 0);
}

export function buildDayModeInput(opts: {
  mode: CommunicationMode;
  requested: LighterMode;
  now: number;
  latest: CheckIn | null | undefined;
  tasks: Task[];
  events: CalendarEvent[];
}): DayModeInputT {
  const state = opts.latest
    ? { quadrant: opts.latest.quadrant, energy: opts.latest.energy, pleasantness: opts.latest.pleasantness }
    : { quadrant: 'swell' as const, energy: 0, pleasantness: 0 };
  return {
    mode: opts.mode,
    requestedMode: opts.requested,
    today: toISODate(opts.now),
    state,
    energyBudget: ENERGY_BUDGET[opts.requested],
    tasks: plannableTasks(opts.tasks).map((t) => ({
      id: t.id,
      title: t.title.slice(0, 120),
      type: t.type,
      energyCost: t.energyCost,
      due: t.due ?? null,
      status: t.status,
    })),
    events: opts.events.slice(0, 12).map((e) => ({ title: e.title.slice(0, 80), start: formatTime(e.start), end: formatTime(e.end) })),
  };
}
