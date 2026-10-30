// The contract for every AI route: what may go in and what must come out.
// The same schemas run on the server (before and after the model call) and
// in the browser (before trusting a response), so a bad answer can't reach
// Maya from either side. The check* functions catch things zod can't see,
// like an emotion id the model made up.
import { z } from 'zod';

// ---------- shared ----------
export const QuadrantZ = z.enum(['surge', 'swell', 'ebb', 'still']);
export const ModeZ = z.enum(['gentle', 'direct', 'literal']);
const Coord = z.number().int().min(-5).max(5);
const TaskTypeZ = z.enum(['writing', 'studying', 'admin', 'social', 'chores', 'other']);
const ReasonZ = z.enum(['dont_know_start', 'too_big', 'boring', 'worried_result', 'place_noise', 'no_energy']);

// ---------- label ----------
export const LabelInput = z
  .object({
    mode: ModeZ,
    localTime: z.string().max(40), // e.g. "Thu 3:40 pm"
    text: z.string().max(600).optional(),
    bodyCues: z.array(z.string().max(40)).max(8).optional(),
    energyHint: Coord.optional(), // from the wordless sliders
    pleasantnessHint: Coord.optional(),
    vocabulary: z.array(z.string()).max(60), // allowed emotion ids
  })
  .refine((v) => !!v.text || (v.bodyCues && v.bodyCues.length > 0), 'text or bodyCues required');

export const LabelOutput = z.object({
  candidates: z
    .array(
      z.object({
        id: z.string(), // must be in vocabulary
        definition: z.string().max(90), // may lightly tailor the stock definition
        energy: Coord,
        pleasantness: Coord,
      }),
    )
    .length(3),
  followUpQuestion: z.string().max(120),
  safetyFlag: z.boolean(),
});

// ---------- unstick ----------
export const HelpfulStrategyZ = z.object({
  id: z.string(),
  name: z.string(),
  better: z.number().int(),
  n: z.number().int(),
});

export const UnstickInput = z.object({
  mode: ModeZ,
  task: z.object({
    title: z.string().max(120),
    type: TaskTypeZ,
    energyCost: z.number().int().min(1).max(3),
  }),
  reason: ReasonZ,
  state: z
    .object({
      quadrant: QuadrantZ,
      energy: Coord,
      pleasantness: Coord,
      emotions: z.array(z.string()).max(2),
    })
    .optional(),
  parkingNote: z.string().max(140).optional(),
  // Built by the code from strategy_before_task results for this task's
  // type: `better` = times the task got going after that strategy (k),
  // `n` = times the strategy came before this task type. Top 3, n ≥ 3.
  helpfulStrategies: z.array(HelpfulStrategyZ).max(3),
  previousStep: z.string().max(140).optional(), // set when Maya asks for a different step
});

export const UnstickOutput = z.object({
  firstStep: z.string().max(110), // < 15 words, < 5 minutes
  focusMinutes: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(25)]),
  strategyId: z.string().nullable(), // only from helpfulStrategies ids, or null
  why: z.string().max(140),
});

// ---------- daymode ----------
export const DayModeInput = z.object({
  mode: ModeZ,
  requestedMode: z.enum(['gentle', 'minimum']),
  today: z.string(), // 'YYYY-MM-DD'
  state: z.object({ quadrant: QuadrantZ, energy: Coord, pleasantness: Coord }),
  energyBudget: z.number().int(), // gentle 4, minimum 2 (computed by code)
  tasks: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().max(120),
        type: z.string(),
        energyCost: z.number().int(),
        due: z.string().nullable(),
        status: z.string(),
      }),
    )
    .max(25),
  events: z.array(z.object({ title: z.string().max(80), start: z.string(), end: z.string() })).max(12),
});

export const DayModeOutput = z.object({
  keep: z.array(z.string()), // task ids
  move: z.array(z.string()), // task ids
  rationale: z.string().max(160),
});

// ---------- bridge ----------
export const BridgeInput = z.object({
  mode: ModeZ,
  minutesUntil: z.number().int(),
  from: z.object({ label: z.string().max(80), taskTitle: z.string().max(120).optional() }),
  to: z.object({
    title: z.string().max(80),
    kind: z.string(),
    place: z.string().max(60).optional(),
    prep: z.array(z.string().max(60)).max(5).optional(),
  }),
  state: z.object({ quadrant: QuadrantZ, energy: Coord, pleasantness: Coord }).optional(),
  hardBefore: z.object({ k: z.number().int(), n: z.number().int() }).optional(),
  candidateStrategies: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        durationSec: z.number().int(),
        better: z.number().int(),
        n: z.number().int(),
      }),
    )
    .min(1)
    .max(4),
});

export const BridgeOutput = z.object({
  parkingPrompt: z.string().max(90),
  strategyId: z.string(), // must be one of candidateStrategies
  prepSteps: z.array(z.string().max(60)).max(3),
});

// ---------- narrate ----------
export const PatternKindZ = z.enum(['strategy_before_task', 'hard_transition', 'state_task_start', 'strategy_effect', 'wrap_helped']);

export const NarrateInput = z.object({
  mode: ModeZ,
  patterns: z
    .array(
      z.object({
        key: z.string(),
        kind: PatternKindZ,
        facts: z.record(z.string(), z.union([z.string(), z.number()])), // e.g. { strategyName, taskType, k, n, baselinePct }
      }),
    )
    .max(6),
});

export const NarrateCardZ = z.object({
  key: z.string(),
  title: z.string().max(80),
  body: z.string().max(170), // ≤ 25 words
  whyText: z.string().max(200),
});

export const NarrateOutput = z.object({ cards: z.array(NarrateCardZ) });

export type LabelInputT = z.infer<typeof LabelInput>;
export type LabelOutputT = z.infer<typeof LabelOutput>;
export type UnstickInputT = z.infer<typeof UnstickInput>;
export type UnstickOutputT = z.infer<typeof UnstickOutput>;
export type DayModeInputT = z.infer<typeof DayModeInput>;
export type DayModeOutputT = z.infer<typeof DayModeOutput>;
export type BridgeInputT = z.infer<typeof BridgeInput>;
export type BridgeOutputT = z.infer<typeof BridgeOutput>;
export type NarrateInputT = z.infer<typeof NarrateInput>;
export type NarrateOutputT = z.infer<typeof NarrateOutput>;
export type NarrateCard = z.infer<typeof NarrateCardZ>;

// ---------- semantic checks ----------
// Each returns null when the output is acceptable, or a short reason that
// the server sends back to the model on its one retry.

export function checkLabelOutput(input: LabelInputT, output: LabelOutputT): string | null {
  const allowed = new Set(input.vocabulary);
  const ids = output.candidates.map((c) => c.id);
  const unknown = ids.filter((id) => !allowed.has(id));
  if (unknown.length > 0) return `ids not in vocabulary: ${unknown.join(', ')}`;
  if (new Set(ids).size !== ids.length) return 'candidate ids must be distinct';
  return null;
}

export function checkUnstickOutput(input: UnstickInputT, output: UnstickOutputT): string | null {
  if (output.strategyId === null) return null;
  const allowed = input.helpfulStrategies.map((s) => s.id);
  return allowed.includes(output.strategyId) ? null : `strategyId must be null or one of: ${allowed.join(', ') || 'none'}`;
}

export function checkDayModeOutput(input: DayModeInputT, output: DayModeOutputT): string | null {
  const inputIds = input.tasks.map((t) => t.id);
  const placed = [...output.keep, ...output.move];
  if (new Set(placed).size !== placed.length) return 'a task id appears more than once';
  const missing = inputIds.filter((id) => !placed.includes(id));
  const extra = placed.filter((id) => !inputIds.includes(id));
  if (missing.length > 0 || extra.length > 0) return 'every input task id must appear exactly once in keep or move';
  const cost = new Map(input.tasks.map((t) => [t.id, t.energyCost]));
  const kept = output.keep.reduce((sum, id) => sum + (cost.get(id) ?? 0), 0);
  if (kept > input.energyBudget + 1) return `kept energyCost ${kept} is over the budget of ${input.energyBudget}`;
  return null;
}

export function checkBridgeOutput(input: BridgeInputT, output: BridgeOutputT): string | null {
  const allowed = input.candidateStrategies.map((s) => s.id);
  return allowed.includes(output.strategyId) ? null : `strategyId must be one of: ${allowed.join(', ')}`;
}

export function checkNarrateKeys(input: NarrateInputT, output: NarrateOutputT): string | null {
  const want = input.patterns.map((p) => p.key).sort();
  const got = output.cards.map((c) => c.key).sort();
  if (want.length !== got.length || want.some((k, i) => k !== got[i])) return 'cards must use exactly the input keys, once each';
  return null;
}

// Every run of digits in a card must appear somewhere in that pattern's
// facts. "4 of 5" is fine when k=4 and n=5; "80%" is not unless 80 is a fact.
export function numbersAreFromFacts(card: NarrateCard, facts: Record<string, string | number>): boolean {
  const allowed = new Set(Object.values(facts).flatMap((v) => String(v).match(/\d+/g) ?? []));
  const used = `${card.title} ${card.body} ${card.whyText}`.match(/\d+/g) ?? [];
  return used.every((d) => allowed.has(d));
}

// ——— v2: /api/ai/wrapup (spec 14.6). Facts and reflection labels go in;
// the free-text notes never do. Four short fields come out.
export const WrapupInput = z.object({
  mode: ModeZ,
  readingLevel: z.enum(['standard', 'simple']).optional(),
  date: z.string(),
  facts: z.object({
    checkins: z.array(z.object({ time: z.string(), quadrant: QuadrantZ, emotions: z.array(z.string()).max(2) })).max(8),
    tasksDone: z.array(z.string().max(120)).max(12),
    focusBlocks: z.object({ total: z.number().int(), gotGoing: z.number().int() }),
    transitions: z.array(z.object({ label: z.string().max(80), rating: z.enum(['easy', 'okay', 'hard']).nullable() })).max(8),
    strategies: z.array(z.object({ name: z.string(), result: z.enum(['better', 'same', 'worse']).nullable() })).max(8),
  }),
  reflection: z.object({
    helped: z.array(z.string()).max(10),
    hard: z.array(z.string()).max(10),
    overall: z.enum(['very_hard', 'hard', 'mixed', 'okay', 'good']).nullable(),
  }),
  tomorrow: z.object({
    anchorTaskTitle: z.string().max(120).nullable(),
    firstEventTitle: z.string().max(80).nullable(),
    patternHint: z.object({ text: z.string().max(140) }).nullable(),
  }),
  companionName: z.string().max(16).nullable(),
});
export type WrapupInputT = z.infer<typeof WrapupInput>;

export const WrapupOutput = z.object({
  summary: z.string().min(1).max(320),
  highlight: z.string().min(1).max(110),
  tomorrowTip: z.string().min(1).max(140),
  companionLine: z.string().min(1).max(80),
});
export type WrapupOutputT = z.infer<typeof WrapupOutput>;

// Words that turn a summary into a verdict. Any of them sends the answer to
// the fallback template (spec 14.6).
export const WRAPUP_FORBIDDEN = [
  'productive', 'unproductive', 'lazy', 'should have', 'failed', 'failure', 'only managed', 'not enough',
  'disappointing', 'must', 'diagnos', 'disorder', 'therapy',
];

export function checkWrapupOutput(input: WrapupInputT, output: WrapupOutputT): string | null {
  const text = Object.values(output).join(' ');
  const lower = text.toLowerCase();
  const word = WRAPUP_FORBIDDEN.find((w) => lower.includes(w));
  if (word) return `the word "${word}" is not allowed`;
  // Numbers only from the input: any number written in it, or a count of
  // its lists ("You checked in 2 times" when there are two check-ins).
  const f = input.facts;
  const counts = [f.checkins, f.tasksDone, f.transitions, f.strategies, input.reflection.helped, input.reflection.hard].map((l) => String(l.length));
  const allowed = new Set([...(JSON.stringify(input).match(/\d+/g) ?? []), ...counts]);
  const stray = (text.match(/\d+/g) ?? []).find((d) => !allowed.has(d));
  if (stray) return `the number ${stray} is not in the input`;
  // A quoted phrase of three or more words must be (part of) a real title.
  const titles = [...input.facts.tasksDone, input.tomorrow.anchorTaskTitle ?? ''].map((t) => t.toLowerCase());
  for (const [, quoted] of text.matchAll(/["“]([^"”]+)["”]/g)) {
    if (quoted.trim().split(/\s+/).length >= 3 && !titles.some((t) => t.includes(quoted.toLowerCase()))) return `"${quoted}" is not a task title`;
  }
  return null;
}
