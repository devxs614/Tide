// Applying and undoing a Day Mode plan. Applying writes the DayPlan and marks
// moved tasks in one transaction; it returns a snapshot so the 10-second Undo
// can put every task back exactly as it was and remove the plan.
import { db } from '../db';
import { now } from '../clock';
import type { DayMode, DayPlan, Task } from '../types';

export interface DayPlanSnapshot {
  date: string;
  previousPlan?: DayPlan;
  tasks: Array<Pick<Task, 'id' | 'movedFrom' | 'movedTo'>>;
}

export interface ApplyDayPlanInput {
  date: string;
  tomorrow: string;
  mode: DayMode;
  keptTaskIds: string[];
  movedTaskIds: string[];
  rationale?: string;
}

export async function applyDayPlan(input: ApplyDayPlanInput): Promise<DayPlanSnapshot> {
  return db.transaction('rw', db.dayPlans, db.tasks, async () => {
    const ids = [...input.keptTaskIds, ...input.movedTaskIds];
    const before = await db.tasks.bulkGet(ids);
    const snapshot: DayPlanSnapshot = {
      date: input.date,
      previousPlan: await db.dayPlans.get(input.date),
      tasks: before
        .filter((t): t is Task => !!t)
        .map((t) => ({ id: t.id, movedFrom: t.movedFrom, movedTo: t.movedTo })),
    };
    await db.dayPlans.put({
      date: input.date,
      mode: input.mode,
      keptTaskIds: input.keptTaskIds,
      movedTaskIds: input.movedTaskIds,
      rationale: input.rationale,
      acceptedAt: now(),
    });
    await Promise.all([
      ...input.movedTaskIds.map((id) =>
        db.tasks.update(id, { movedFrom: input.date, movedTo: input.tomorrow }),
      ),
      // A task kept today that had been moved earlier comes back to today.
      ...input.keptTaskIds.map((id) => db.tasks.update(id, { movedFrom: undefined, movedTo: undefined })),
    ]);
    return snapshot;
  });
}

export async function undoDayPlan(snapshot: DayPlanSnapshot): Promise<void> {
  await db.transaction('rw', db.dayPlans, db.tasks, async () => {
    if (snapshot.previousPlan) await db.dayPlans.put(snapshot.previousPlan);
    else await db.dayPlans.delete(snapshot.date);
    await Promise.all(
      snapshot.tasks.map((t) => db.tasks.update(t.id, { movedFrom: t.movedFrom, movedTo: t.movedTo })),
    );
  });
}

export async function getDayPlan(date: string): Promise<DayPlan | undefined> {
  return db.dayPlans.get(date);
}

// "Bring back" on Today: the task returns to today's list, and if a plan
// moved it, the plan now counts it as kept, so it shows up under today's
// tasks even when it isn't due today.
export async function bringBackToday(taskId: string, date: string): Promise<void> {
  await db.transaction('rw', db.dayPlans, db.tasks, async () => {
    await db.tasks.update(taskId, { movedFrom: undefined, movedTo: undefined });
    const plan = await db.dayPlans.get(date);
    if (!plan) return;
    await db.dayPlans.update(date, {
      movedTaskIds: plan.movedTaskIds.filter((id) => id !== taskId),
      keptTaskIds: plan.keptTaskIds.includes(taskId) ? plan.keptTaskIds : [...plan.keptTaskIds, taskId],
    });
  });
}
