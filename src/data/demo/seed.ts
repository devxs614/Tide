// Three weeks in the life of Maya, a fictional first-year student, for demo
// mode. Everything is synthetic and built the same way on every machine (a
// seeded random generator, fixed ids), and it plants exactly the three
// patterns listed below, no more.

// The planted patterns:
//   1. a 3-minute walk before writing tasks: got going 4 of 5 times
//      (writing without a strategy first: 1 of 4),
//   2. lab → class switches felt hard 3 of 4 times (box breathing in 2),
//   3. box breathing helped 4 of 5 times.
// Two guard rails keep it to those three: seeded focus blocks sit far from
// check-ins (so no "state before task" pattern can form), and there are no
// Ebb check-ins between Oct 30 and Nov 4 (so Today's win card picks
// "Finished: Lab outline" from Thursday, Oct 29). seed.test.ts checks both.
import { EMOTIONS } from '@/data/emotions';
import { strategyName } from '@/data/strategies';
import { averagePoint, toQuadrant } from '@/lib/quadrant';
import type { CalendarEvent, CheckIn, FocusBlock, FocusOutcome, Quadrant, Reward, StrategyUse, Task, Transition, Win } from '@/lib/types';
import { finishedTaskWin, strategyWin, transitionWin } from '@/lib/wins';
import { DEMO_BOARD, HISTORY, type SeedTask } from './seedTasks';

export interface DemoData {
  checkins: CheckIn[];
  tasks: Task[];
  events: CalendarEvent[];
  focusBlocks: FocusBlock[];
  strategyUses: StrategyUse[];
  transitions: Transition[];
  wins: Win[];
  rewards: Reward[];
}

// mulberry32: a tiny seeded random generator, so "random" check-ins come out
// identical on every laptop.
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const at = (month: number, day: number, h: number, m = 0) => new Date(2026, month, day, h, m).getTime();
const oct = (day: number, h: number, m = 0) => at(9, day, h, m);
const nov = (day: number, h: number, m = 0) => at(10, day, h, m);
const iso = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Oct 16 (a Friday) to Nov 6.
const DAYS = Array.from({ length: 22 }, (_, i) => new Date(2026, 9, 16 + i).getTime());

function buildEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const add = (day: number, slug: string, title: string, kind: CalendarEvent['kind'], from: [number, number], to: [number, number], place?: string, prep?: string[]) => {
    const d = new Date(day);
    const mo = d.getMonth();
    const dd = d.getDate();
    events.push({ id: `ev-${iso(day)}-${slug}`, title, kind, start: at(mo, dd, ...from), end: at(mo, dd, ...to), place, prep });
  };
  for (const day of DAYS) {
    const wd = new Date(day).getDay();
    if (wd === 1 || wd === 3 || wd === 5) {
      add(day, 'physics', 'Physics', 'class', [9, 0], [10, 30], 'Room 3-110');
      add(day, 'programming', 'Programming', 'class', [12, 0], [13, 30], 'Lab 2');
    }
    if (wd === 1 || wd === 3) add(day, 'job', 'Part-time job (library)', 'work', [17, 0], [20, 0], 'Central Library');
    if (wd === 2 || wd === 4) {
      add(day, 'lab', 'Chemistry lab', 'lab', [14, 0], [16, 40], 'Chem Lab B');
      add(day, 'calculus', 'Calculus', 'class', [16, 50], [18, 20], 'Room 4-203', ['Calculator', 'Notes from Tuesday']);
    }
    if (wd === 6) add(day, 'groceries', 'Groceries', 'self_care', [11, 0], [12, 0]);
  }
  return events;
}

const TEXTS: Record<Quadrant, string[]> = {
  ebb: ['Slow morning. Hard to get going.', 'Tired after lab.', "Didn't sleep much."],
  surge: ['Too many deadlines this week.', "Lab ran late and I'm wired.", 'Group chat is a lot today.'],
  swell: ['Quiz went better than I thought.', 'Good energy after a walk.'],
  still: ['Quiet evening with tea.', 'Calm after a long day.'],
};

function pickQuadrant(rand: () => number): Quadrant {
  const r = rand();
  if (r < 0.35) return 'ebb';
  if (r < 0.6) return 'still';
  if (r < 0.85) return 'surge';
  return 'swell';
}

function buildCheckIns(rand: () => number): CheckIn[] {
  const list: CheckIn[] = [];
  // Every day up to Nov 4; demo day starts with no check-in so the demo's own
  // check-in is the first thing Today shows.
  for (const day of DAYS.filter((d) => d < nov(5, 0))) {
    const d = new Date(day);
    const tueThu = d.getDay() === 2 || d.getDay() === 4;
    const count = 1 + Math.floor(rand() * 3);
    const slots = [
      { h: 8, m: 20, afternoon: false },
      tueThu ? { h: 15, m: 30, afternoon: true } : { h: 12, m: 40, afternoon: true },
      { h: 22, m: 15, afternoon: false },
    ].slice(0, count);
    // Oct 29 must include an Ebb afternoon; make sure that slot exists.
    if (iso(day) === '2026-10-29' && slots.length < 2) slots.push({ h: 15, m: 30, afternoon: true });

    for (const [i, slot] of slots.entries()) {
      let q = slot.afternoon && tueThu ? (rand() < 0.5 ? 'surge' : 'ebb') : pickQuadrant(rand);
      if (iso(day) === '2026-10-29' && slot.afternoon) q = 'ebb';
      if (day >= oct(30, 0) && q === 'ebb') q = 'still';
      const words = EMOTIONS.filter((e) => e.quadrant === q);
      const picked = [words[Math.floor(rand() * words.length)]];
      if (rand() < 0.5) picked.push(words[Math.floor(rand() * words.length)]);
      const unique = [...new Set(picked)];
      const point = averagePoint(unique);
      const ts = at(d.getMonth(), d.getDate(), slot.h, slot.m + Math.floor(rand() * 15));
      const withText = rand() < 0.2;
      list.push({
        id: `ci-${iso(day)}-${i}`,
        ts,
        text: withText ? TEXTS[q][Math.floor(rand() * TEXTS[q].length)] : undefined,
        emotions: unique.map((e) => e.id),
        energy: point.energy,
        pleasantness: point.pleasantness,
        quadrant: toQuadrant(point.energy, point.pleasantness),
        need: rand() < 0.6 ? 'keep' : undefined,
        aiUsed: withText,
      });
    }
  }
  return list;
}

function toTask(t: SeedTask, order: number): Task {
  return {
    id: t.id,
    title: t.title,
    type: t.type,
    energyCost: t.energy,
    status: t.status,
    due: t.due,
    createdAt: t.doneAt ? t.doneAt - 3 * 86_400_000 : oct(30, 9),
    startedAt: t.startedAt ?? (t.doneAt ? t.doneAt - 3_600_000 : undefined),
    doneAt: t.doneAt,
    order,
  };
}

let useSeq = 0;
function strategyUse(strategyId: string, ts: number, context: StrategyUse['context'], result?: StrategyUse['result'], extra: Partial<StrategyUse> = {}): StrategyUse {
  useSeq += 1;
  return { id: `use-${useSeq}-${strategyId}`, strategyId, ts, context, result, ...extra };
}

function block(id: string, taskId: string, ts: number, outcome: FocusOutcome): FocusBlock {
  return { id, taskId, ts, minutes: 10, completed: outcome !== 'didnt_start', outcome };
}

export function buildDemoData(): DemoData {
  useSeq = 0;
  const rand = mulberry32(42);
  const events = buildEvents();
  const checkins = buildCheckIns(rand);
  const tasks = [...HISTORY, ...DEMO_BOARD].map((t, i) => toTask(t, i));
  const taskId = (title: string) => tasks.find((t) => t.title === title)!.id;

  // Pattern 1: walk before writing (strategy at 9:00 pm, block at 9:05 pm),
  // plus writing blocks with no strategy first, and sudoku before writing.
  const walks: Array<[number, string, FocusOutcome]> = [
    [oct(21, 21), 'Chemistry prelab notes', 'got_going'],
    [oct(23, 21), 'English essay draft', 'got_going'],
    [oct(25, 21), 'Reflection paper', 'a_little'],
    [oct(28, 21), 'Chemistry lab report 2', 'got_going'],
    [nov(1, 21), 'Programming project README', 'got_going'],
  ];
  const baseline: Array<[number, string, FocusOutcome]> = [
    [oct(17, 21, 5), 'English essay outline', 'got_going'],
    [oct(20, 21, 5), 'Thank-you note to tutor', 'didnt_start'],
    [oct(27, 21, 5), 'Lab outline', 'a_little'],
    [nov(4, 21, 5), 'Chemistry lab report', 'didnt_start'],
  ];
  const sudoku: Array<[number, FocusOutcome, StrategyUse['result']]> = [
    [oct(19, 21), 'didnt_start', 'worse'],
    [oct(24, 21), 'a_little', 'same'],
    [oct(29, 21), 'got_going', 'better'],
  ];

  const strategyUses: StrategyUse[] = [];
  const focusBlocks: FocusBlock[] = [];
  walks.forEach(([ts, title, outcome], i) => {
    strategyUses.push(strategyUse('m-walk-3', ts, 'toolkit'));
    focusBlocks.push(block(`fb-walk-${i}`, taskId(title), ts + 5 * 60_000, outcome));
  });
  baseline.forEach(([ts, title, outcome], i) => focusBlocks.push(block(`fb-base-${i}`, taskId(title), ts, outcome)));
  sudoku.forEach(([ts, outcome, result], i) => {
    strategyUses.push(strategyUse('t-sudoku', ts, 'toolkit', result));
    focusBlocks.push(block(`fb-sudoku-${i}`, taskId('Lab outline'), ts + 5 * 60_000, outcome));
  });

  // Pattern 2: four rated lab → class switches; box breathing in two.
  const ev = (date: string, slug: string) => events.find((e) => e.id === `ev-${date}-${slug}`)!;
  const boxOct27 = strategyUse('c-box', oct(27, 16, 35), 'bridge', 'same', { transitionId: 'tr-2026-10-27' });
  const boxNov3 = strategyUse('c-box', nov(3, 16, 35), 'bridge', 'better', { transitionId: 'tr-2026-11-03' });
  strategyUses.push(boxOct27, boxNov3);
  const switches: Array<[string, Transition['rating'], StrategyUse | undefined, string | undefined]> = [
    ['2026-10-22', 'hard', undefined, undefined],
    ['2026-10-27', 'hard', boxOct27, 'Chemistry lab report 2: results table'],
    ['2026-10-29', 'hard', undefined, undefined],
    ['2026-11-03', 'okay', boxNov3, 'Chemistry lab report: started the methods'],
  ];
  const transitions: Transition[] = switches.map(([date, rating, boxUse, note]) => {
    const to = ev(date, 'calculus');
    return {
      id: `tr-${date}`,
      ts: to.start - 12 * 60_000,
      fromEventId: ev(date, 'lab').id,
      toEventId: to.id,
      parkingNote: note,
      strategyUseId: boxUse?.id,
      rating,
      ratedAt: to.start + 15 * 60_000,
    };
  });

  // Pattern 3: box breathing re-checked 5 times, 4 better (the two bridge
  // uses above count). A few other strategies stay under 3 answers each.
  strategyUses.push(
    strategyUse('c-box', oct(17, 10, 30), 'toolkit', 'better'),
    strategyUse('c-box', oct(22, 11), 'toolkit', 'better'),
    strategyUse('c-box', oct(30, 13, 30), 'toolkit', 'better'),
    strategyUse('m-stretch', oct(20, 12), 'toolkit', 'better'),
    strategyUse('m-stretch', nov(2, 13), 'toolkit', 'same'),
    strategyUse('c-54321', oct(26, 10), 'toolkit', 'better'),
    strategyUse('s-text-friend', oct(28, 13), 'toolkit', 'better'),
  );

  const wins: Win[] = [
    ...tasks.filter((t) => t.doneAt).map((t) => ({ id: `win-task-${t.id}`, ts: t.doneAt!, text: finishedTaskWin(t.title), source: 'task' as const, refId: t.id })),
    ...strategyUses
      .filter((u) => u.result === 'better')
      .map((u) => ({ id: `win-${u.id}`, ts: u.ts, text: strategyWin(strategyName(u.strategyId)), source: 'strategy' as const, refId: u.id })),
    ...transitions
      .filter((t) => t.rating === 'okay' || t.rating === 'easy')
      .map((t) => ({ id: `win-${t.id}`, ts: t.ratedAt!, text: transitionWin('Chemistry lab', 'Calculus'), source: 'transition' as const, refId: t.id })),
  ];

  const rewards: Reward[] = ['10 minutes of my game', 'Tea break', 'Text Sofi'].map((text, i) => ({ id: `reward-${i}`, text }));

  return { checkins, tasks, events, focusBlocks, strategyUses, transitions, wins, rewards };
}
