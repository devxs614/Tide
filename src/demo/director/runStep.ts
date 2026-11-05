// One step of the tour, from finding its target to the end of its hold.
// Demo fix pack, D-5: every wait takes the step's abort signal, so a pause
// stops it on the spot, and the step's progress records what already
// happened: a tap or a navigation is never done twice, typing continues
// from the character it reached, and the hold resumes with what was left.
// D-3: one thing at a time, in this order. The last step's spotlight and
// pointer go; the target is found, scrolled to and left to settle; the bar
// picks its place for the whole step; then the caption and the spotlight
// show together; the pointer glides and taps (or the text types, with no
// pointer); the screen settles again, any celebration plays out with the
// caption hidden; and only then does the hold start, so the result is on
// screen for all of it.
import type { DirectorDeps, EngineState } from './engine';
import type { Step } from './types';
import { click, fieldIn, findTarget, typeInto } from './actions';
import { AbortedError, hold, isAborted, nextFrame, orAbort, throwIfAborted, wait } from './abortable';
import { CURSOR_GLIDE_MS, CURSOR_TAP_MS, msPerChar, stepHold } from './pacing';
import { waitForStable } from './stable';
import { barBottom } from './placement';

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

const motionOff = () => typeof document !== 'undefined' && document.documentElement.dataset.motion === 'off';

async function settle(target: Element | null, signal: AbortSignal, ctx: StepContext, what: string) {
  const { ms, timedOut } = await waitForStable(target, { signal });
  if (timedOut) ctx.note(`stable: gave up waiting after ${Math.round(ms)} ms (${what})`);
  else if (ms > 200) ctx.note(`stable: ${Math.round(ms)} ms (${what})`);
}

// The newest sheet or dialog if one is open (what a tap usually opens),
// else the target if it's still there, else the page.
function whatChanged(target: HTMLElement | null): Element | null {
  const overlays = document.querySelectorAll('[data-slot="sheet-content"], [data-slot="dialog-content"]');
  return overlays[overlays.length - 1] ?? (target?.isConnected ? target : document.querySelector('main'));
}

// Celebrations play out before the caption's hold starts; the bar hides the
// caption while one is on screen (DirectorHUD). A big one waits for its
// Continue, so this gives up after 8 seconds and the next step carries on.
async function afterCelebration(signal: AbortSignal, ctx: StepContext) {
  if (!document.querySelector('[data-celebration]')) return;
  ctx.note('celebration: waiting for it to finish');
  const until = performance.now() + 8000;
  while (document.querySelector('[data-celebration]') && performance.now() < until) await nextFrame(signal);
}

// Where the bar goes, once for the whole step: at the top when the target
// is in the bottom third of the screen or would sit under the bar, or when
// the step says so; otherwise just above the tab bar and check-in button.
function placeBar(step: Step, target: HTMLElement | null): Pick<EngineState, 'hudTop' | 'hudBottom'> {
  const hudBottom = barBottom();
  const height = document.querySelector('[data-demo-hud]')?.getBoundingClientRect().height ?? 0;
  const rect = target?.getBoundingClientRect();
  const covered = !!rect && (rect.top > window.innerHeight * 0.65 || (height > 0 && rect.bottom > window.innerHeight - hudBottom - height - 8));
  return { hudTop: step.hud === 'top' || covered, hudBottom };
}

async function act(step: Step, target: HTMLElement | null, p: StepProgress, signal: AbortSignal, ctx: StepContext): Promise<void> {
  const { deps, get, set } = ctx;
  const a = step.action;
  const speed = get().speed;
  switch (a.kind) {
    case 'navigate':
      deps.navigate(a.path);
      p.actionDone = true;
      await wait(500, signal);
      return;
    case 'click': {
      if (!target) return;
      // The pointer glides in (not at motion Off), taps, ripples, and goes.
      const glide = motionOff() ? 0 : CURSOR_GLIDE_MS / speed;
      if (glide) {
        set({ cursor: { el: target, tap: false, ms: glide } });
        await wait(glide, signal);
      }
      click(target);
      p.actionDone = true;
      if (glide) {
        set({ cursor: { el: target, tap: true, ms: CURSOR_TAP_MS } });
        await wait(CURSOR_TAP_MS, signal);
      }
      set({ cursor: null });
      return;
    }
    case 'type': {
      if (!target) return;
      const field = fieldIn(target);
      if (field) p.typing = { field, text: a.text };
      await typeInto(target, a.text, msPerChar(a.cps, speed), { from: p.typed, signal, onChar: (n) => (p.typed = n) });
      return;
    }
    case 'wait':
      await hold(p.holdLeft ?? a.ms / speed, signal, (left) => (p.holdLeft = left));
      p.holdLeft = null;
      return;
    case 'setClock':
      await orAbort(deps.setClock(a.ts), signal);
      return;
    case 'setSpeed':
      await orAbort(deps.setSpeed(a.multiplier), signal);
      return;
    case 'custom':
      await deps.custom(a.name, a.args, signal);
      return;
    default:
      return;
  }
}

// Reads the caption when narration is on (D-2: every caption). A pause
// aborts the voice, and play reads the caption again from the start.
function narrate(step: Step, p: StepProgress, signal: AbortSignal, ctx: StepContext): Promise<void> {
  const caption = step.caption;
  if (!ctx.get().narration || !caption || p.narrated) return Promise.resolve();
  return (async () => {
    await orAbort(ctx.ready(), signal);
    const result = await ctx.deps.speak(caption, signal);
    if (result === 'aborted' || signal.aborted) throw new AbortedError();
    ctx.note(`narration: ${result === 'skipped' ? 'skipped' : 'done'} for ${step.id}`);
    p.narrated = true;
  })();
}

// The hold and the voice together: the step lasts until both are done, so
// the next caption never cuts this one off.
function holdAndNarrate(step: Step, p: StepProgress, signal: AbortSignal, ctx: StepContext): Promise<unknown> {
  return Promise.all([hold(p.holdLeft ?? stepHold(step, ctx.get().speed), signal, (left) => (p.holdLeft = left)), narrate(step, p, signal, ctx)]);
}

export async function runStep(step: Step, p: StepProgress, signal: AbortSignal, ctx: StepContext): Promise<void> {
  const { get, set } = ctx;
  const a = step.action;
  const chapter = get().script?.chapters.find((c) => c.id === step.chapter);
  // One step at a time: the last step's spotlight and pointer go first.
  set({ target: null, cursor: null });

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
  ctx.note(`${step.id}: ${target ? 'target found' : 'no target'}`);
  if (target && !p.actionDone) target.scrollIntoView({ block: 'center', behavior: motionOff() ? 'auto' : 'smooth' });
  if (target) await settle(target, signal, ctx, `${step.id} target`);

  let placed = false;
  const show = () => {
    const place = placed ? { hudTop: get().hudTop, hudBottom: get().hudBottom } : placeBar(step, target);
    set({
      ...place,
      chapterTitle: chapter?.title ?? '',
      caption: step.caption ?? get().caption,
      target,
      // The companion's page bubbles and caption bar show only in a step
      // about the companion, and not while the bar sits at the top, where
      // they live too.
      companionQuiet: !step.companion || place.hudTop,
    });
    placed = true;
  };
  // A step that points at something shows its caption and spotlight before
  // acting, so viewers see what's about to be tapped. A step with nothing
  // to point at (a chapter's setup, a page change) acts first and shows its
  // caption on the page it leads to, with the bar placed for that page;
  // unless it already says the bar goes to the top (something is about to
  // appear at the bottom, like the nudge card), which happens first.
  if (target || step.holdDuringAction) show();
  else if (step.hud === 'top') {
    set(placeBar(step, null));
    placed = true;
  }

  // The three themes share one caption: its reading time and voice run
  // while they change (D-4), not after.
  const during = step.holdDuringAction ? holdAndNarrate(step, p, signal, ctx) : null;
  // Awaited below; this only keeps a failed action from leaving it unheard.
  during?.catch(() => undefined);
  if (!p.actionDone) {
    await act(step, target, p, signal, ctx);
    p.actionDone = true;
    ctx.note(`${step.id}: acted`);
    if (a.kind !== 'waitFor' && a.kind !== 'say') await settle(whatChanged(target), signal, ctx, `${step.id} result`);
    await afterCelebration(signal, ctx);
  }
  ctx.note(`${step.id}: holding`);
  if (!target && !step.holdDuringAction) show();
  await (during ?? holdAndNarrate(step, p, signal, ctx));
}
