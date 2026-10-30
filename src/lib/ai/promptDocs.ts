// Everything the AI Prompts PDF says about each route, kept next to the code
// it describes. The schemas are printed from the real zod schemas and the
// examples are real inputs answered by the saved demo responses, so the PDF
// can't drift from what the app actually sends and accepts.
import { z } from 'zod';
import { EMOTION_IDS } from '@/data/emotions';
import { DEMO_CHECKIN_TEXT, WRAPUP_EXAMPLE_INPUT, findCachedResponse } from '@/data/demo/cachedResponses';
import type { AiRouteName } from './types';
import {
  BridgeInput,
  BridgeOutput,
  DayModeInput,
  DayModeOutput,
  LabelInput,
  LabelOutput,
  NarrateInput,
  NarrateOutput,
  UnstickInput,
  UnstickOutput,
  WrapupInput,
  WrapupOutput,
} from './schemas';

export interface RouteDoc {
  route: AiRouteName;
  title: string;
  purpose: string;
  tier: 'fast' | 'smart';
  maxTokens: number;
  inputSchema: unknown;
  outputSchema: unknown;
  exampleInput: unknown;
  validation: string[];
  fallback: string;
  safety: string;
}

const json = (schema: z.ZodType) => z.toJSONSchema(schema, { unrepresentable: 'any' });

const labelInput = { mode: 'gentle', localTime: 'Thu 3:40 pm', text: DEMO_CHECKIN_TEXT, vocabulary: EMOTION_IDS };
const unstickInput = {
  mode: 'gentle',
  task: { title: 'Chemistry lab report', type: 'writing', energyCost: 3 },
  reason: 'dont_know_start',
  state: { quadrant: 'ebb', energy: -1, pleasantness: -3, emotions: ['drained', 'frustrated'] },
  helpfulStrategies: [{ id: 'm-walk-3', name: '3-minute walk', better: 4, n: 5 }],
};
const daymodeInput = {
  mode: 'gentle',
  requestedMode: 'gentle',
  today: '2026-11-05',
  state: { quadrant: 'ebb', energy: -1, pleasantness: -3 },
  energyBudget: 4,
  tasks: [
    { id: 't1', title: 'Chemistry lab report', type: 'writing', energyCost: 3, due: '2026-11-06', status: 'in_progress' },
    { id: 't2', title: 'Calculus problem set 7', type: 'studying', energyCost: 2, due: '2026-11-06', status: 'not_started' },
    { id: 't3', title: 'Email TA about lab data', type: 'admin', energyCost: 1, due: '2026-11-05', status: 'not_started' },
    { id: 't4', title: 'Laundry', type: 'chores', energyCost: 2, due: null, status: 'not_started' },
  ],
  events: [
    { title: 'Chemistry lab', start: '2:00 pm', end: '4:40 pm' },
    { title: 'Calculus', start: '4:50 pm', end: '6:20 pm' },
  ],
};
const bridgeInput = {
  mode: 'gentle',
  minutesUntil: 9,
  from: { label: 'Chemistry lab', taskTitle: 'Chemistry lab report' },
  to: { title: 'Calculus', kind: 'class', place: 'Room 4-203', prep: ['Calculator', 'Notes from Tuesday'] },
  state: { quadrant: 'ebb', energy: -1, pleasantness: -3 },
  hardBefore: { k: 3, n: 4 },
  candidateStrategies: [
    { id: 'c-box', name: 'Box breathing', durationSec: 120, better: 4, n: 5 },
    { id: 'm-shake-20', name: 'Shake it out', durationSec: 60, better: 0, n: 0 },
    { id: 's-voice-memo', name: 'Say it out loud', durationSec: 60, better: 0, n: 0 },
  ],
};
const narrateInput = {
  mode: 'gentle',
  patterns: [
    { key: 'strategyBeforeTask:m-walk-3:writing', kind: 'strategy_before_task', facts: { strategyName: '3-minute walk', taskType: 'writing', k: 4, n: 5, baselinePct: 25 } },
    { key: 'strategyEffect:c-box', kind: 'strategy_effect', facts: { strategyName: 'Box breathing', k: 4, n: 5 } },
  ],
};

// The five v1 routes, as the v1 document listed them.
export type V1Route = Exclude<AiRouteName, 'wrapup'>;
export const ROUTE_DOCS: Array<RouteDoc & { route: V1Route }> = [
  {
    route: 'label',
    title: 'Label: words for a feeling',
    purpose: "Turns the student's own words (or wordless body cues and two sliders) into three emotion words from Tide's 48-word vocabulary, with a question that helps tell them apart. The student chooses; nothing is preselected.",
    tier: 'fast',
    maxTokens: 500,
    inputSchema: json(LabelInput),
    outputSchema: json(LabelOutput),
    exampleInput: labelInput,
    validation: ['Exactly three candidates, coordinates between -5 and 5.', 'Every id must be in the vocabulary sent, and all three must be different.', 'An invalid answer gets one retry with the reason; a second invalid answer falls back.'],
    fallback: 'A keyword lexicon (tired/heavy → drained; stuck/annoyed → frustrated; …) in the order the feelings appear in the text, then the nearest vocabulary words to the slider point.',
    safety: 'The text is checked for crisis phrases in the browser before any call. If the check fires, or the model sets safetyFlag, no words are shown: the check-in is saved without its text and the support screen opens.',
  },
  {
    route: 'unstick',
    title: 'Unstick: one small first step',
    purpose: 'Gives one physical first step (under 15 words, under 5 minutes) for a stuck task, fitted to why it feels hard and to the current state, plus a focus length and, if the student\'s own history supports it, a strategy to do first.',
    tier: 'fast',
    maxTokens: 350,
    inputSchema: json(UnstickInput),
    outputSchema: json(UnstickOutput),
    exampleInput: unstickInput,
    validation: ['focusMinutes must be 5, 10, 15 or 25.', 'strategyId must be null or one of the helpfulStrategies sent (computed by the pattern engine).'],
    fallback: 'A table with a literal step for each of the 6 reasons × 6 task types (36 entries), a state-specific line, focus length by state, and the best helpful strategy at ≥ 60% over ≥ 3 uses.',
    safety: 'The parking note, the only free text sent, is checked for crisis phrases first.',
  },
  {
    route: 'daymode',
    title: 'Day Mode: a lighter day',
    purpose: 'Proposes which open tasks to keep today and which to move to tomorrow for a Gentle (about 4 energy points) or Minimum (about 2) day, with one sentence of rationale. The student can flip any task before using the plan, and Undo restores everything.',
    tier: 'smart',
    maxTokens: 600,
    inputSchema: json(DayModeInput),
    outputSchema: json(DayModeOutput),
    exampleInput: daymodeInput,
    validation: ['Every input task id must appear exactly once in keep or move; no unknown ids.', 'The kept energy may not exceed the budget by more than 1.'],
    fallback: 'Sort by due date (no date last), started tasks first, then lighter first; keep what fits the budget (something due today may go one point over); move the rest.',
    safety: 'No free text is sent; task titles are ones the student typed for this purpose.',
  },
  {
    route: 'bridge',
    title: 'Bridge: switching activities',
    purpose: 'Helps the switch from one activity to the next: a question to note where the student is leaving off, one short strategy picked from the top-ranked candidates (three minutes or less), and up to three prep steps.',
    tier: 'fast',
    maxTokens: 350,
    inputSchema: json(BridgeInput),
    outputSchema: json(BridgeOutput),
    exampleInput: bridgeInput,
    validation: ['strategyId must be one of the candidateStrategies sent.', 'At most three prep steps of 60 characters.'],
    fallback: 'A plain parking question for the communication mode, the top-ranked candidate, and the event\'s own prep items plus "Go to {place}".',
    safety: 'The parking note the student types is checked for crisis phrases before it is saved.',
  },
  {
    route: 'narrate',
    title: 'Narrate: patterns in plain words',
    purpose: 'Puts patterns that the app has already computed into short, kind sentences. The AI never sees the history and never computes anything; it only receives the facts of each pattern.',
    tier: 'smart',
    maxTokens: 600,
    inputSchema: json(NarrateInput),
    outputSchema: json(NarrateOutput),
    exampleInput: narrateInput,
    validation: ['Cards must use exactly the keys sent, once each.', 'Any number in a card must appear in that pattern\'s facts; otherwise that card is replaced by its template.', 'The "k of n" and confidence shown on screen always come from the engine, never from this text.'],
    fallback: 'A template per pattern kind built only from the facts (for example, "From 5 times you used 3-minute walk before a writing task; you got going 4 times.").',
    safety: 'No free text is sent. Check-ins where the safety layer fired are excluded from every pattern.',
  },
];

// Routes added in v2. Listed apart so the v1 document (and its test) stays
// as it was; the page shows them in their own section.
export const V2_ROUTE_DOCS: RouteDoc[] = [
  {
    route: 'wrapup',
    title: 'Wrap-up: closing the day',
    purpose: 'Writes a short, kind summary of the day, one highlight, a tip for tomorrow and a goodnight line, from facts the app counted and labels the student chose. Their own notes are never sent.',
    tier: 'smart',
    maxTokens: 600,
    inputSchema: json(WrapupInput),
    outputSchema: json(WrapupOutput),
    exampleInput: WRAPUP_EXAMPLE_INPUT,
    validation: [
      'Every number in the answer must appear in the input.',
      'A quoted phrase of three or more words must be part of a real task title.',
      'Words that judge the day ("productive", "lazy", "failed", "not enough", "must"…) or mention diagnosis or therapy send the answer to the fallback.',
    ],
    fallback: 'Plain sentences from the facts ("You checked in 2 times today. Box breathing helped."), the first thing that helped as the highlight, the pattern hint or "Start small. One step is enough." as the tip, and the companion\'s own goodnight line.',
    safety: 'No free text is sent; the notes typed in "Something else" stay on the device and go through the safety check when typed.',
  },
];

export function exampleOutput(doc: RouteDoc): unknown {
  return findCachedResponse(doc.route, doc.exampleInput);
}
