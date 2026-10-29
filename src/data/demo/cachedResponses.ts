// Saved AI answers for the exact inputs of the scripted stage demo (14.3),
// so the demo looks the same every time and still works if the venue network
// dies. useAi races the live call against these in demo mode only, and only
// for these inputs; anything off-script goes to the live AI as usual.
// Each answer is shaped from the actual input (task ids, candidate
// strategies), so it always passes the same checks as a live answer.
import type { AiOutputs, AiRouteName } from '@/lib/ai/types';
import type { BridgeInputT, DayModeInputT, LabelInputT, NarrateInputT, UnstickInputT } from '@/lib/ai/schemas';

export const DEMO_CHECKIN_TEXT = 'Lab report due tomorrow. I keep opening it and closing it. Heavy. Annoyed at myself.';

const normalize = (s: string | undefined) => (s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function label(input: LabelInputT): AiOutputs['label'] | undefined {
  if (normalize(input.text) !== normalize(DEMO_CHECKIN_TEXT)) return undefined;
  return {
    candidates: [
      { id: 'drained', definition: 'Low battery; starting anything feels like a lot', energy: -3, pleasantness: -3 },
      { id: 'frustrated', definition: 'Blocked from something you want to get done', energy: 1, pleasantness: -3 },
      { id: 'overwhelmed', definition: 'The task feels too big to hold at once', energy: 2, pleasantness: -4 },
    ],
    followUpQuestion: "Is it more that you're tired, or that the report feels too big?",
    safetyFlag: false,
  };
}

function unstick(input: UnstickInputT): AiOutputs['unstick'] | undefined {
  if (normalize(input.task.title) !== 'chemistry lab report' || input.reason !== 'dont_know_start') return undefined;
  const walk = input.helpfulStrategies.some((s) => s.id === 'm-walk-3') ? 'm-walk-3' : null;
  if (input.previousStep) {
    return { firstStep: 'Open the report. Type only today\'s date.', focusMinutes: 5, strategyId: walk, why: 'An even smaller start, so the page is no longer blank.' };
  }
  return {
    firstStep: 'Open the report and type only the title and date.',
    focusMinutes: 5,
    strategyId: walk,
    why: 'A tiny, clear start fits a low-energy afternoon.',
  };
}

const KEEP_TODAY = ['chemistry lab report', 'email ta about lab data'];

function daymode(input: DayModeInputT): AiOutputs['daymode'] | undefined {
  if (input.requestedMode !== 'gentle' || !input.tasks.some((t) => normalize(t.title) === 'chemistry lab report')) return undefined;
  const keep = input.tasks.filter((t) => KEEP_TODAY.includes(normalize(t.title))).map((t) => t.id);
  return {
    keep,
    move: input.tasks.map((t) => t.id).filter((id) => !keep.includes(id)),
    rationale: 'Keeping the lab report and the quick email to your TA. The rest can wait until tomorrow.',
  };
}

function bridge(input: BridgeInputT): AiOutputs['bridge'] | undefined {
  if (normalize(input.from.label) !== 'chemistry lab' || normalize(input.to.title) !== 'calculus') return undefined;
  const ids = input.candidateStrategies.map((c) => c.id);
  return {
    parkingPrompt: 'Where did you stop in the lab report?',
    strategyId: ids.includes('c-box') ? 'c-box' : ids[0],
    prepSteps: ['Calculator', 'Notes from Tuesday', 'Go to Room 4-203'],
  };
}

const NARRATION: Record<string, { title: string; body: string; whyText: string }> = {
  'strategyBeforeTask:m-walk-3:writing': {
    title: 'A short walk helps you start writing',
    body: 'In your data, writing tasks got going more often after a 3-minute walk. You could try one before the lab report.',
    whyText: 'From 5 times you walked before a writing task; you got going 4 times.',
  },
  'hardTransition:lab:class': {
    title: 'Switching from lab to class is often hard',
    body: 'In your data, this switch felt hard less often after box breathing. A short pause before calculus could help.',
    whyText: 'From 4 switches from lab to class that you rated; 3 felt hard.',
  },
  'strategyEffect:c-box': {
    title: 'Box breathing tends to help you',
    body: 'In your data, you often felt better after box breathing. It could be one to keep handy before a switch.',
    whyText: 'From 5 times you tried box breathing and checked in after; you felt better 4 times.',
  },
};

// The demo persona uses Gentle mode, so the saved wording is written for it.
// Only the exact planted numbers match; anything else is narrated live.
function narrate(input: NarrateInputT): AiOutputs['narrate'] | undefined {
  if (input.mode !== 'gentle') return undefined;
  const planted: Record<string, [number, number]> = {
    'strategyBeforeTask:m-walk-3:writing': [4, 5],
    'hardTransition:lab:class': [3, 4],
    'strategyEffect:c-box': [4, 5],
  };
  const allPlanted = input.patterns.every((p) => planted[p.key] && planted[p.key][0] === p.facts.k && planted[p.key][1] === p.facts.n);
  if (!allPlanted || input.patterns.length === 0) return undefined;
  return { cards: input.patterns.map((p) => ({ key: p.key, ...NARRATION[p.key] })) };
}

export function findCachedResponse<R extends AiRouteName>(route: R, input: unknown): AiOutputs[R] | undefined {
  const table: Record<AiRouteName, (i: never) => unknown> = { label, unstick, daymode, bridge, narrate };
  return table[route](input as never) as AiOutputs[R] | undefined;
}
