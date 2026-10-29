// Deterministic answers for every AI route, used when AI is off, the key is
// missing, the network is down, the model is slow, or its answer fails
// validation. They are plain functions with no network or file access, so
// the browser can run them instantly and the demo survives a dead venue
// Wi-Fi. They aim to be useful on their own, not placeholders.
import { EMOTIONS, getEmotion } from '@/data/emotions';
import { byMode, copy, fill } from '@/copy/en';
import { detectCrisis } from '@/lib/safety/detect';
import type { Quadrant, StuckReason, TaskType } from '@/lib/types';
import { ANY_TASK_STEP, FIRST_STEP_TABLE, SMALLEST_STEP } from './unstickTable';
import type {
  BridgeInputT,
  BridgeOutputT,
  DayModeInputT,
  DayModeOutputT,
  LabelInputT,
  LabelOutputT,
  NarrateCard,
  NarrateInputT,
  NarrateOutputT,
  UnstickInputT,
  UnstickOutputT,
} from './schemas';

// ---------- label ----------

// Everyday words mapped to the closest vocabulary ids, first id first.
const LEXICON: Array<{ words: string[]; ids: [string, string] }> = [
  { words: ['tired', 'heavy', 'exhausted', 'drained', 'sleepy', 'worn out', 'no energy'], ids: ['drained', 'exhausted'] },
  { words: ['stuck', 'annoyed', 'blocked', 'frustrated', 'frustrating', "can't start", 'cant start'], ids: ['frustrated', 'irritated'] },
  { words: ['too much', 'everything', 'overwhelmed', 'overwhelming', 'so much'], ids: ['overwhelmed', 'stressed'] },
  { words: ['worried', 'nervous', 'anxious', 'scared', 'afraid'], ids: ['anxious', 'worried'] },
  { words: ['stressed', 'pressure', 'deadline'], ids: ['stressed', 'anxious'] },
  { words: ['sad', 'down', 'crying', 'upset'], ids: ['sad', 'disappointed'] },
  { words: ['bored', 'boring'], ids: ['bored', 'unmotivated'] },
  { words: ['alone', 'lonely'], ids: ['lonely', 'sad'] },
  { words: ['angry', 'mad', 'furious'], ids: ['angry', 'irritated'] },
  { words: ['foggy', 'blurry', 'brain fog', "can't think", 'cant think'], ids: ['foggy', 'drained'] },
  { words: ['restless', 'fidgety', "can't sit still"], ids: ['restless', 'jittery'] },
  { words: ['good', 'happy', 'great', 'excited'], ids: ['happy', 'excited'] },
  { words: ['proud'], ids: ['proud', 'satisfied'] },
  { words: ['motivated', 'ready'], ids: ['motivated', 'determined'] },
  { words: ['calm', 'fine', 'relaxed', 'okay'], ids: ['calm', 'content'] },
];

function lexiconMatches(text: string): string[][] {
  const lower = ` ${text.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z' ]+/g, ' ')} `;
  // Keep rules in the order their words first appear in what Maya wrote, so
  // the first candidate is the first feeling she mentioned.
  return LEXICON.map((rule) => {
    const positions = rule.words.map((w) => lower.indexOf(` ${w} `)).filter((i) => i >= 0);
    return { ids: rule.ids, at: positions.length ? Math.min(...positions) : -1 };
  })
    .filter((m) => m.at >= 0)
    .sort((a, b) => a.at - b.at)
    .map((m) => m.ids);
}

function nearestIds(energy: number, pleasantness: number, allowed: Set<string>, exclude: Set<string>): string[] {
  return EMOTIONS.filter((e) => allowed.has(e.id) && !exclude.has(e.id))
    .map((e) => ({ id: e.id, d: Math.hypot(e.energy - energy, e.pleasantness - pleasantness) }))
    .sort((a, b) => a.d - b.d)
    .map((e) => e.id);
}

export function labelFallback(input: LabelInputT): LabelOutputT {
  const allowed = new Set(input.vocabulary.length ? input.vocabulary : EMOTIONS.map((e) => e.id));
  const picked: string[] = [];
  const add = (id: string) => {
    if (allowed.has(id) && !picked.includes(id) && picked.length < 3) picked.push(id);
  };

  if (input.text) {
    const matches = lexiconMatches(input.text);
    // Round-robin: the first word of each matched feeling, then the second.
    matches.forEach((ids) => add(ids[0]));
    matches.forEach((ids) => add(ids[1]));
  }

  const hasHints = input.energyHint !== undefined || input.pleasantnessHint !== undefined;
  const firstPicked = picked.length ? getEmotion(picked[0]) : undefined;
  const energy = hasHints ? (input.energyHint ?? 0) : (firstPicked?.energy ?? -2);
  const pleasantness = hasHints ? (input.pleasantnessHint ?? 0) : (firstPicked?.pleasantness ?? -2);
  nearestIds(energy, pleasantness, allowed, new Set(picked)).forEach(add);

  return {
    candidates: picked.map((id) => {
      const e = getEmotion(id)!;
      return { id, definition: e.definition, energy: e.energy, pleasantness: e.pleasantness };
    }),
    followUpQuestion: 'Which of these feels closest?',
    safetyFlag: detectCrisis(input.text),
  };
}

// ---------- unstick ----------

const FOCUS_BY_QUADRANT: Record<Quadrant, 5 | 10 | 15 | 25> = { ebb: 5, surge: 10, still: 15, swell: 25 };

// The same step reads differently by state: in Ebb Tide says it's fine to
// stop after the step, in Swell it invites a longer run. That keeps the
// fallback honest to "fit the user's current state" without 144 entries.
const STATE_TAIL: Partial<Record<Quadrant, string>> = {
  ebb: ' You can stop after that.',
  swell: ' Then keep going for the whole block.',
};

function stepFor(reason: StuckReason, type: TaskType, title: string): string {
  return fill(FIRST_STEP_TABLE[reason][type], { task: title });
}

export function unstickFallback(input: UnstickInputT): UnstickOutputT {
  const { task, reason, state } = input;
  const options = [
    stepFor(reason, task.type, task.title),
    fill(SMALLEST_STEP[task.type], { task: task.title }),
    stepFor('no_energy', task.type, task.title),
    ANY_TASK_STEP,
  ];
  // "Different step" must be different and smaller: skip anything that
  // matches the step Maya just turned down.
  const previous = input.previousStep?.trim();
  const startAt = previous ? 1 : 0;
  const base = options.slice(startAt).find((s) => !previous || !previous.startsWith(s)) ?? ANY_TASK_STEP;
  const tail = state && !previous ? (STATE_TAIL[state.quadrant] ?? '') : '';

  const helpful = input.helpfulStrategies
    .filter((s) => s.n >= 3 && s.better / s.n >= 0.6)
    .sort((a, b) => b.better / b.n - a.better / a.n || b.n - a.n);

  return {
    firstStep: base + tail,
    focusMinutes: reason === 'no_energy' ? 5 : state ? FOCUS_BY_QUADRANT[state.quadrant] : 10,
    strategyId: helpful[0]?.id ?? null,
    why: 'A small start based on how you feel right now.',
  };
}

// ---------- daymode ----------

export function dayModeFallback(input: DayModeInputT): DayModeOutputT {
  const open = input.tasks.filter((t) => t.status !== 'done');
  const started = (s: string) => (s === 'in_progress' || s === 'stuck' ? 0 : 1);
  // Due date first (no date last). On the same date, a task Maya already
  // started stays ahead of one she hasn't, then the lighter task wins.
  const sorted = [...open].sort((a, b) => {
    const da = a.due ?? '9999-12-31';
    const dbb = b.due ?? '9999-12-31';
    if (da !== dbb) return da < dbb ? -1 : 1;
    if (started(a.status) !== started(b.status)) return started(a.status) - started(b.status);
    return a.energyCost - b.energyCost;
  });

  const keep: string[] = [];
  let total = 0;
  for (const t of sorted) {
    // Something due today may go one point over budget; nothing else may.
    const limit = t.due === input.today ? input.energyBudget + 1 : input.energyBudget;
    if (total + t.energyCost <= limit) {
      keep.push(t.id);
      total += t.energyCost;
    }
  }
  const move = input.tasks.map((t) => t.id).filter((id) => !keep.includes(id));
  const rationale =
    input.requestedMode === 'minimum'
      ? "Only what can't wait. Everything else is still here tomorrow."
      : "Keeping what's due soon. The rest can wait until tomorrow.";
  return { keep, move, rationale };
}

// ---------- bridge ----------

export function bridgeFallback(input: BridgeInputT): BridgeOutputT {
  const prep = [...(input.to.prep ?? [])];
  if (input.to.place) prep.push(`Go to ${input.to.place}`);
  return {
    parkingPrompt: byMode(copy.bridge.parkingFallback, input.mode),
    strategyId: input.candidateStrategies[0].id,
    prepSteps: (prep.length ? prep : [...copy.bridge.prepGeneric]).slice(0, 3),
  };
}

// ---------- narrate ----------

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function narrateTemplate(p: NarrateInputT['patterns'][number]): NarrateCard {
  const f = p.facts;
  const s = (key: string) => String(f[key] ?? '');
  switch (p.kind) {
    case 'strategy_before_task':
      return {
        key: p.key,
        title: `${capitalize(s('strategyName'))} before ${s('taskType')} tasks`,
        body: `In your data, ${s('taskType')} tasks got going more often after ${s('strategyName').toLowerCase()}. You could try it next time.`,
        whyText: `From ${s('n')} times you used ${s('strategyName').toLowerCase()} before a ${s('taskType')} task; you got going ${s('k')} times.`,
      };
    case 'hard_transition': {
      // Only say a strategy made the switch easier when the numbers show it.
      const helped =
        f.withStrategyName !== undefined &&
        Number(f.withStrategyHardK) / Number(f.withStrategyN) < Number(f.withoutStrategyHardK) / Number(f.withoutStrategyN);
      const withName = helped ? s('withStrategyName') : '';
      return {
        key: p.key,
        title: `Switching from ${s('fromLabel')} to ${s('toLabel')} is often hard`,
        body: withName
          ? `In your data, this switch felt hard less often after ${withName.toLowerCase()}. You could try it before the next one.`
          : 'In your data, this switch often felt hard. A short strategy before it might help.',
        whyText: `From ${s('n')} switches from ${s('fromLabel')} to ${s('toLabel')} that you rated; ${s('k')} felt hard.`,
      };
    }
    case 'state_task_start':
      return {
        key: p.key,
        title: `${capitalize(s('taskType'))} tasks when you feel ${s('quadrantName')}`,
        body:
          s('direction') === 'higher'
            ? `In your data, ${s('taskType')} tasks got going more often after a ${s('quadrantName')} check-in.`
            : `In your data, ${s('taskType')} tasks got going less often after a ${s('quadrantName')} check-in. A smaller first step might help then.`,
        whyText: `From ${s('n')} ${s('taskType')} focus blocks after a ${s('quadrantName')} check-in; you got going ${s('k')} times.`,
      };
    case 'strategy_effect':
      return {
        key: p.key,
        title: `${capitalize(s('strategyName'))} tends to help you`,
        body: `In your data, you often felt better after ${s('strategyName').toLowerCase()}. It could be one to keep handy.`,
        whyText: `From ${s('n')} times you tried ${s('strategyName').toLowerCase()} and checked in after; you felt better ${s('k')} times.`,
      };
  }
}

export function narrateFallback(input: NarrateInputT): NarrateOutputT {
  return { cards: input.patterns.map(narrateTemplate) };
}
