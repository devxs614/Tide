// The repo functions every write goes through, and the side effects that
// ride along: wins, stamps, and never storing text when safety fired.
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db';
import { clearData } from './data';
import { createCheckIn } from './checkins';
import { addTask, moveTask } from './tasks';
import { saveFocusBlock } from './focus';
import { recordStrategyUse } from './strategies';
import { rateTransition, saveTransition } from './transitions';
import { addEvent } from './events';

beforeEach(async () => {
  await clearData();
});

describe('repo', () => {
  it('computes the quadrant itself and never stores text when safety fired', async () => {
    const c = await createCheckIn({
      text: 'something private',
      emotions: [],
      energy: -2,
      pleasantness: -4,
      aiUsed: false,
      safetyTriggered: true,
    });
    expect(c.quadrant).toBe('ebb');
    const stored = await db.checkins.get(c.id);
    expect(stored?.text).toBeUndefined();
    expect(stored?.safetyTriggered).toBe(true);
  });

  it('stamps start and finish times and adds a win when a task is done', async () => {
    const task = await addTask({ title: 'Lab outline', type: 'writing', energyCost: 2 });
    await moveTask(task.id, 'in_progress');
    expect((await db.tasks.get(task.id))?.startedAt).toBeTypeOf('number');
    await moveTask(task.id, 'done');
    expect((await db.tasks.get(task.id))?.doneAt).toBeTypeOf('number');
    const wins = await db.wins.toArray();
    expect(wins.map((w) => w.text)).toEqual(['Finished: Lab outline']);
  });

  it('keeps the win when a finished task is moved back', async () => {
    const task = await addTask({ title: 'Laundry', type: 'chores', energyCost: 2 });
    await moveTask(task.id, 'done');
    await moveTask(task.id, 'not_started');
    expect((await db.tasks.get(task.id))?.doneAt).toBeUndefined();
    expect(await db.wins.count()).toBe(1);
  });

  it('adds "Got unstuck" once when a stuck task gets going', async () => {
    const task = await addTask({ title: 'Lab report', type: 'writing', energyCost: 3 });
    await db.tasks.update(task.id, { stuckReason: 'dont_know_start' });
    await saveFocusBlock({ taskId: task.id, ts: 1, minutes: 5, completed: true, outcome: 'got_going' });
    await saveFocusBlock({ taskId: task.id, ts: 2, minutes: 5, completed: true, outcome: 'got_going' });
    const wins = await db.wins.toArray();
    expect(wins.map((w) => w.text)).toEqual(['Got unstuck: Lab report']);
  });

  it('adds a win for a strategy that helped and for an okay switch, never for hard ones', async () => {
    await recordStrategyUse({ strategyId: 'c-box', context: 'toolkit', result: 'better' });
    await recordStrategyUse({ strategyId: 'c-box', context: 'toolkit', result: 'worse' });
    const lab = await addEvent({ title: 'Chemistry lab', kind: 'lab', start: 1, end: 2 });
    const calc = await addEvent({ title: 'Calculus', kind: 'class', start: 3, end: 4 });
    await saveTransition({ id: 't1', fromEventId: lab.id, toEventId: calc.id });
    await saveTransition({ id: 't2', fromEventId: lab.id, toEventId: calc.id });
    await rateTransition('t1', 'okay');
    await rateTransition('t2', 'hard');
    const texts = (await db.wins.toArray()).map((w) => w.text).sort();
    expect(texts).toEqual(['Felt better after: Box breathing', 'Got through: Chemistry lab → Calculus']);
  });
});
