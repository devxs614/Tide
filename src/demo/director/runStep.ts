// One step of the tour, from finding its target to the end of its hold
// (demo fix pack, D-5). Every wait takes the step's abort signal, so a
// pause stops it on the spot, and the step's progress records what already
// happened: a tap or a navigation is never done twice, typing continues
// from the character it reached, and the hold resumes with what was left.
import type { DirectorDeps, EngineState } from './engine';
import type { Step } from './types';
import { click, fieldIn, findTarget, typeInto } from './actions';
import { AbortedError, hold, isAborted, orAbort, throwIfAborted, wait } from './abortable';

export interface StepProgress {
  index: number;
  // The step's tap, navigation or other action has happened.
  actionDone: boolean;
  // Characters typed so far, and where, for a typing step.
  typed: number;
  typing: { field: HTMLInputElement | HTMLTextAreaElement; text: string } | null;
  // Hold time still to go after a pause (null: not started).
  holdLeft: number | null;
  narrated: boolean;
}

export function freshProgress(index: number): StepProgress {
  return { index, actionDone: false, typed: 0, typing: null, holdLeft: null, narrated: false };
}

export interface StepContext {
  deps: DirectorDeps;
  get: () => EngineState;
  set: (patch: Partial<EngineState>) => void;
  note: (message: string) => void;
  // Resolves once narration's one-time setup is done.
  ready: () => Promise<void>;
}

async function act(step: Step, target: HTMLElement | null, p: StepProgress, signal: AbortSignal, { deps, get }: StepContext): Promise<number> {
  const a = step.action;
  const speed = get().speed;
  switch (a.kind) {
    case 'navigate':
      deps.navigate(a.path);
      return 500;
    case 'click':
      if (target) click(target);
      return 300 / speed;
    case 'type': {
      if (!target) return 0;
      const field = fieldIn(target);
      if (field) p.typing = { field, text: a.text };
      await typeInto(target, a.text, 1000 / (a.cps ?? 22) / speed, { from: p.typed, signal, onChar: (n) => (p.typed = n) });
      return 0;
    }
    case 'wait':
      await hold(p.holdLeft ?? a.ms / speed, signal, (left) => (p.holdLeft = left));
      p.holdLeft = null;
      return 0;
    case 'setClock':
      await orAbort(deps.setClock(a.ts), signal);
      return 0;
    case 'setSpeed':
      await orAbort(deps.setSpeed(a.multiplier), signal);
      return 0;
    case 'custom':
      await deps.custom(a.name, a.args, signal);
      return 0;
    default:
      return 0;
  }
}

export async function runStep(step: Step, p: StepProgress, signal: AbortSignal, ctx: StepContext): Promise<void> {
  const { get, set, deps } = ctx;
  const a = step.action;
  const speed = get().speed;
  const chapter = get().script?.chapters.find((c) => c.id === step.chapter);
  // An optional target is only spotlit when it's there (v2.3: the check-in
  // button may live in the tab bar or be hidden; the action finds its way).
  let target: HTMLElement | null = null;
  if (step.target) {
    const timeout = a.kind === 'waitFor' ? (a.timeoutMs ?? 4000) : step.optionalTarget ? 800 : 4000;
    try {
      target = await findTarget(step.target, timeout, signal);
    } catch (error) {
      if (isAborted(error) || !step.optionalTarget) throw error;
    }
  }
  throwIfAborted(signal);
  if (target && !p.actionDone) target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  // Where the bar goes is decided here, once for the whole step, so it
  // never jumps from the bottom to the top under someone's finger.
  const hudTop = step.hud === 'top' || (!!target && target.getBoundingClientRect().top > window.innerHeight * 0.65);
  set({
    chapterTitle: chapter?.title ?? '',
    caption: step.caption ?? get().caption,
    hudTop,
    target: target ?? (a.kind === 'navigate' || a.kind === 'custom' ? null : get().target),
  });

  if (!p.actionDone) {
    if (target) await wait(250 / speed, signal);
    const settle = await act(step, target, p, signal, ctx);
    p.actionDone = true;
    await wait(settle, signal);
  }

  // Every caption is read when narration is on (D-2; the `narrate` flag in
  // the scripts no longer limits it), and the step lasts until both the
  // hold and the voice are done: the next caption never cuts this one off.
  // A pause aborts the voice, and play reads the caption again from the
  // start.
  const caption = step.caption;
  const narration =
    get().narration && caption && !p.narrated
      ? (async () => {
          await orAbort(ctx.ready(), signal);
          const result = await deps.speak(caption, signal);
          if (result === 'aborted' || signal.aborted) throw new AbortedError();
          ctx.note(`narration: ${result === 'skipped' ? 'skipped' : 'done'} for ${step.id}`);
          p.narrated = true;
        })()
      : Promise.resolve();
  // A caption stays up long enough to be read in a room: about a second
  // plus 50 ms a character (3.5 s for a typical one).
  const readMs = caption ? 1000 + caption.length * 50 : 0;
  const total = Math.max(step.holdMs ?? 700, readMs) / speed;
  await Promise.all([hold(p.holdLeft ?? total, signal, (left) => (p.holdLeft = left)), narration]);
}
